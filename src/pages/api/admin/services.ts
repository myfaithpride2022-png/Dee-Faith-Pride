import type { APIRoute } from "astro";
import { z } from "zod";
import {
  parseNairaToMinorUnits,
  parseServiceForm,
} from "@/lib/orders/validation";
import {
  AuthConfigurationError,
  createRequestSupabaseClient,
  getActiveStaff,
  isSameOriginRequest,
} from "@/lib/supabase/auth";
import type { Json } from "@/lib/supabase/database.types";

export const prerender = false;

const serviceInputSchema = z
  .object({
    id: z.uuid().optional(),
    name: z.string().trim().min(2).max(120),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100),
    categoryId: z.union([z.uuid(), z.literal("")]),
    description: z.string().trim().max(2000),
    instructions: z.string().trim().max(2000),
    formSchema: z.string().max(10000),
    pricingType: z.enum(["fixed", "quotation"]),
    basePriceNaira: z.string().max(20),
    serviceFeeNaira: z.string().max(20),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
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
  const parsed = serviceInputSchema.safeParse(body);
  if (!parsed.success) {
    return json(400, { error: "Service details are invalid." });
  }

  let formSchema: unknown;
  try {
    formSchema = JSON.parse(parsed.data.formSchema);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return json(400, { error: "Service form must contain valid JSON." });
    }
    throw error;
  }
  if (!parseServiceForm(formSchema)) {
    return json(400, {
      error: "Service form must contain valid, unique field definitions.",
    });
  }

  const serviceFeeMinor = parseNairaToMinorUnits(parsed.data.serviceFeeNaira);
  const basePriceMinor =
    parsed.data.pricingType === "fixed"
      ? parseNairaToMinorUnits(parsed.data.basePriceNaira)
      : null;
  if (
    serviceFeeMinor === null ||
    (parsed.data.pricingType === "fixed" && basePriceMinor === null)
  ) {
    return json(400, {
      error: "Enter valid prices with no more than two decimal places.",
    });
  }

  const values = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    category_id: parsed.data.categoryId || null,
    description: parsed.data.description,
    instructions: parsed.data.instructions,
    form_schema: formSchema as Json,
    pricing_type: parsed.data.pricingType,
    base_price_minor: basePriceMinor,
    service_fee_minor: serviceFeeMinor,
    is_active: parsed.data.isActive,
    is_featured: parsed.data.isFeatured,
  };

  const mutation = parsed.data.id
    ? supabase
        .from("services")
        .update(values)
        .eq("id", parsed.data.id)
        .select("id")
        .maybeSingle()
    : supabase.from("services").insert(values).select("id").single();
  const { data, error } = await mutation;

  if (error) {
    console.error("Admin service save failed.", error);
    if (error.code === "23505") {
      return json(409, { error: "That service slug is already in use." });
    }
    return json(500, { error: "The service could not be saved." });
  }
  if (!data) return json(404, { error: "The service no longer exists." });

  return json(200, { id: data.id, message: "Service saved." });
};
