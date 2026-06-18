import { NextResponse } from 'next/server';
import { allSchemes } from '@/lib/schemes-data';

// Build a compact text summary of ALL schemes for the LLM system prompt
function buildSchemesContext(): string {
  const lines: string[] = [];
  lines.push('=== STEPTHROUGH GOVERNMENT SCHEMES DATABASE ===');
  lines.push(`Total schemes available: ${allSchemes.length}\n`);

  const categories = [...new Set(allSchemes.map(s => s.category))];
  for (const cat of categories) {
    const schemes = allSchemes.filter(s => s.category === cat);
    lines.push(`--- ${cat.toUpperCase()} (${schemes.length} schemes) ---`);
    for (const s of schemes) {
      lines.push(`• ${s.title} | Provider: ${s.provider} | Fee: ${s.fee} | Time: ${s.estimatedTime} | Difficulty: ${s.difficulty} | Tags: ${s.tags.join(', ')}`);
      lines.push(`  "${s.tagline}"`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

const SCHEMES_CONTEXT = buildSchemesContext();

const SYSTEM_PROMPT = `You are **StepThrough AI Mentor**, an expert AI assistant embedded in the StepThrough platform — India's premier government services navigation portal.

## Your Capabilities
1. **Government Schemes Expert**: You have deep knowledge of ALL Indian government schemes, welfare programs, subsidies, scholarships, identity documents, tax filing, and public services. You know eligibility criteria, step-by-step application processes, required documents, official portal URLs, fees, and timelines.
2. **General Knowledge AI**: You can answer ANY question — math, science, coding, history, current affairs, career advice, essay writing, language translation, etc. You are a full-featured AI assistant, not limited to government schemes.
3. **Personalized Guidance**: When asked about schemes, provide actionable step-by-step instructions with official website links, required documents checklists, and pro tips.

## Response Formatting Rules
- Use clean **Markdown** formatting: headings (##, ###), bold, bullet points, numbered lists, and checkboxes (- [ ]).
- For scheme queries: include a "📋 Step-by-Step Process" section and a "📎 Required Documents" checklist.
- Include official portal URLs when relevant (e.g., passportindia.gov.in, scholarships.gov.in).
- Keep responses concise but thorough. Aim for 150-400 words.
- Use emojis sparingly for visual clarity (🏛️ 📋 ✅ ⚡ 💡).
- End scheme answers with: "💡 **Pro Tip:** You can track this in your **Roadmaps** dashboard!"

## StepThrough Schemes Database (for reference):
${SCHEMES_CONTEXT}

## Important Rules
- If the user asks about a scheme in the database, use that data plus your training knowledge to give an expert answer.
- If the user asks about a scheme NOT in the database, still answer using your general knowledge of Indian government services.
- If the user asks a non-scheme question (math, coding, general knowledge), answer it directly and helpfully.
- Never say "I don't know" or "I can't help." Always provide the best possible answer.
- Be warm, professional, and encouraging. Citizens navigating bureaucracy need confidence.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, messages: chatHistory } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Question is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      );
    }

    // Build Gemini conversation contents
    const contents: { role: string; parts: { text: string }[] }[] = [];

    // Add conversation history if provided (for multi-turn chat)
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      for (const msg of chatHistory) {
        if (msg.role === 'user') {
          contents.push({ role: 'user', parts: [{ text: msg.text }] });
        } else if (msg.role === 'assistant' || msg.role === 'model') {
          contents.push({ role: 'model', parts: [{ text: msg.text }] });
        }
      }
    }

    // Add the current user message
    contents.push({ role: 'user', parts: [{ text: question }] });

    // Try multiple models in order (fallback chain)
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
    
    const requestBody = JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents,
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    });

    let geminiData: any = null;
    let lastError = '';

    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
          signal: AbortSignal.timeout(15000),
        });

        if (geminiResponse.ok) {
          geminiData = await geminiResponse.json();
          console.log(`Gemini response from model: ${model}`);
          break;
        } else {
          lastError = `${model} returned ${geminiResponse.status}`;
          console.warn(`Model ${model} failed: ${lastError}`);
        }
      } catch (fetchErr: any) {
        lastError = `${model}: ${fetchErr.message}`;
        console.warn(`Model ${model} fetch error:`, fetchErr.message);
      }
    }

    if (!geminiData) {
      return NextResponse.json(
        { success: false, error: `All Gemini models failed. Last error: ${lastError}` },
        { status: 502 }
      );
    }

    const answerText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I apologize, but I could not generate a response. Please try rephrasing your question.';

    return NextResponse.json({
      success: true,
      data: { answer: answerText },
    });
  } catch (err: any) {
    console.error('Error in /api/schemes/ask:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (err.message || 'Unknown') },
      { status: 500 }
    );
  }
}
