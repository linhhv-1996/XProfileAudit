// src/lib/server/scoring.ts
import type { DetailedChecklist } from './ai';

export interface ApiChecks {
    hasLink: boolean;
    hasPinned: boolean;
    isVerified: boolean;
    percentVisuals: number;
    canDM: boolean;
    followerCount: number;
}

export interface ScoringResult {
  totalScore: number;
  leaks: string[];
  tips: string[];
  breakdown: { niche: number; content: number; offer: number; monetization: number };
}

const CONFIG = {
    niche: {
        defines_target_audience: { w: 5, leak: "Audience Invisible: Bio doesn't name WHO you help.", tip: "Add 'for [Target Audience]' to your bio." },
        solves_specific_problem: { w: 5, leak: "Self-Centered Bio: You talk about yourself, not their problems.", tip: "Rewrite Bio: 'I help [Avatar] fix [Problem]'." },
        has_authority_numbers: { w: 5, leak: "Zero Authority: Bio lacks achieved results.", tip: "Show PROOF (Revenue, Users), not just Goals." },
        no_generic_buzzwords: { w: 3, leak: "Cliché Alert: 'Enthusiast/Lover' is weak.", tip: "Replace fluff with hard skills." },
        clear_role_title: { w: 2, leak: "Mystery Profile: What is your job?", tip: "State your title (e.g. Founder)." },
        professional_tone: { w: 2, leak: "Amateur formatting.", tip: "Clean up bio grammar." },
        consistent_branding: { w: 1, leak: "Name mismatch.", tip: "Align Name & Handle." },
        is_actually_authority: { w: 0, leak: "Fake Authority: You are listing goals, not wins.", tip: "Remove 'Road to X' from bio. Put it in a tweet." } 
    },
    content: {
        consistent_topic: { w: 5, leak: "Content Scatter: Too many topics.", tip: "Focus on ONE niche." },
        uses_hooks: { w: 5, leak: "Weak Openers: Tweets start boringly.", tip: "Start with a conflict/question." },
        uses_line_breaks: { w: 3, leak: "Wall of Text.", tip: "Use spacing." },
        educational_value: { w: 5, leak: "Diary Content: Updates are not value.", tip: "Teach 'How-to', don't just say 'I did this'." },
        engages_questions: { w: 3, leak: "Broadcasting: No engagement.", tip: "End tweets with a question." },
        minimal_hashtags: { w: 2, leak: "Hashtag Spam.", tip: "Max 2 tags." },
        personal_stories: { w: 3, leak: "Robotic Tone.", tip: "Share personal lessons." },
        no_external_links_in_tweets: { w: 3, leak: "Reach Killer: Links in main tweets.", tip: "Put links in the replies." },
        is_value_dense: { w: 0, leak: "Low Value Signal: Your tweets are just noise/updates.", tip: "Stop posting updates. Start posting frameworks." } 
    },
    offer: {
        pinned_is_high_value: { w: 6, leak: "Weak Pinned Tweet: Just an update?", tip: "Pin a Guide/Case Study." },
        pinned_relates_to_bio: { w: 4, leak: "Disconnected Pin.", tip: "Match Pin to Bio." },
        pinned_has_social_proof: { w: 5, leak: "No Proof in Pin.", tip: "Add screenshots." },
        bio_promise_result: { w: 4, leak: "Bio promises nothing.", tip: "Promise a specific outcome." },
        pinned_is_not_just_life_update: { w: 4, leak: "Pinned a Life Update?", tip: "Pin a resource." },
        pinned_has_visuals: { w: 3, leak: "Text-only Pin.", tip: "Add an image." }
    },
    monetization: {
        link_is_lead_magnet: { w: 7, leak: "Funnel Leak: Generic Home/Linktree.", tip: "Link to a Squeeze Page." },
        pinned_has_cta: { w: 4, leak: "No CTA in Pin.", tip: "Add 'DM me' or 'Click below'." },
        sells_outcome_not_feature: { w: 3, leak: "Feature Selling.", tip: "Sell the result." },
        dm_open_signal: { w: 3, leak: "No DM signal.", tip: "Encourage DMs." },
        has_urgency: { w: 2, leak: "Passive Offer.", tip: "Add urgency." }
    }
};

const WHALE_IGNORE_LIST = [
    'defines_target_audience', 'clear_role_title', 'professional_tone', 'no_generic_buzzwords',
    'uses_line_breaks', 'minimal_hashtags', 'engages_questions',
    'pinned_has_social_proof', 'pinned_has_visuals', 'bio_promise_result',
    'link_is_lead_magnet', 'pinned_has_cta'
];

export function calculateDeterministicScore(ai: DetailedChecklist, api: ApiChecks): ScoringResult {
  let leaks: string[] = [];
  let tips: string[] = [];

  const isWhale = api.followerCount >= 50000; // 50k+
  const isMicroInfluencer = api.followerCount >= 10000; // 10k+
  
  const calcSection = (sectionKey: keyof typeof CONFIG) => {
      let score = 0;
      let maxScore = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aiData = (ai as any)[sectionKey];
      const sectionConfig = CONFIG[sectionKey];

      for (const [key, config] of Object.entries(sectionConfig)) {
          if (key === 'is_actually_authority' || key === 'is_value_dense') continue; 
          
          maxScore += config.w;
          
          let passed = false;
          if (aiData && aiData[key]) passed = true;
          if (!passed && isWhale && WHALE_IGNORE_LIST.includes(key)) passed = true; 

          if (passed) {
              score += config.w;
          } else {
              leaks.push(config.leak);
              tips.push(config.tip);
          }
      }
      return { score, maxScore };
  };

  let niche = calcSection('niche');
  let content = calcSection('content');
  let offer = calcSection('offer');
  let money = calcSection('monetization');

  // --- KILL SWITCH & RECOVERY ---
  if (!ai.niche.is_actually_authority) {
      if (!isMicroInfluencer) {
          niche.score = Math.min(niche.score, niche.maxScore * 0.5);
          leaks.unshift(CONFIG.niche.is_actually_authority.leak);
      } else {
          niche.score += 5; // Đây là chỗ gây ra > 100%
      }
  }

  if (!ai.content.is_value_dense && !isWhale) {
      content.score = Math.min(content.score, content.maxScore * 0.4);
      leaks.unshift(CONFIG.content.is_value_dense.leak);
  }

  // --- HARD CHECKS ---
  niche.maxScore += 5;
  if (api.isVerified) niche.score += 5;
  
  content.maxScore += 5;
  if (api.percentVisuals >= 20) content.score += 5;
  else if (!isWhale) leaks.push("Feed lacks visuals (<20%).");

  offer.maxScore += 10;
  if (api.hasPinned) offer.score += 10;
  else {
      leaks.push("No Pinned Tweet found.");
      offer.score = 0; 
  }

  money.maxScore += 10;
  if (api.hasLink) money.score += 5;
  else leaks.push("Missing Bio Link.");
  if (api.canDM) money.score += 5;
  else leaks.push("DMs are closed.");

  // --- TÍNH TỔNG ---
  const totalRaw = niche.score + content.score + offer.score + money.score;
  const maxRaw = niche.maxScore + content.maxScore + offer.maxScore + money.maxScore;
  
  let totalScore = Math.round((totalRaw / maxRaw) * 100);

  if (isWhale) totalScore = Math.min(99, totalScore + 5);

  // --- [FIX] CAPPED BREAKDOWN AT 100% ---
  // Thêm Math.min(100, ...) vào tất cả các dòng dưới đây
  const breakdown = {
      niche: Math.min(100, Math.round((niche.score / niche.maxScore) * 100)),
      content: Math.min(100, Math.round((content.score / content.maxScore) * 100)),
      offer: Math.min(100, Math.round((offer.score / offer.maxScore) * 100)),
      monetization: Math.min(100, Math.round((money.score / money.maxScore) * 100))
  };

  return {
    totalScore,
    leaks: [...new Set(leaks)].slice(0, 5),
    tips: [...new Set(tips)].slice(0, 5),
    breakdown
  };
}
