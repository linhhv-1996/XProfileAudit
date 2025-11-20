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

export interface ApiChecks {
    hasLink: boolean;
    hasPinned: boolean;
    isVerified: boolean;
    percentVisuals: number;
    canDM: boolean;
}

export function calculateDeterministicScore(
  check: AuditChecklist, 
  apiData: ApiChecks
): ScoringResult {

  let leaks: string[] = [];
  let tips: string[] = [];
  
  let nicheScore = 0;   // Target: 20
  let contentScore = 0; // Target: 25
  let offerScore = 0;   // Target: 30
  let moneyScore = 0;   // Target: 25

  // =================================================
  // 1. NICHE & IDENTITY (Max 20 points)
  // =================================================
  
  if (apiData.isVerified) nicheScore += 5;
  else tips.push("Consider X Premium to boost algorithmic reach and instant trust.");

  if (check.niche.bioHasKeywords) nicheScore += 5;
  else {
    leaks.push("Bio is invisible to Search (Missing keywords).");
    tips.push("Add 2-3 industry-specific keywords (e.g., #SaaS, Marketing) to your Bio.");
  }

  if (check.niche.bioShowsAuthority) nicheScore += 5;
  else {
    leaks.push("Bio lacks Authority/Trust signals.");
    tips.push("Add numbers to your Bio: Years of exp, Revenue, or User count.");
  }

  if (check.niche.profilePhotoProfessional) nicheScore += 5;
  else {
    leaks.push("Profile photo looks default or unprofessional.");
  }

  // =================================================
  // 2. CONTENT STRATEGY (Max 25 points)
  // =================================================
  
  if (check.content.tweetsMatchBio) contentScore += 10;
  else {
    leaks.push("Content is unfocused (The 'Jack of all trades' trap).");
    tips.push("The algorithm loves consistency. Stick to 1 core topic.");
  }

  if (check.content.usesFormatting) contentScore += 5;
  
  if (check.content.engagesAudience) contentScore += 5;
  else tips.push("Your content is 'Broadcasting' not 'Engaging'. Ask more questions.");

  // [NEW] Visuals Logic
  if (apiData.percentVisuals >= 30) {
      contentScore += 5;
  } else {
      leaks.push("Feed looks like a 'Wall of Text' (Low Visuals).");
      tips.push("Tweets with images/videos get 3x more engagement. Aim for 1 visual every 3 tweets.");
  }
  
  // =================================================
  // 3. OFFER CLARITY (Max 30 points)
  // =================================================
  
  if (check.offer.bioClearProblemSolution) offerScore += 10;
  else {
    leaks.push("Bio fails the '3-second rule' (Unclear value).");
    tips.push("Rewrite Bio: 'I help [Avatar] achieve [Result] via [Mechanism]'.");
  }

  if (apiData.hasPinned) {
    offerScore += 5; // Có pinned là có điểm
    if (check.offer.pinnedTweetHasSocialProof) offerScore += 10;
    else tips.push("Add numbers, client wins, or revenue screenshots to your Pinned Tweet.");
    
    if (check.offer.pinnedTweetRelatesToBio) offerScore += 5;
  } else {
    leaks.push("Missing Pinned Tweet (Wasted prime real estate).");
    tips.push("Pin your best-performing thread or your main offer immediately.");
  }

  // =================================================
  // 4. MONETIZATION (Max 25 points)
  // =================================================
  
  if (check.monetization.hasLeadMagnet && apiData.hasLink) {
    moneyScore += 10;
  } else if (apiData.hasLink) {
    moneyScore += 5;
    leaks.push("Bio Link is not optimized for lead capture.");
    tips.push("Replace home page link with a Lead Magnet (Newsletter, Freebie).");
  } else {
    leaks.push("No Link in Bio = No Funnel = No Money.");
  }

  if (check.monetization.pinnedTweetHasCTA) moneyScore += 5;

  if (apiData.canDM) {
      moneyScore += 5;
  } else {
      leaks.push("DMs are closed to non-followers (Blocking cold outreach/sponsorships).");
      tips.push("Enable DMs from everyone in your settings immediately.");
  }
  
  // if (check.monetization.urgencyOrScarcity) moneyScore += 5;

  // [NEW] Sells Own Product
  if (check.monetization.sellsOwnProduct) {
      moneyScore += 5;
  } else {
      tips.push("Stop renting your audience. Launch a simple owned product (eBook, Coaching) to increase LTV.");
  }

  // Total Logic
  const totalScore = nicheScore + contentScore + offerScore + moneyScore;

  return {
    totalScore,
    leaks: leaks.slice(0, 5),
    tips: tips.slice(0, 4),
    breakdown: {
      niche: nicheScore,   // Max 20 -> * 5 = 100% UI
      content: contentScore, // Max 25 -> * 4 = 100% UI
      offer: offerScore,     // Max 30 -> / 0.3 = 100% UI
      monetization: moneyScore // Max 25 -> * 4 = 100% UI
    }
  };
}
