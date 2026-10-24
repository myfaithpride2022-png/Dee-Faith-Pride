import type { APIRoute } from "astro";
import { z } from "zod";
import {
  AuthConfigurationError,
  createRequestSupabaseClient,
  getActiveStaff,
  isSameOriginRequest,
} from "@/lib/supabase/auth";

export const prerender = false;

const paymentReviewSchema = z
  .object({
    action: z.literal("review-payment"),
    submissionId: z.uuid(),
    decision: z.enum(["confirmed", "rejected"]),
    rejectionReason: z.string().trim().max(1000).optional(),
  })
  .strict();
const fulfilmentSchema = z
  .object({
    action: z.literal("update-fulfilment"),
    orderId: z.uuid(),
    status: z.enum([
      "queued",
      "processing",
      "completed",
      "failed",
      "cancelled",
    ]),
    note: z.string().trim().max(1000).optional(),
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

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isSameOriginRequest(request)) {
    return json(403, { error: "Request origin could not be verified." });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json(415, { error: "Use a JSON request body." });
  }

  let supabase;
  try {
    supabase = createRequestSupabaseClient(request, cookies);
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return json(503, { error: "Supabase authentication is not configured." });
    }
    throw error;
  }
  const staff = await getActiveStaff(supabase);
  if (!staff) return json(401, { error: "Staff sign-in is required." });

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return json(400, { error: "Request body must be valid JSON." });
    }
    throw error;
  }

  const paymentReview = paymentReviewSchema.safeParse(body);
  if (paymentReview.success) {
    if (
      paymentReview.data.decision === "rejected" &&
      !paymentReview.data.rejectionReason
    ) {
      return json(400, { error: "A reason is required to reject a payment." });
    }
    const { error } = await supabase.rpc("admin_review_payment_submission", {
      p_submission_id: paymentReview.data.submissionId,
      p_decision: paymentReview.data.decision,
      p_rejection_reason: paymentReview.data.rejectionReason || null,
    });
    if (error) {
      console.error("Admin payment review failed.", error);
      return json(error.code === "PGRST202" ? 503 : 409, {
        error:
          error.code === "PGRST202"
            ? "Apply the manual operations migration before reviewing payments."
            : "This payment could not be reviewed. Refresh the orders page and check its current status.",
      });
    }
    return json(200, {
      message:
        paymentReview.data.decision === "confirmed"
          ? "Payment confirmed manually. The order can now be fulfilled."
          : "Payment rejected. The customer must be contacted before any next step.",
    });
  }

  const fulfilment = fulfilmentSchema.safeParse(body);
  if (!fulfilment.success) {
    return json(400, { error: "Order update details are invalid." });
  }

  const { error } = await supabase.rpc("admin_update_order_fulfilment", {
    p_order_id: fulfilment.data.orderId,
    p_new_status: fulfilment.data.status,
    p_note: fulfilment.data.note || null,
  });
  if (error) {
    console.error("Admin fulfilment update failed.", error);
    return json(error.code === "PGRST202" ? 503 : 409, {
      error:
        error.code === "PGRST202"
          ? "Apply the manual operations migration before updating fulfilment."
          : "This fulfilment status could not be changed. Confirm payment and refresh the order.",
    });
  }

  return json(200, { message: "Manual fulfilment status updated." });
};
