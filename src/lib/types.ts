export type TabId = 'audit-free' | 'fixes-growth' | 'monetization-kit';

// Bổ sung các Types cho Pro Content
export interface BioDraft {
  [x: string]: any;
  title: string;
  content: string;
}

export interface ProFixesResult {
  [x: string]: any;
  contentHook: string;
  contentHookExample: string;
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
