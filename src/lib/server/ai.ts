import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';

// 1. Initialize Groq client
const groq = new Groq({ apiKey: GROQ_API_KEY });

// 2. The "god-tier" English prompt
const SYSTEM_PROMPT = `
You are a world-class X (Twitter) profile auditor.
Your sole task is to help creators optimize their profiles.
The user will provide their profile data as a JSON object.
Analyze this data and return ONLY a single JSON object (no other text) with the following structure:

{
  "targetAudience": "A concise string describing the ideal target audience (e.g., 'Early-stage SaaS founders', 'Indie Hackers', 'Front-end Developers')",
  "keyScores": {
    "nicheClarity": <integer 0-100>,
    "offerClarity": <integer 0-100>,
    "monetization": <integer 0-100>
  },
  "leaks": ["<string for leak 1>", "<string for leak 2>", "<string for leak 3>"],
  "tips": ["<string for tip 1>", "<string for tip 2>", "<string for tip 3>"]
}

SCORING & ANALYSIS RULES:
- targetAudience: Infer from the Bio and recent tweets. Who are they speaking to?
- nicheClarity (0-100): Based on Bio + recent tweet consistency. Are they focused on 1-2 core topics?
- offerClarity (0-100): Based on Bio + Pinned Tweet. Is it clear WHO they help and WHAT they do/sell?
- monetization (0-100): Based on Bio (has link) and Pinned Tweet (has link/CTA). High score for a clear call-to-action or funnel.
- leaks: The top 3 BIGGEST problems causing them to lose followers or money.
- tips: The top 3 most actionable, high-priority tips to fix those exact leaks.
- Keep all string feedback concise, direct, and actionable.
`;

// 3. Define the payload type
interface LlmPayload {
  bio: string;
  pinned_tweet_text: string | null;
  recent_tweets: string[];
  follower_count: number;
}

/**
 * The separated Groq call function
 * Takes the payload, returns the parsed JSON analysis
 */
export async function getAIAnalysis(payload: LlmPayload) {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(payload) }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      seed: 1811
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('Groq returned an empty response');
    }

    // Parse the JSON string Groq returns
    const aiAnalysis = JSON.parse(completion.choices[0].message.content);
    return aiAnalysis;

  } catch (llmError: any) {
    console.error("Error from Groq API:", llmError);
    // Throw the error up to the server route
    throw new Error(`Failed to get AI analysis: ${llmError.message}`);
  }
}
