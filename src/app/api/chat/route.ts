import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// We use the same API key as the quiz generation
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ reply: "I'm currently running in offline mode, but I'm here to help! Please configure my API key to unlock my full knowledge." });
    }

    const { messages, topic } = await req.json();
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format previous messages for the model
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history,
      systemInstruction: `You are TEACH EDISON's AI Learning Assistant. The user is currently taking a quiz on the topic: "${topic}". Provide short, concise, and helpful answers without giving away the direct answer to their current quiz question if possible. Guide them to think critically. Limit your response to 2-3 sentences max.`,
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { reply: "I encountered a neural bridge error while thinking. Let's try that again." },
      { status: 200 } // Return 200 so the UI doesn't crash, just shows the error message friendly
    );
  }
}
