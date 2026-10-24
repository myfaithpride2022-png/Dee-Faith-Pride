import type { APIRoute } from "astro";
import {
  AuthConfigurationError,
  createRequestSupabaseClient,
  isSameOriginRequest,
} from "@/lib/supabase/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isSameOriginRequest(request)) {
    return new Response(null, { status: 403 });
  }

  let supabase;
  try {
    supabase = createRequestSupabaseClient(request, cookies);
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return new Response(null, {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      });
    }
    throw error;
  }
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Unable to end admin session.", error);
    return new Response(null, {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
};
