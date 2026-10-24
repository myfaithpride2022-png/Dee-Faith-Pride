import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

function getServerEnv(name: string): string | undefined {
  if (!process.env[name]) {
    const localEnvPath = resolve(process.cwd(), ".env");
    if (existsSync(localEnvPath)) process.loadEnvFile(localEnvPath);
  }
  return process.env[name];
}

export class PublicDatabaseConfigurationError extends Error {
  constructor() {
    super("Supabase public configuration is missing.");
    this.name = "PublicDatabaseConfigurationError";
  }
}

export class DatabaseConfigurationError extends Error {
  constructor() {
    super("Supabase server configuration is missing.");
    this.name = "DatabaseConfigurationError";
  }
}

export function createPublicSupabaseClient() {
  const url =
    process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    throw new PublicDatabaseConfigurationError();
  }

  return createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function createAdminSupabaseClient() {
  const url =
    process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = getServerEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new DatabaseConfigurationError();
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
