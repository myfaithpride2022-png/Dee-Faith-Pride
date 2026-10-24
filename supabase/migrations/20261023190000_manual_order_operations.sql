create or replace function public.admin_review_payment_submission(
  p_submission_id uuid,
  p_decision text,
  p_rejection_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_submission public.payment_submissions%rowtype;
  v_order public.orders%rowtype;
  v_reason text := nullif(btrim(p_rejection_reason), '');
begin
  if v_actor is null or not exists (
    select 1
    from public.profiles
    where id = v_actor
      and is_active = true
      and role in ('admin', 'staff')
  ) then
    raise exception 'Active staff access is required.';
  end if;

  if p_decision is null or p_decision not in ('confirmed', 'rejected') then
    raise exception 'Unsupported payment review decision.';
  end if;

  if p_decision = 'rejected' and (v_reason is null or length(v_reason) > 1000) then
    raise exception 'A rejection reason of at most 1000 characters is required.';
  end if;

  select *
  into v_submission
  from public.payment_submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'Payment submission was not found.';
  end if;

  select *
  into v_order
  from public.orders
  where id = v_submission.order_id
  for update;

  if v_submission.status not in ('submitted', 'under_review')
    or v_order.payment_status not in ('submitted', 'under_review') then
    raise exception 'Payment submission is no longer awaiting review.';
  end if;

  if p_decision = 'confirmed' and v_order.fulfilment_status = 'cancelled' then
    raise exception 'Payment cannot be confirmed for a cancelled order.';
  end if;

  if v_submission.amount_reported_minor <> v_order.total_minor then
    raise exception 'Reported payment does not match the order total.';
  end if;

  update public.payment_submissions
  set status = p_decision::public.payment_submission_status,
      reviewed_by = v_actor,
      reviewed_at = now(),
      rejection_reason = case when p_decision = 'rejected' then v_reason else null end
  where id = v_submission.id;

  update public.orders
  set payment_status = p_decision::public.payment_status
  where id = v_order.id;

  insert into public.payment_events (
    order_id, payment_submission_id, actor_id, event_type, reason, metadata
  ) values (
    v_order.id,
    v_submission.id,
    v_actor,
    p_decision,
    v_reason,
    jsonb_build_object('amount_reported_minor', v_submission.amount_reported_minor)
  );

  insert into public.order_events (
    order_id, actor_id, event_type, previous_status, new_status, note
  ) values (
    v_order.id,
    v_actor,
    'payment_' || p_decision,
    v_order.payment_status::text,
    p_decision,
    v_reason
  );

  insert into public.audit_logs (actor_id, action, entity_type, entity_id)
  values (v_actor, 'payment_' || p_decision, 'payment_submission', v_submission.id);
end;
$$;

create or replace function public.admin_update_order_fulfilment(
  p_order_id uuid,
  p_new_status text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_order public.orders%rowtype;
  v_note text := nullif(btrim(p_note), '');
  v_transition_allowed boolean := false;
begin
  if v_actor is null or not exists (
    select 1
    from public.profiles
    where id = v_actor
      and is_active = true
      and role in ('admin', 'staff')
  ) then
    raise exception 'Active staff access is required.';
  end if;

  if p_new_status is null
    or p_new_status not in ('queued', 'processing', 'completed', 'failed', 'cancelled')
    or length(coalesce(v_note, '')) > 1000 then
    raise exception 'Fulfilment update is invalid.';
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order was not found.';
  end if;

  v_transition_allowed := case v_order.fulfilment_status
    when 'not_started' then p_new_status in ('queued', 'cancelled')
    when 'queued' then p_new_status in ('processing', 'cancelled')
    when 'processing' then p_new_status in ('completed', 'failed', 'cancelled')
    when 'failed' then p_new_status in ('processing', 'cancelled')
    else false
  end;

  if not v_transition_allowed then
    raise exception 'Fulfilment status transition is not allowed.';
  end if;

  if p_new_status <> 'cancelled' and v_order.payment_status <> 'confirmed' then
    raise exception 'Payment must be manually confirmed before fulfilment.';
  end if;

  update public.orders
  set fulfilment_status = p_new_status::public.fulfilment_status
  where id = v_order.id;

  insert into public.order_events (
    order_id, actor_id, event_type, previous_status, new_status, note
  ) values (
    v_order.id,
    v_actor,
    'fulfilment_status_changed',
    v_order.fulfilment_status::text,
    p_new_status,
    v_note
  );

  insert into public.audit_logs (actor_id, action, entity_type, entity_id)
  values (v_actor, 'fulfilment_status_changed', 'order', v_order.id);
end;
$$;

create or replace function public.submit_manual_payment_report(
  p_order_reference text,
  p_tracking_token_hash text,
  p_amount_reported_minor bigint,
  p_payment_reference text default null,
  p_payment_date date default null,
  p_customer_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_submission_id uuid;
  v_payment_reference text := nullif(btrim(p_payment_reference), '');
  v_customer_note text := nullif(btrim(p_customer_note), '');
begin
  if p_order_reference is null or length(p_order_reference) > 40
    or p_tracking_token_hash is null
    or p_tracking_token_hash !~ '^[a-f0-9]{64}$'
    or p_amount_reported_minor is null or p_amount_reported_minor <= 0
    or length(coalesce(v_payment_reference, '')) > 120
    or length(coalesce(v_customer_note, '')) > 1000 then
    raise exception 'Payment report is invalid.';
  end if;

  select *
  into v_order
  from public.orders
  where order_reference = p_order_reference
    and tracking_token_hash = p_tracking_token_hash
  for update;

  if not found then
    raise exception 'Order could not be verified.';
  end if;

  if p_amount_reported_minor <> v_order.total_minor
    or v_order.payment_status not in ('unpaid', 'rejected')
    or v_order.fulfilment_status = 'cancelled' then
    raise exception 'Payment report is not valid for this order.';
  end if;

  if exists (
    select 1
    from public.payment_submissions
    where order_id = v_order.id
      and status in ('submitted', 'under_review')
  ) then
    raise exception 'A payment report is already awaiting review.';
  end if;

  insert into public.payment_submissions (
    order_id, amount_reported_minor, payment_reference, payment_date,
    customer_note
  ) values (
    v_order.id, p_amount_reported_minor, v_payment_reference, p_payment_date,
    v_customer_note
  )
  returning id into v_submission_id;

  update public.orders
  set payment_status = 'submitted'
  where id = v_order.id;

  insert into public.payment_events (
    order_id, payment_submission_id, event_type, transaction_reference, metadata
  ) values (
    v_order.id,
    v_submission_id,
    'submitted',
    v_payment_reference,
    jsonb_build_object('amount_reported_minor', p_amount_reported_minor)
  );

  insert into public.order_events (
    order_id, event_type, previous_status, new_status
  ) values (
    v_order.id,
    'payment_submitted',
    v_order.payment_status::text,
    'submitted'
  );

  return v_submission_id;
end;
$$;

revoke all on function public.admin_review_payment_submission(uuid, text, text)
  from public, anon;
grant execute on function public.admin_review_payment_submission(uuid, text, text)
  to authenticated;

revoke all on function public.admin_update_order_fulfilment(uuid, text, text)
  from public, anon;
grant execute on function public.admin_update_order_fulfilment(uuid, text, text)
  to authenticated;

revoke all on function public.submit_manual_payment_report(text, text, bigint, text, date, text)
  from public;
grant execute on function public.submit_manual_payment_report(text, text, bigint, text, date, text)
  to anon, authenticated;

revoke insert, update, delete on public.orders, public.payment_submissions
  from authenticated, anon;
grant select on public.orders, public.payment_submissions to authenticated;

revoke insert, update, delete on public.payment_events, public.order_events,
  public.audit_logs from authenticated, anon;
grant select on public.payment_events, public.order_events, public.audit_logs
  to authenticated;
