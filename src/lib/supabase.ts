import { createClient } from "@supabase/supabase-js";

// Validate env vars exist, otherwise provide dummy URL to prevent hard crashes during development without keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock_key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
