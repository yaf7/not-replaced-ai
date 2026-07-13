import { type NextRequest } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { profession } = await request.json();

    if (!profession || typeof profession !== 'string') {
      return Response.json({ error: 'Profession is required' }, { status: 400 });
    }

    const prompt = `You are an AI career analyst. Analyze the following profession/role: "${profession}"

Return a JSON response with EXACTLY this structure (no markdown, no code blocks, just raw JSON):
{
  "profession_title": "The cleaned up profession title in English",
  "threat_level": {
    "percentage": <number 0-100>,
    "verdict": "<one of: SAFE, LOW RISK, MODERATE, HIGH RISK, CRITICAL>",
    "summary": "<2-3 sentence explanation of why this percentage>",
    "timeline": "<specific prediction about what changes in 1, 3, and 5 years>"
  },
  "ai_copilot": {
    "tools": [
      {
        "name": "<AI tool name>",
        "description": "<how it helps this profession, 1 sentence>",
        "category": "<category like 'Content', 'Analytics', 'Automation', 'Design', 'Code'>"
      }
    ],
    "strategy": "<2-3 sentence strategy on how to integrate AI into daily workflow>"
  },
  "human_edge": {
    "skills": [
      {
        "name": "<skill name>",
        "description": "<why AI can't replace this, 1 sentence>",
        "icon": "<one of: brain, heart, handshake, lightbulb, shield, eye>"
      }
    ],
    "motivation": "<inspiring 2-3 sentence message about why humans are irreplaceable in this role>"
  },
  "survival_roadmap": [
    {
      "phase": "Now",
      "action": "<immediate action to take>",
      "detail": "<1 sentence detail>"
    },
    {
      "phase": "6 Months",
      "action": "<medium-term action>",
      "detail": "<1 sentence detail>"
    },
    {
      "phase": "1 Year",
      "action": "<long-term action>",
      "detail": "<1 sentence detail>"
    },
    {
      "phase": "3 Years",
      "action": "<future-proofing action>",
      "detail": "<1 sentence detail>"
    }
  ]
}

Provide exactly 4 AI tools and 4 human edge skills. Be specific, practical, and data-informed. Base the threat percentage on real industry research and trends.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      if (response.status === 429) {
        return Response.json({ error: 'Rate limit exceeded. Please wait a moment and try again.' }, { status: 429 });
      }
      return Response.json({ error: 'AI analysis failed. Please try again.' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return Response.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Clean the response - remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);

    return Response.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json({ error: 'Failed to analyze profession' }, { status: 500 });
  }
}
