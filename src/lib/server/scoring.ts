import type { AuditChecklist } from './ai';

export interface ScoringResult {
  totalScore: number;
  leaks: string[];
  tips: string[];
  breakdown: {
    niche: number;
    content: number;
    offer: number;
    monetization: number;
  };
}

// Data lấy từ RapidAPI (Cứng)
export interface ApiChecks {
    hasLink: boolean;
    hasPinned: boolean;
    isVerified: boolean; // Check tích xanh
}

export function calculateDeterministicScore(
  check: AuditChecklist, 
  apiData: ApiChecks
): ScoringResult {

  let leaks: string[] = [];
  let tips: string[] = [];
  
  let nicheScore = 0;   // Max 25
  let contentScore = 0; // Max 15
  let offerScore = 0;   // Max 30
  let moneyScore = 0;   // Max 30

  // =================================================
  // 1. NICHE & IDENTITY (Max 25 points)
  // =================================================
  
  // Check Tích xanh (5 điểm) -> QUAN TRỌNG CHO TRUST
  if (apiData.isVerified) {
      nicheScore += 5;
  } else {
      // Không trừ điểm quá nặng, nhưng cảnh báo
      tips.push("Consider X Premium to boost algorithmic reach and instant trust.");
  }

  console.log("Scoring")
  console.log(check)

  if (check.niche.bioHasKeywords) nicheScore += 10;
  else {
    leaks.push("Bio is invisible to Search (Missing keywords).");
    tips.push("Add 2-3 industry-specific keywords (e.g., #SaaS, Marketing) to your Bio immediately.");
  }

  if (check.niche.bioShowsAuthority) nicheScore += 10;
  else {
    leaks.push("Bio lacks Authority/Trust signals.");
    tips.push("Add specific numbers to your Bio: Years of experience, Revenue, or User count.");
  }

  // =================================================
  // 2. CONTENT STRATEGY (Max 15 points)
  // =================================================
  if (check.content.tweetsMatchBio) contentScore += 10;
  else {
    leaks.push("Content is unfocused (The 'Jack of all trades' trap).");
    tips.push("The algorithm loves consistency. Stick to 1 core topic for your next 10 tweets.");
  }

  if (check.content.usesFormatting) contentScore += 5;
  else tips.push("Stop posting 'walls of text'. Use line breaks and lists to improve readability.");
  
  // =================================================
  // 3. OFFER CLARITY (Max 30 points)
  // =================================================
  if (check.offer.bioClearProblemSolution) offerScore += 15;
  else {
    leaks.push("Bio fails the '3-second rule' (Unclear value).");
    tips.push("Rewrite Bio using the formula: 'I help [Avatar] achieve [Result] via [Mechanism]'.");
  }

  if (apiData.hasPinned) {
    offerScore += 5;
    if (check.offer.pinnedTweetHasSocialProof) offerScore += 10;
    else {
      leaks.push("Pinned Tweet lacks Social Proof (Trust signals).");
      tips.push("Edit your Pinned Tweet to include numbers, client wins, or revenue screenshots.");
    }
  } else {
    leaks.push("Missing Pinned Tweet (Wasted prime real estate).");
    tips.push("Pin your best-performing thread or your main offer immediately.");
  }

  // =================================================
  // 4. MONETIZATION (Max 30 points)
  // =================================================
  // Logic: Lead Magnet (15đ) > Link thường (5đ) > Không Link (0đ)
  if (check.monetization.hasLeadMagnet && apiData.hasLink) {
    moneyScore += 15;
  } else if (apiData.hasLink) {
    moneyScore += 5;
    leaks.push("Bio Link is not optimized for lead capture.");
    tips.push("Replace your generic home page link with a Lead Magnet (Newsletter, Freebie) to capture emails.");
  } else {
    leaks.push("No Link in Bio = No Funnel = No Money.");
    tips.push("Add a link to your Newsletter, Gumroad, or Booking page right now.");
  }

  if (check.monetization.pinnedTweetHasCTA) moneyScore += 10;
  else if (apiData.hasPinned) {
    leaks.push("Pinned Tweet is a 'dead end' (No Call-to-Action).");
    tips.push("Add a clear CTA at the end: 'Click below', 'DM me', or 'Sign up'.");
  }

  if (check.monetization.urgencyOrScarcity) moneyScore += 5;

  // Tinh chỉnh điểm tổng (Max 100)
  const totalScore = nicheScore + contentScore + offerScore + moneyScore;

  return {
    totalScore,
    leaks: leaks.slice(0, 5),
    tips: tips.slice(0, 3),
    breakdown: {
      niche: nicheScore,
      content: contentScore,
      offer: offerScore,
      monetization: moneyScore
    }
  };
}
