import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ hint: "AI hints unavailable. Configure GEMINI_API_KEY." });
    }

    const { question, options, topic } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `Topic: "${topic}". Question: "${question}". Options: ${JSON.stringify(options)}. Give a SHORT hint (1-2 sentences) that helps the user think without revealing the answer. Do NOT say which option is correct.`
        }]
      }],
      generationConfig: { maxOutputTokens: 100, temperature: 0.5 }
    });

    const hint = result.response.text()?.trim() || "Consider the key concepts in the question.";
    return NextResponse.json({ hint });
  } catch {
    return NextResponse.json({ hint: "Analyze the key terms and concepts in the question." });
  }
}
