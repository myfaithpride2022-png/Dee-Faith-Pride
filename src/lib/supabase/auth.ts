import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type CookieStore = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options?: CookieOptions): void;
};

export type StaffProfile = {
  id: string;
  display_name: string;
  email: string;
  role: "admin" | "staff";
  is_active: boolean;
};

export class AuthConfigurationError extends Error {
  constructor() {
    super("Supabase authentication configuration is missing.");
    this.name = "AuthConfigurationError";
  }
}

export class StaffProfileLookupError extends Error {
  constructor() {
    super("Unable to verify staff access.");
    this.name = "StaffProfileLookupError";
  }
}

export function createRequestSupabaseClient(
  request: Request,
  cookies: CookieStore,
) {
  const url =
    process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !publishableKey) throw new AuthConfigurationError();
  const siteUrl =
    process.env.PUBLIC_SITE_URL || import.meta.env.PUBLIC_SITE_URL;
  const secureCookies = siteUrl
    ? new URL(siteUrl).protocol === "https:"
    : new URL(request.url).protocol === "https:";

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () =>
        (request.headers.get("cookie") ?? "")
          .split(";")
          .map((part) => part.trim().split("=")[0])
          .filter(Boolean)
          .map((name) => ({ name, value: cookies.get(name)?.value ?? "" })),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          cookies.set(name, value, {
            ...options,
            httpOnly: true,
            secure: secureCookies,
            sameSite: "lax",
            path: "/",
          });
        }
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export async function getActiveStaff(
  supabase: SupabaseClient<Database>,
): Promise<{ user: User; profile: StaffProfile } | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, email, role, is_active")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Unable to verify staff profile.", profileError);
    throw new StaffProfileLookupError();
  }
  if (!profile || !profile.is_active) return null;

  return { user: userData.user, profile };
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
