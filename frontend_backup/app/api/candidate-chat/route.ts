import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 });
  }
  const { candidate, history } = await req.json();
  if (!candidate || !Array.isArray(history)) {
    return NextResponse.json({ error: 'Missing candidate or history' }, { status: 400 });
  }
  const ai = new GoogleGenAI({ apiKey });
  // Compose the prompt
  const systemPrompt = `You are an expert HR assistant. You are given a candidate's structured resume data as JSON. Answer the recruiter's question based ONLY on the JSON data. If the answer is not in the data, say so.\n\nCandidate JSON:\n${JSON.stringify(candidate, null, 2)}`;
  // Use Gemini to answer the last question
  const lastQuestion = history.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
  let answer = '';
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: lastQuestion }] },
      ],
    });
    answer = res.text || '';
  } catch (e) {
    answer = 'AI failed to answer.';
  }
  return NextResponse.json({ answer });
} 