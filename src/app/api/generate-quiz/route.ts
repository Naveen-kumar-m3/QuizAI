import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-lite"] as const;
const MAX_RETRIES = 2;

// In-memory cache (TTL 1 hour) - reduces API calls for repeated requests
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

function cacheKey(topic: string, difficulty: string, count: number, types: string): string {
  return `quiz:${topic.toLowerCase()}:${difficulty}:${count}:${types}`;
}

function extractJSON(text: string): unknown[] {
  let raw = text.trim();
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) raw = jsonMatch[1].trim();
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) raw = raw.slice(start, end + 1);
  return JSON.parse(raw) as unknown[];
}

function buildPrompt(
  topic: string,
  difficulty: string,
  count: number,
  questionTypes: string[]
): string {
  const typesDesc = questionTypes.includes("true_false") || questionTypes.includes("fill_blank")
    ? `Include: ${questionTypes.includes("multiple_choice") ? "multiple choice (4 options), " : ""}${questionTypes.includes("true_false") ? "true/false, " : ""}${questionTypes.includes("fill_blank") ? "fill-in-the-blank (options: []), " : ""}`
    : "";

  return `Generate a ${difficulty} level quiz about "${topic}" with exactly ${count} questions.
${typesDesc}
Rules:
1. Cover diverse sub-topics.
2. Use plausible distractors for multiple choice.
3. Provide brief explanation (2 sentences) per question.
4. For fill_blank: use "answer" as the exact expected answer; options can be [].
5. For true_false: options must be ["True","False"]; correctAnswer "True" or "False".

Return ONLY a JSON array (no markdown):
[{"type":"multiple_choice|true_false|fill_blank","question":"...","options":["A","B","C","D"] or ["True","False"] or [],"correctAnswer":"exact string","explanation":"..."}]`;
}

function normalizeQuestion(q: Record<string, unknown>): Record<string, unknown> {
  const type = (String(q.type ?? "multiple_choice") as "multiple_choice" | "true_false" | "fill_blank");
  let options: string[] = Array.isArray(q.options) ? q.options.map(String) : [];
  if (type === "true_false" && options.length !== 2) options = ["True", "False"];
  if (type === "fill_blank") options = [];
  const answer = String(q.correctAnswer ?? q.answer ?? "");
  return {
    id: q.id ?? crypto.randomUUID(),
    type,
    question: String(q.question ?? ""),
    options,
    correctAnswer: answer,
    answer,
    explanation: q.explanation ? String(q.explanation) : undefined,
  };
}

function validateQuestions(parsed: unknown[]): parsed is Record<string, unknown>[] {
  if (!Array.isArray(parsed) || parsed.length === 0) return false;
  for (const q of parsed) {
    if (!q || typeof q !== "object") return false;
    const o = q as Record<string, unknown>;
    if (!o.question || typeof o.question !== "string") return false;
  }
  return true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, count, difficulty, questionTypes = ["multiple_choice"] } = body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const numCount = Math.min(20, Math.max(5, parseInt(String(count), 10) || 5));
    const diff = ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium";
    const types = Array.isArray(questionTypes)
      ? questionTypes.filter((t: string) => ["multiple_choice", "true_false", "fill_blank"].includes(t))
      : ["multiple_choice"];
    if (types.length === 0) types.push("multiple_choice");

    const key = cacheKey(topic, diff, numCount, types.sort().join(","));
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json({ questions: cached.data, status: "SUCCESS", cached: true });
    }

    if (!apiKey || !genAI) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is required. Add it to .env.local" },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(topic, diff, numCount, types);
    let lastError = "";

    for (const modelName of MODELS) {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.8,
              maxOutputTokens: 8192,
            },
          });

          const text = result.response.text();
          if (!text) throw new Error("Empty response");

          const parsed = extractJSON(text);
          if (!validateQuestions(parsed)) throw new Error("Invalid quiz structure");

          const questions = parsed.map((q) => normalizeQuestion(q as Record<string, unknown>));
          const output = { questions, status: "SUCCESS" as const };
          cache.set(key, { data: questions, expires: Date.now() + CACHE_TTL_MS });
          return NextResponse.json(output);
        } catch (err: unknown) {
          lastError = err instanceof Error ? err.message : String(err);
          if (attempt < MAX_RETRIES) await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }

    throw new Error(`Quiz generation failed. ${lastError}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
