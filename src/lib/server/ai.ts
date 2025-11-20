import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';

const groq = new Groq({ apiKey: GROQ_API_KEY });

export interface AuditChecklist {
  targetAudience: string;
  niche: {
    bioHasKeywords: boolean;
    bioShowsAuthority: boolean;
    profilePhotoProfessional: boolean;
  };
  content: {
    tweetsMatchBio: boolean;
    usesFormatting: boolean;
    engagesAudience: boolean;
  };
  offer: {
    bioClearProblemSolution: boolean;
    pinnedTweetRelatesToBio: boolean;
    pinnedTweetHasSocialProof: boolean;
  };
  monetization: {
    hasLeadMagnet: boolean;
    pinnedTweetHasCTA: boolean;
    // urgencyOrScarcity: boolean;
    sellsOwnProduct: boolean;
  };
}

const AUDIT_SYSTEM_PROMPT = `
You are an elite X (Twitter) Profile Auditor used by top growth agencies.
Analyze the provided profile JSON data and return a JSON checklist.

CRITERIA FOR "TRUE" (Strict assessment):

--- NICHE & IDENTITY ---
1. bioHasKeywords: Bio MUST contain niche-specific keywords (e.g., "SaaS", "SEO", "Copywriting").
2. bioShowsAuthority: Bio mentions specific numbers, titles, or achievements (e.g., "$10k/mo", "Founder", "Ex-Google", "5yrs exp").
3. profilePhotoProfessional: Avatar is not default/missing.

--- CONTENT STRATEGY ---
4. tweetsMatchBio: Recent tweets strictly relate to the Bio's topics.
5. usesFormatting: Tweets use line breaks, lists, or emojis. No walls of text.
6. engagesAudience: Tweets ask questions or reply to others.

--- OFFER CLARITY ---
7. bioClearProblemSolution: Bio follows a variation of: "Helping [Who] achieve [Result]".
8. pinnedTweetRelatesToBio: Pinned tweet expands on the Bio's promise.
9. pinnedTweetHasSocialProof: Pinned tweet shows results, revenue, testimonials, or client logos.

--- MONETIZATION ---
10. hasLeadMagnet: The link in bio goes to a capture page (Newsletter, Gumroad, Calendly) rather than a generic home page.
11. pinnedTweetHasCTA: Explicit instruction to click/DM.
12. urgencyOrScarcity: CTA uses words like "Limited", "Only X left", "Ends soon", "Free for 24h".
13. sellsOwnProduct: User promotes their OWN product/service (e.g., "My course", "My App", "Book me"). NOT just affiliate links.

OUTPUT RULES:
- "targetAudience": A short English phrase (e.g., "SaaS Founders & Indie Hackers").

IMPORTANT: You MUST return the result in this EXACT nested JSON structure. Do not flatten it.

{
  "targetAudience": "Short description string",
  "niche": {
    "bioHasKeywords": boolean,
    "bioShowsAuthority": boolean,
    "profilePhotoProfessional": boolean
  },
  "content": {
    "tweetsMatchBio": boolean,
    "usesFormatting": boolean,
    "engagesAudience": boolean
  },
  "offer": {
    "bioClearProblemSolution": boolean,
    "pinnedTweetRelatesToBio": boolean,
    "pinnedTweetHasSocialProof": boolean
  },
  "monetization": {
    "hasLeadMagnet": boolean,
    "pinnedTweetHasCTA": boolean,
    "urgencyOrScarcity": boolean,
    "sellsOwnProduct": boolean
  }
}
`;

export async function getAuditChecklist(payload: any): Promise<AuditChecklist> {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: AUDIT_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(payload) }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI');

    // console.log(JSON.parse(content) as AuditChecklist);
    return JSON.parse(content) as AuditChecklist;

  } catch (e: any) {
    console.error("AI Error:", e);
    // Fallback safe data
    return {
      targetAudience: "General Audience",
      niche: { bioHasKeywords: false, bioShowsAuthority: false, profilePhotoProfessional: true },
      content: { tweetsMatchBio: false, usesFormatting: false, engagesAudience: false },
      offer: { bioClearProblemSolution: false, pinnedTweetRelatesToBio: false, pinnedTweetHasSocialProof: false },
      monetization: { hasLeadMagnet: false, pinnedTweetHasCTA: false, sellsOwnProduct: false }
    };
  }
}
