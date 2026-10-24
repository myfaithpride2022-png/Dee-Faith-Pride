import type { APIRoute } from "astro";
import { createHash } from "node:crypto";
import { z } from "zod";
import { parseNairaToMinorUnits } from "@/lib/orders/validation";
import {
  createPublicSupabaseClient,
  PublicDatabaseConfigurationError,
} from "@/lib/supabase/server";
import { isSameOriginRequest } from "@/lib/supabase/auth";

export const prerender = false;

const paymentReportSchema = z
  .object({
    orderReference: z.string().trim().min(1).max(40),
    trackingToken: z.string().min(40).max(64),
    amountNaira: z.string().trim().max(20),
    paymentReference: z.string().trim().max(120).optional(),
    paymentDate: z.union([z.iso.date(), z.literal("")]).optional(),
    customerNote: z.string().trim().max(1000).optional(),
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
  if (!isSameOriginRequest(request)) {
    return json(403, { error: "Request origin could not be verified." });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json(415, { error: "Use a JSON request body." });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return json(400, { error: "Request body must be valid JSON." });
    }
    throw error;
  }

  const parsed = paymentReportSchema.safeParse(body);
  if (!parsed.success) {
    return json(400, { error: "Payment report details are invalid." });
  }
  const amountMinor = parseNairaToMinorUnits(parsed.data.amountNaira);
  if (!amountMinor || BigInt(amountMinor) <= 0n) {
    return json(400, { error: "Enter a valid amount paid." });
  }

  let supabase;
  try {
    supabase = createPublicSupabaseClient();
  } catch (error) {
    if (error instanceof PublicDatabaseConfigurationError) {
      return json(503, {
        error: "Payment reporting is temporarily unavailable.",
      });
    }
    throw error;
  }

  const trackingTokenHash = createHash("sha256")
    .update(parsed.data.trackingToken)
    .digest("hex");
  const { error } = await supabase.rpc("submit_manual_payment_report", {
    p_order_reference: parsed.data.orderReference,
    p_tracking_token_hash: trackingTokenHash,
    p_amount_reported_minor: Number(amountMinor),
    p_payment_reference: parsed.data.paymentReference || null,
    p_payment_date: parsed.data.paymentDate || null,
    p_customer_note: parsed.data.customerNote || null,
  });

  if (error) {
    console.error("Manual payment report submission failed.", error);
    return json(error.code === "PGRST202" ? 503 : 409, {
      error:
        error.code === "PGRST202"
          ? "Payment reporting is not available until the business applies its manual operations migration."
          : "We could not submit this report. Check the order details and amount, or contact the business for help.",
    });
  }

  return json(200, {
    message:
      "Payment details received. An administrator must verify the payment manually before fulfilment begins.",
  });
};
