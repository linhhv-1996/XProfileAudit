import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';
import type { ApiChecks } from './scoring';

const groq = new Groq({ apiKey: GROQ_API_KEY });

// --- INTERFACES ---

export interface BioDraft {
  title: string;
  content: string;
  rationale: string; // Lý do sửa (Personalized)
}

export interface TweetAnalysis {
    original_hook: string;
    why_it_worked: string; // AI giải thích tại sao tweet này ngon (Hook, Emotion, Structure...)
    new_versions: string[]; // 2 biến thể mới dựa trên cấu trúc tweet cũ
}

export interface WeeklyPostIdea {
    day: string;    
    theme: string;  
    content: string; // Nội dung tweet nháp hoàn chỉnh
}

export interface ProFixesResult {
  bioDrafts: BioDraft[];
  pinnedTweetCopy: string;
  // Phân tích chuyên sâu về tweet thành công
  topTweetsAnalysis: TweetAnalysis[]; 
  // Lịch content tuần sau
  contentCalendar: WeeklyPostIdea[]; 
}

export interface MonetizationKit {
    projectedSponsorValue: string;
    packages: { name: string, price: string, description: string }[];
    pitchEmailSnippet: string;
}

// --- SYSTEM PROMPT ---

const PRO_FIXES_SYSTEM_PROMPT = (profile: any, topTweets: any[], auditLeaks: string[]) => {
    
    const name = profile?.name || "Creator";
    // Format danh sách tweet top thành text để AI đọc
    // topTweets là mảng { text, likes, views, ... } được gửi từ Client
    const topTweetsContext = topTweets && topTweets.length > 0
        ? topTweets.map((t, i) => `[TWEET ${i+1}] (Likes: ${t.likes}): "${t.text}"`).join('\n\n')
        : "No top tweets data available.";

    const auditContext = auditLeaks.length > 0 
        ? `\nWEAKNESSES FROM AUDIT:\n- ${auditLeaks.join('\n- ')}\n` 
        : "";

    return `
You are an expert Ghostwriter & Growth Strategist for X (Twitter).
You are analyzing the profile of "${name}".

YOUR GOAL: Reverse-engineer their success and fix their weaknesses.

${auditContext}

--- TOP PERFORMING CONTENT (THE "WINNING PATTERN") ---
${topTweetsContext}

--- TASKS ---

1. **BIO OPTIMIZATION (3 Drafts)**:
   - Draft 1 (Authority): Credibility focused. Use numbers if available in the input.
   - Draft 2 (Mission): "I help X do Y" format.
   - Draft 3 (Builder/Personal): Authentic and raw.
   - *Rationale*: Explain specifically how this draft fixes a weakness from the Audit.

2. **PINNED TWEET STRATEGY**:
   - Write a high-converting Pinned Tweet using the AIDA framework (Attention, Interest, Desire, Action).
   - Goal: Drive followers or newsletter signups.

3. **WINNING CONTENT REPLICATION (Deep Dive)**:
   - Analyze the [TWEET 1], [TWEET 2], [TWEET 3] provided above.
   - For EACH tweet:
     - **why_it_worked**: Explain the psychological trigger or format hook (max 1 sentence).
     - **new_versions**: Write 2 NEW tweet drafts using the EXACT SAME structure/formula but for a fresh angle/topic relevant to them.

4. **5-DAY CONTENT CALENDAR**:
   - Create 5 tweet drafts for the next 5 days (Mon-Fri).
   - Mix of: Authority, Vulnerability, and Value.
   - *content*: Must be the ACTUAL tweet text, ready to post.

OUTPUT JSON FORMAT:
{
  "bioDrafts": [
    { "title": "Authority", "content": "...", "rationale": "..." },
    { "title": "Mission", "content": "...", "rationale": "..." },
    { "title": "Builder", "content": "...", "rationale": "..." }
  ],
  "pinnedTweetCopy": "Full tweet text with emojis...",
  "topTweetsAnalysis": [
    {
        "original_hook": "First few words of Tweet 1...",
        "why_it_worked": "It used a negative hook to stop the scroll...",
        "new_versions": [
            "Variation A (Same structure)...",
            "Variation B (Same structure)..."
        ]
    }
    // Repeat for other top tweets
  ],
  "contentCalendar": [
      { "day": "Monday", "theme": "Mistake", "content": "I wasted 2 weeks..." },
      // ... 5 days total
  ]
}
`;
};

interface ProPayload {
    profile: any;
    topTweets: any[]; // Mảng tweet tốt nhất lọc từ Client
    auditLeaks: string[];
    pinnedTweetText?: string;
    niche?: string;
    // Các trường cũ để tương thích ngược nếu cần
    bio?: string; 
    recentTweetsText?: string[];
    apiChecks?: ApiChecks;
}

export async function generateProFixes(payload: ProPayload): Promise<ProFixesResult> {
  const systemPrompt = PRO_FIXES_SYSTEM_PROMPT(
      payload.profile || {},
      payload.topTweets || [],
      payload.auditLeaks || []
  );
  
  // Payload gửi AI tối giản để tiết kiệm token
  const aiPayload = {
      profile_desc: payload.profile?.description || payload.bio,
      top_tweets: payload.topTweets,
      audit_leaks: payload.auditLeaks
  };

  try {
    const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant', 
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(aiPayload) }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6, // Nhiệt độ vừa phải để sáng tạo nhưng vẫn bám sát cấu trúc
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI');

    const result = JSON.parse(content) as ProFixesResult;
    
    // Validate data trả về để tránh lỗi Frontend
    if (!result.topTweetsAnalysis) result.topTweetsAnalysis = [];
    if (!result.contentCalendar) result.contentCalendar = [];

    return result;

  } catch (e: any) {
    console.error("AI Error for Pro Fixes:", e);
    // Fallback data nếu AI lỗi
    return {
        bioDrafts: [
            { title: "Fallback Bio", content: "Error generating bio.", rationale: "AI overload." }
        ],
        pinnedTweetCopy: "Error generating content. Please try again.",
        topTweetsAnalysis: [],
        contentCalendar: []
    };
  }
}
