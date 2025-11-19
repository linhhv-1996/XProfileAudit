// src/lib/server/pro-ai.ts
import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';
import { logToFile } from './dev';
import type { ApiChecks } from './scoring';

const groq = new Groq({ apiKey: GROQ_API_KEY });

// --- PRO FIXES INTERFACES ---

export interface BioDraft {
  title: string;
  content: string;
}

export interface ProFixesResult {
  contentHook: string;
  highestImpactCount: number;
  bioDrafts: BioDraft[];
  contentFormat: string;
  formatPercentage: number;
  pinnedTweetCopy: string;
  nextTweetIdeas: string[];
}

export interface MonetizationKit {
    projectedSponsorValue: string;
    packages: { name: string, price: string, description: string }[];
    pitchEmailSnippet: string;
}

// --- SYSTEM PROMPT: COPY & GROWTH FIXES ---

const PRO_FIXES_SYSTEM_PROMPT = (pinnedText: string, hasPinned: boolean) => {
    let pinnedTweetPrompt = "";
    if (hasPinned) {
        pinnedTweetPrompt = `\n- OPTIMIZE the CURRENT Pinned Tweet (Current Pinned Tweet: "${pinnedText}").`;
    } else {
        pinnedTweetPrompt = `\n- CREATE a NEW Pinned Tweet Draft (The user currently has NO pinned tweet).`;
    }

    return `
You are an elite X (Twitter) Copywriter, specializing in high-converting profiles.
Your task is to generate copy-paste ready content based on the provided profile data, niche, and content style.

CRITERIA:
1. BIO DRAFTS (3 variations): All drafts must be less than 160 characters.
    - Draft 1: Focus on **Authority/Social Proof** and clear value proposition (The Authority).
    - Draft 2: Focus on **Building in Public/Journey** and engagement (The Builder).
    - Draft 3: Focus on **Problem/Solution** and a clear mechanism (The Problem Solver).
2. PINNED TWEET DRAFT: MUST include strong Social Proof (if possible) and a clear Call-To-Action (CTA). ${pinnedTweetPrompt}
3. CONTENT HOOK & FORMAT: Analyze the recent tweets to identify the most common/effective content theme/format.
4. NEXT TWEET IDEAS (5 ideas): Generate 5 concise, actionable ideas for the user's next 5 tweets, strictly relevant to their niche.

INPUT: JSON object containing profile data, niche, and recent tweet texts.
OUTPUT: MUST be a JSON object with this exact structure:

{
  "contentHook": "Short, memorable framework name (e.g., The 'Proof & Prediction' Framework)",
  "highestImpactCount": number, // Estimate based on the number of non-generic, high-value tweets in the last 20 (between 3 and 10)
  "bioDrafts": [
    { "title": "Bio Draft 1 (The Authority)", "content": "Generated copy here" },
    { "title": "Bio Draft 2 (The Builder)", "content": "Generated copy here" },
    { "title": "Bio Draft 3 (The Problem Solver)", "content": "Generated copy here" }
  ],
  "contentFormat": "Description of the best-performing format (e.g., Short-form threads (5-7 tweets) focused on a single tactical problem.)",
  "formatPercentage": number, // Estimated percentage (between 60 and 95)
  "pinnedTweetCopy": "The full, optimized pinned tweet copy with emojis and line breaks (keep it under 280 characters).",
  "nextTweetIdeas": ["Idea 1", "Idea 2", "Idea 3", "Idea 4", "Idea 5"]
}
`
};

interface ProPayload {
    bio: string;
    pinnedTweetText: string;
    recentTweetsText: string[];
    niche: string;
    apiChecks: ApiChecks;
}

export async function generateProFixes(payload: ProPayload): Promise<ProFixesResult> {
  const systemPrompt = PRO_FIXES_SYSTEM_PROMPT(payload.pinnedTweetText || "", payload.apiChecks.hasPinned);
  
  const minimalPayload = {
      bio: payload.bio,
      pinned_text: payload.pinnedTweetText,
      recent_tweets: payload.recentTweetsText,
      niche: payload.niche
  };
  
//   logToFile("pro_fixes_payload.log", minimalPayload);

  try {
    const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant', 
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(minimalPayload) }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1, 
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI for Pro Fixes');

    const result = JSON.parse(content) as ProFixesResult;
    
    // Đảm bảo các giá trị số là number (phòng trường hợp AI trả về string)
    result.highestImpactCount = Number(result.highestImpactCount || 5);
    result.formatPercentage = Number(result.formatPercentage || 70);
    
    return result;

  } catch (e: any) {
    console.error("AI Error for Pro Fixes:", e);
    // Dữ liệu Fallback/Mặc định nếu Groq thất bại
    return {
      contentHook: "The 'Foundational Content' Framework",
      highestImpactCount: 3,
      bioDrafts: [
        { "title": "Bio Draft 1 (Fallback)", "content": "Helping creators stop losing followers and start earning with X. Get your free audit now. 👇" },
        { "title": "Bio Draft 2 (Fallback)", "content": "Built for the 1%. I share the ruthless playbooks I use to grow my SaaS and audience fast." },
        { "title": "Bio Draft 3 (Fallback)", "content": "Turning X profiles into automated lead machines. Founder @MyTool | Ex-FAANG | Read my threads." }
      ],
      contentFormat: "Short-form actionable tips (1-2 sentences) with emojis and line breaks.",
      formatPercentage: 70,
      pinnedTweetCopy: "This is a fallback pinned tweet copy. Upgrade to Pro for the real draft!",
      nextTweetIdeas: ["Share a tool you can't live without.", "Ask a controversial niche question.", "Post a specific business metric.", "Quote and reply to a famous builder.", "A short tutorial on a recent bug fix."]
    };
  }
}
