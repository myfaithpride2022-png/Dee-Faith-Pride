import type { APIRoute } from "astro";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import {
  createAdminSupabaseClient,
  DatabaseConfigurationError,
} from "@/lib/supabase/server";
import {
  calculateFixedPrice,
  validateServiceDetails,
} from "@/lib/orders/validation";

export const prerender = false;

const orderRequestSchema = z
  .object({
    serviceSlug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100),
    customerName: z.string().trim().min(2).max(120),
    customerEmail: z.union([z.email(), z.literal("")]).optional(),
    customerPhone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s()-]{6,24}$/),
    serviceDetails: z.record(
      z.string().regex(/^[a-z][a-z0-9_]{0,39}$/),
      z.string().max(500),
    ),
    customerNotes: z.string().trim().max(1000).optional(),
  })
  .strict();

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let untrustedBody: unknown;
  try {
    untrustedBody = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return json(400, { error: "Request body must be valid JSON." });
    }
    throw error;
  }

  const parsedRequest = orderRequestSchema.safeParse(untrustedBody);
  if (!parsedRequest.success) {
    return json(400, { error: "Order details are invalid." });
  }

  let supabase;
  try {
    supabase = createAdminSupabaseClient();
  } catch (error) {
    if (error instanceof DatabaseConfigurationError) {
      return json(503, {
        error:
          "Order submission is not available until the business service is configured.",
      });
    }
    throw error;
  }

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select(
      "id, name, form_schema, pricing_type, base_price_minor, service_fee_minor",
    )
    .eq("slug", parsedRequest.data.serviceSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (serviceError) {
    console.error("Unable to load service for order submission.", serviceError);
    return json(500, {
      error: "The service could not be checked. Please try again later.",
    });
  }
  if (!service) {
    return json(404, { error: "This service is not currently available." });
  }

  const details = validateServiceDetails(
    service.form_schema,
    parsedRequest.data.serviceDetails,
  );
  if (!details.success) {
    return json(400, { error: details.message });
  }

  const amounts = calculateFixedPrice(
    service.pricing_type,
    service.base_price_minor,
    service.service_fee_minor,
  );
  if (!amounts) {
    return json(409, {
      error:
        "This service needs a confirmed price before an order can be placed.",
    });
  }

  const trackingToken = randomBytes(32).toString("base64url");
  const trackingTokenHash = createHash("sha256")
    .update(trackingToken)
    .digest("hex");
  const orderReference = `DFP-${new Date().getUTCFullYear()}-${randomBytes(8).toString("hex").toUpperCase()}`;

  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({
      order_reference: orderReference,
      tracking_token_hash: trackingTokenHash,
      customer_name: parsedRequest.data.customerName,
      customer_email: parsedRequest.data.customerEmail || null,
      customer_phone: parsedRequest.data.customerPhone,
      service_id: service.id,
      service_name_snapshot: service.name,
      service_details: details.data,
      subtotal_minor: amounts.subtotalMinor,
      service_fee_minor: amounts.serviceFeeMinor,
      total_minor: amounts.totalMinor,
      currency: "NGN",
      payment_status: "unpaid",
      fulfilment_status: "not_started",
      customer_notes: parsedRequest.data.customerNotes || null,
    })
    .select("id, order_reference, total_minor, currency, created_at")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return json(409, {
        error: "Order reference collision. Please submit again.",
      });
    }
    console.error("Order persistence failed.", insertError);
    return json(500, {
      error: "The order could not be saved. Please try again later.",
    });
  }

  return json(201, {
    order: {
      id: order.id,
      reference: order.order_reference,
      totalMinor: order.total_minor,
      currency: order.currency,
      createdAt: order.created_at,
    },
    trackingToken,
    message:
      "Order received. Payment instructions must be confirmed by the business; do not make a payment using unverified details.",
  });
};
