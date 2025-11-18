import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';

// 1. Initialize Groq client
const groq = new Groq({ apiKey: GROQ_API_KEY });

// 2. The "god-tier" English prompt
const SYSTEM_PROMPT = `
You are a world-class X (Twitter) profile auditor.
Your sole task is to help creators optimize their profiles.
The user will provide their profile data as a JSON object (including 'isBlueVerified').

Analyze this data and return ONLY a single JSON object (no other text) with the following structure:

{
  "targetAudience": "A concise string describing the ideal target audience",
  "keyScores": {
    "nicheClarity": <integer 0-100>,
    "offerClarity": <integer 0-100>,
    "monetization": <integer 0-100>
  },
  "leaks": ["<specific leak 1>", "<specific leak 2>", "<specific leak 3>"],
  "tips": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"]
}

SCORING & ANALYSIS RULES:
1. targetAudience: Infer from Bio + recent tweets.
2. nicheClarity (0-100): High if tweets consistently match the Bio's topic. Low if timeline is messy/random.
3. offerClarity (0-100): High if Bio + Pinned Tweet clearly explain WHO they help and WHAT result they deliver.
4. monetization (0-100): 
   - Base this mainly on Content (Links in Bio? CTA in Pinned Tweet?).
   - If 'isBlueVerified' is TRUE: Add a 10-point bonus for trust.
   - If 'isBlueVerified' is FALSE: Do NOT penalize score heavily (content is king).

CRITICAL RULES FOR 'LEAKS' & 'TIPS':
- IF 'isBlueVerified' IS TRUE: **NEVER** mention verification, blue check, or premium in 'leaks' or 'tips'. Focus 100% on content/copy improvements.
- IF 'isBlueVerified' IS FALSE: You MAY mention "Lack of Verified reach" as a leak, but ONLY if their content is already excellent. Otherwise, focus on fixing content first.
- Do NOT copy instructions from this prompt into the output. Generate specific advice based on the user's actual text.
`;

// 3. Define the payload type
interface LlmPayload {
  bio: string;
  pinned_tweet_text: string | null;
  recent_tweets: string[];
  follower_count: number;
  isBlueVerified: boolean;
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
