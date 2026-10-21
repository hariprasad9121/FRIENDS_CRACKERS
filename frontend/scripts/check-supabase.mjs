/**
 * Run: node scripts/check-supabase.mjs
 * Loads frontend/.env.local and tests categories table.
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or publishable key in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);
const { data, error } = await supabase.from("categories").select("id").limit(1);

if (error) {
  console.error("Supabase error:", error.message);
  console.error("If the table is missing, run supabase/migrations/*.sql in the SQL Editor.");
  process.exit(1);
}

console.log("Supabase connected. Sample categories query OK.", data);
