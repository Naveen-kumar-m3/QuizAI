import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic") ?? "";
    const difficulty = searchParams.get("difficulty") ?? "";
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { entries: [], message: "Leaderboard not configured. Add Supabase env vars." },
        { status: 200 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let query = supabase
      .from("leaderboard")
      .select("username, score_percent, time_taken_seconds, topic, difficulty, created_at")
      .order("score_percent", { ascending: false })
      .order("time_taken_seconds", { ascending: true, nullsFirst: false })
      .limit(limit);

    if (topic) query = query.eq("topic", topic);
    if (difficulty) query = query.eq("difficulty", difficulty);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { entries: [], error: error.message },
        { status: 200 }
      );
    }

    return NextResponse.json({ entries: data ?? [] });
  } catch (e) {
    return NextResponse.json({ entries: [] }, { status: 200 });
  }
}
