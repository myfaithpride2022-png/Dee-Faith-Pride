import type { APIRoute } from "astro";
import { z } from "zod";
import {
  AuthConfigurationError,
  createRequestSupabaseClient,
  getActiveStaff,
  isSameOriginRequest,
} from "@/lib/supabase/auth";

export const prerender = false;

const credentialsSchema = z
  .object({
    email: z.email().max(254),
    password: z.string().min(1).max(256),
  })
  .strict();

function json(status: number, body: Record<string, string>) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return json(400, { error: "Request body must be valid JSON." });
    }
    throw error;
  }
  const parsed = credentialsSchema.safeParse(body);
  if (!parsed.success) {
    return json(400, { error: "Enter a valid email and password." });
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
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return json(401, { error: "Email or password is incorrect." });
  }

  const staff = await getActiveStaff(supabase);
  if (!staff) {
    await supabase.auth.signOut();
    return json(403, {
      error: "This account is not authorized for staff access.",
    });
  }

  return json(200, { message: "Signed in.", redirect: "/admin" });
};
