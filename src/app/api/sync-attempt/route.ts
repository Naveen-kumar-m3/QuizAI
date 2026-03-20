import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ ok: false, error: "No auth" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
    }

    const body = await req.json();
    const { topic, difficulty, score, totalQuestions, timeTakenSeconds, questions, userAnswers } = body;

    if (!topic || score == null || !totalQuestions || !questions || !userAnswers) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const scorePercent = Math.round((score / totalQuestions) * 100);
    const username = user.user_metadata?.username ?? user.email?.split("@")[0] ?? "Anonymous";

    const { error: attemptError } = await supabase.from("quiz_attempts").insert({
      user_id: user.id,
      topic,
      difficulty,
      score,
      total_questions: totalQuestions,
      time_taken_seconds: timeTakenSeconds ?? null,
      questions,
      user_answers: userAnswers,
    });

    if (attemptError) {
      return NextResponse.json({ ok: false, error: attemptError.message }, { status: 500 });
    }

    const { error: lbError } = await supabase.from("leaderboard").insert({
      user_id: user.id,
      username,
      topic,
      difficulty,
      score_percent: scorePercent,
      time_taken_seconds: timeTakenSeconds ?? null,
    });

    if (lbError) {
      // Non-fatal - attempt was saved
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
