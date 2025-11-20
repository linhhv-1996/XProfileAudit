// src/lib/server/ai.ts
import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';

const groq = new Groq({ apiKey: GROQ_API_KEY });

export interface DetailedChecklist {
  niche: {
    defines_target_audience: boolean;
    solves_specific_problem: boolean;
    has_authority_numbers: boolean;
    no_generic_buzzwords: boolean;
    clear_role_title: boolean;
    professional_tone: boolean;
    consistent_branding: boolean;
    is_actually_authority: boolean; 
  };
  content: {
    consistent_topic: boolean;
    uses_hooks: boolean;
    uses_line_breaks: boolean;
    educational_value: boolean;
    engages_questions: boolean;
    minimal_hashtags: boolean;
    personal_stories: boolean;
    no_external_links_in_tweets: boolean;
    is_value_dense: boolean;
  };
  offer: {
    pinned_is_high_value: boolean;
    pinned_relates_to_bio: boolean;
    pinned_has_social_proof: boolean;
    bio_promise_result: boolean;
    pinned_is_not_just_life_update: boolean;
    pinned_has_visuals: boolean;
  };
  monetization: {
    link_is_lead_magnet: boolean;
    pinned_has_cta: boolean;
    sells_outcome_not_feature: boolean;
    dm_open_signal: boolean;
    has_urgency: boolean;
  };
  summary: {
      target_audience: string;
      best_tweet_hook: string;
  };
}

const AUDIT_SYSTEM_PROMPT = `
You are a RUTHLESS X (Twitter) Auditor Algorithm.
Analyze the profile JSON (Bio, Tweets, Pinned). Return a JSON Checklist (Boolean).

--- CRITICAL "KILL SWITCH" RULES (Determines Pass/Fail) ---
1. niche.is_actually_authority:
   - TRUE ONLY IF: Bio proves PAST success (e.g. "$1M Revenue", "Ex-Google", "10k Users", "Sold X").
   - FALSE IF: Bio lists FUTURE goals (e.g. "Road to $10k", "Building X", "Trying to..."). "Building" is NOT authority.

2. content.is_value_dense:
   - TRUE ONLY IF: Tweets teach "How-to", share frameworks, or deep insights.
   - FALSE IF: Tweets are "Diary updates" ("I did this today"), "Complaints" ("Ugh API failed"), "Requests" ("I need ideas"), or "Status checks" ("GM").

--- STANDARD CRITERIA (Default to FALSE) ---
- niche.defines_target_audience: Explicitly names who it helps (e.g. "Founders", "Moms").
- niche.solves_specific_problem: Mentions a pain point or solution.
- niche.has_authority_numbers: Contains digits related to success (NOT goals).
- niche.no_generic_buzzwords: NO "Ninja/Enthusiast/Lover/Junkie".
- niche.clear_role_title: States a professional role (Dev, Founder).
- niche.professional_tone: No grammar errors or all-lowercase laziness.
- niche.consistent_branding: Name/Handle align.

- content.consistent_topic: >80% tweets on one topic.
- content.uses_hooks: Tweets start with a hook/question/conflict.
- content.uses_line_breaks: Uses vertical spacing.
- content.educational_value: Teaches something useful.
- content.engages_questions: Asks questions to audience.
- content.minimal_hashtags: Uses < 3 hashtags.
- content.personal_stories: Uses "I/My" to share lessons.
- content.no_external_links_in_tweets: No links in main text.

- offer.pinned_is_high_value: Thread/Guide/Case Study. (FALSE if just intro/update).
- offer.pinned_relates_to_bio: Matches bio promise.
- offer.pinned_has_social_proof: Screenshots/Numbers in pinned tweet.
- offer.bio_promise_result: "I help X do Y".
- offer.pinned_is_not_just_life_update: Value focused, not "I moved house".
- offer.pinned_has_visuals: Has image/video.

- monetization.link_is_lead_magnet: Squeeze Page/Newsletter (NOT Home/Linktree).
- monetization.pinned_has_cta: Explicit "Click/DM".
- monetization.sells_outcome_not_feature: Results focused copy.
- monetization.dm_open_signal: Encourages DMs.
- monetization.has_urgency: Scarcity implied.

--- MANDATORY SUMMARY EXTRACTION (DO NOT LEAVE EMPTY) ---
- summary.target_audience: Infer the specific audience from Bio/Content (e.g. "Indie Hackers", "Fitness Coaches"). If unclear, write "General Public".
- summary.best_tweet_hook: Copy the EXACT text of the strongest opening line from the 'recent_tweets'. If all are bad, copy the first sentence of the Pinned Tweet. MUST NOT BE EMPTY.


RETURN JSON:
{
  "niche": { ... },
  "content": { ... },
  "offer": { ... },
  "monetization": { ... },
  "summary": { "target_audience": "string", "best_tweet_hook": "string" }
}
`;

export async function getAuditChecklist(payload: any): Promise<DetailedChecklist> {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: AUDIT_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(payload) }
      ],
      response_format: { type: "json_object" },
      temperature: 0, // Absolute consistency
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI');

    console.log(JSON.parse(content) as DetailedChecklist);

    return JSON.parse(content) as DetailedChecklist;
  } catch (e: any) {
    console.error("AI Error:", e);
    throw e;
  }
}
