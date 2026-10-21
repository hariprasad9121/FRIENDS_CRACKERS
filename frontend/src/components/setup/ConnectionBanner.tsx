import Link from "next/link";
import { getSupabaseEnv } from "@/lib/supabase/config";

export function ConnectionBanner() {
  const { isConfigured, missingUrl, missingKey } = getSupabaseEnv();

  if (isConfigured) return null;

  return (
    <div className="border-b border-orange/30 bg-orange/10 px-4 py-2 text-center text-sm text-navy">
      <strong>Supabase setup:</strong>{" "}
      {missingUrl && (
        <>
          Set <code className="rounded bg-white/60 px-1">NEXT_PUBLIC_SUPABASE_URL</code> in{" "}
          <code className="rounded bg-white/60 px-1">frontend/.env.local</code> (Dashboard → Settings →
          API → Project URL).{" "}
        </>
      )}
      {missingKey && (
        <>
          Add your{" "}
          <code className="rounded bg-white/60 px-1">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{" "}
          (starts with <code className="rounded bg-white/60 px-1">sb_publishable_</code>).{" "}
        </>
      )}
      See{" "}
      <Link
        href="https://supabase.com/dashboard/project/_/settings/api"
        className="font-semibold underline"
      >
        Supabase API settings
      </Link>
      . Restart <code className="rounded bg-white/60 px-1">npm run dev</code> after saving.
    </div>
  );
}
