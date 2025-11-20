// src/lib/server/proAI.ts
import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';
import type { ApiChecks } from './scoring';

const groq = new Groq({ apiKey: GROQ_API_KEY });

// --- PRO FIXES INTERFACES ---

export interface BioDraft {
  title: string;
  content: string;
  rationale: string; 
}

export interface WeeklyPostIdea {
    day: string;    
    theme: string;  
    content: string; // Đây sẽ là nội dung Tweet Draft thực tế
}

export interface ProFixesResult {
  contentHook: string;
  contentHookExample: string;
  highestImpactCount: number;
  bioDrafts: BioDraft[];
  contentFormat: string;
  formatPercentage: number;
  pinnedTweetCopy: string;
  weeklyContentPlan: WeeklyPostIdea[];
}

export interface MonetizationKit {
    projectedSponsorValue: string;
    packages: { name: string, price: string, description: string }[];
    pitchEmailSnippet: string;
}

// --- SYSTEM PROMPT (HARDCORE INDIE HACKER MODE) ---

const PRO_FIXES_SYSTEM_PROMPT = (profile: any, pinnedText: string, hasPinned: boolean, auditLeaks: string[] = []) => {
    
    const name = profile?.name || "Creator";
    const followers = profile?.followers_count || 0;
    // Lấy mô tả ngắn gọn về người dùng để AI hiểu context
    const userContext = `User: ${name}, Followers: ${followers}, Description: ${profile?.description}`;

    const auditContext = auditLeaks.length > 0 
        ? `\n❌ CRITICAL AUDIT MISTAKES TO FIX:\n- ${auditLeaks.join('\n- ')}\n`
        : "";

    let pinnedTweetPrompt = "";
    if (hasPinned) {
        pinnedTweetPrompt = `\n- REWRITE the Pinned Tweet. Do NOT just copy it. Use the AIDA framework (Attention, Interest, Desire, Action). Make it punchy. Break up text blocks. Current: "${pinnedText}"`;
    } else {
        pinnedTweetPrompt = `\n- WRITE a Pinned Tweet from scratch. Focus on: Who I am, What I'm building, and Why you should follow.`;
    }

    return `
You are a veteran Indie Hacker & Ghostwriter. You hate corporate fluff. You love raw metrics, building in public, and authenticity.
You are fixing the profile of: ${userContext}

${auditContext}

--- STRICT RULES ---
1. **NO HALLUCINATIONS**: NEVER invent numbers (like revenue, user count) that are not in the input. If unknown, use placeholders like "[X] users".
2. **NO CORPORATE SPEAK**: Don't use words like "synergy", "thrilled", "webinar", "unleash". Speak like a human builder.
3. **FIX THE LEAKS**: Your suggestions must directly address the Audit Mistakes listed above.

--- TASKS ---

1. BIO OPTIMIZATION (3 Variants):
   - Draft 1 (Authority): Focus on specific numbers found in input (years exp, followers, revenue). If no numbers, focus on specific tech stack/niche.
   - Draft 2 (The Builder): "Building X to $Y". Raw and honest.
   - Draft 3 (The Value Prop): "Helping [Audience] achieve [Result] via [Mechanism]".
   - *Rationale*: Explain WHY this fixes a specific leak.

2. PINNED TWEET REWRITE:
   ${pinnedTweetPrompt}
   - Must include a clear CTA (Call to Action).

3. WINNING PATTERN:
   - Identify their best Hook style & Format from recent tweets.
   - *contentHookExample*: Copy the EXACT best sentence from input.

4. WEEKLY CONTENT PLAN (5 ACTUAL TWEETS):
   - Do NOT write "Idea: Share a story". 
   - **WRITE THE ACTUAL TWEET DRAFT**.
   - Mondy: Motivation/Mistake.
   - Tuesday: Value/How-to.
   - Wednesday: Build in Public update (screenshot implied).
   - Thursday: Authority/Opinion.
   - Friday: Soft Sell/Offer.

OUTPUT JSON FORMAT:
{
  "contentHook": "Name of strategy (e.g. 'The Vulnerable Founder')",
  "contentHookExample": "Exact quote from input",
  "highestImpactCount": number, 
  "bioDrafts": [
    { "title": "The Authority", "content": "Bio text...", "rationale": "Fixes 'Zero Authority' by..." },
    { "title": "The Builder", "content": "Bio text...", "rationale": "..." },
    { "title": "The Problem Solver", "content": "Bio text...", "rationale": "..." }
  ],
  "contentFormat": "e.g. 'Short threads (3 tweets) with a visual hook.'",
  "formatPercentage": number, 
  "pinnedTweetCopy": "Full tweet text with emojis...",
  "weeklyContentPlan": [
      { "day": "Monday", "theme": "Mistake", "content": "I lost 3 weeks of dev time doing [Mistake].\\n\\nHere is what I learned..." },
      { "day": "Tuesday", "theme": "Value", "content": "Stop using [Common Tool].\\n\\nUse [Alternative] instead if you want speed..." },
      // ... 5 days total. CONTENT MUST BE A READY-TO-POST TWEET.
  ]
}
`;
};

interface ProPayload {
    bio: string;
    pinnedTweetText: string;
    recentTweetsText: string[];
    niche: string;
    apiChecks: ApiChecks;
    auditLeaks?: string[]; 
    profile?: any; 
}

export async function generateProFixes(payload: ProPayload): Promise<ProFixesResult> {
  // Truyền profile + leaks vào prompt
  const systemPrompt = PRO_FIXES_SYSTEM_PROMPT(
      payload.profile || {},
      payload.pinnedTweetText || "", 
      payload.apiChecks.hasPinned,
      payload.auditLeaks
  );
  
  const minimalPayload = {
      // Chỉ gửi những thứ cần thiết để tiết kiệm token và tránh nhiễu
      bio: payload.bio,
      pinned_text: payload.pinnedTweetText,
      // Lấy 10 tweet tốt nhất thay vì 20 để AI tập trung hơn
      recent_tweets: payload.recentTweetsText.slice(0, 10), 
      niche: payload.niche
  };
  
  try {
    const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant', 
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(minimalPayload) }
        ],
        response_format: { type: "json_object" },
        // Giảm nhiệt độ xuống để AI bớt "sáng tạo" lung tung (bịa số liệu)
        temperature: 0.5, 
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI for Pro Fixes');

    const result = JSON.parse(content) as ProFixesResult;
    
    // Data validation
    result.highestImpactCount = Number(result.highestImpactCount || 5);
    result.formatPercentage = Number(result.formatPercentage || 70);
    if (!result.weeklyContentPlan) result.weeklyContentPlan = [];
    
    return result;

  } catch (e: any) {
    console.error("AI Error for Pro Fixes:", e);
    return {
      contentHook: "The 'Foundational Content' Framework",
      contentHookExample: "I built this in 24 hours.",
      highestImpactCount: 3,
      bioDrafts: [
        { "title": "Fallback Draft 1", "content": "Helping creators grow. DM for info.", "rationale": "AI Service Busy." },
        { "title": "Fallback Draft 2", "content": "Building SaaS in public.", "rationale": "AI Service Busy." },
        { "title": "Fallback Draft 3", "content": "Fix your X profile today.", "rationale": "AI Service Busy." }
      ],
      contentFormat: "Short-form actionable tips.",
      formatPercentage: 70,
      pinnedTweetCopy: "Optimized tweet generation failed. Please try again.",
      weeklyContentPlan: [
          { day: "Monday", theme: "Value", content: "Share 3 tips about your niche." },
          { day: "Wednesday", theme: "Engagement", content: "Ask your audience a question." },
          { day: "Friday", theme: "Offer", content: "Promote your main link." }
      ]
    };
  }
}
