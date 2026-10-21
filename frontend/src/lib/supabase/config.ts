const PLACEHOLDER_HOSTS = ["example.supabase.co", "your-project.supabase.co"];

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    "";

  let host = "";
  try {
    host = url ? new URL(url).hostname : "";
  } catch {
    host = "";
  }

  const isPlaceholderKey =
    !publishableKey ||
    publishableKey.includes("placeholder") ||
    publishableKey === "your-anon-key" ||
    publishableKey.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30");

  const isPlaceholder =
    !url || PLACEHOLDER_HOSTS.includes(host) || isPlaceholderKey;

  return {
    url,
    publishableKey,
    /** Legacy env name; same value as publishableKey */
    anonKey: publishableKey,
    isConfigured: !isPlaceholder,
    missingUrl: !url || PLACEHOLDER_HOSTS.includes(host),
    missingKey: isPlaceholderKey,
  };
}
