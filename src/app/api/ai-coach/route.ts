import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set in .env.local' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages payload' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: `You are an expert AI productivity coach inside a habit & task tracking app called Zenith.
You have access to the user's real data:
${context}

Your role:
- Give personalized, actionable advice based on their actual habit and task data
- Be encouraging but honest about areas needing improvement
- Keep responses concise (2-4 sentences max) but impactful
- Use relevant emojis sparingly
- Reference their specific habits, streaks, and scores when relevant
- Never make up data — only use what's provided above`,
    });

    // Filter out the first coach greeting from history (it's not a real Gemini turn)
    const history = messages.slice(0, -1)
      .filter((m: { role: string; text: string }) => m.role === 'user' || m.role === 'coach')
      .map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1].text;
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error('[AI Coach] Gemini error:', err instanceof Error ? err.message.replace(/[\r\n]/g, '') : 'Unknown error');
    return NextResponse.json(
      { error: err?.message ?? 'Failed to get a response from Gemini' },
      { status: 500 }
    );
  }
}
