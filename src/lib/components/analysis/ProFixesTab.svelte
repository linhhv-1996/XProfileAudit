<script lang="ts">
  import LockedFeature from './LockedFeature.svelte';
  import TabLoadingSpinner from './TabLoadingSpinner.svelte'; 
  import { addToast } from '$lib/stores/toast';
  import type { ProFixesResult } from '$lib/types';

  export let user: any;
  export let displayFixesData: ProFixesResult | undefined;
  export let openProModal: () => void;
  export let isProDataLoading: boolean; 
  export let handleRegenerate: () => void;

  function copyToClipboard(text: string, message: string) {
    navigator.clipboard.writeText(text);
    addToast(message, "success");
  }
</script>

<div class="tab-content p-6 sm:p-8">
  <div class="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-6 mb-6">
    <div>
      <p class="text-lg font-semibold text-gray-900">Copy fixes & content breakdown</p>
      <p class="mt-1 text-sm text-gray-500">Optimized bio, pinned tweet drafts, and a deeper look at what actually performs.</p>
    </div>
    
    {#if user?.isPro}
      <button 
        class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors disabled:opacity-50"
        on:click={handleRegenerate}
        disabled={isProDataLoading}
      >
        <svg class="w-3.5 h-3.5 {isProDataLoading ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            {#if isProDataLoading}
              <svg width="24px" height="24px" viewBox="0 -0.5 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="si-glyph si-glyph-circle-load-left">
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <path d="M15.947,8.379 C15.872,4.257 12.596,0.967 8.644,1.042 C4.727,1.115 1.791,3.93216431 1.814,8.00616431 L0.204284668,8.00616443 C-0.0127153322,8.22616443 -0.0127153322,8.88200012 0.204284668,9.10200012 L2.115,10.86 C2.332,11.082 2.681,11.082 2.9,10.86 L4.82086158,9.10200012 C5.03886158,8.88200012 5.03886158,8.22616443 4.82086158,8.00616443 L3.203,8.00616431 C3.18,4.66816431 5.462,2.461 8.67,2.402 C11.902,2.34 14.582,5.032 14.645,8.404 C14.707,11.726 12.2,14.481 9.032,14.62 L9.032,15.981 C12.93,15.842 16.023,12.46 15.947,8.379 L15.947,8.379 Z" fill="#434343" class="si-glyph-fill"></path>
                </g>
              </svg>
            {:else}
              <svg width="24px" height="24px" viewBox="0 -0.5 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="si-glyph si-glyph-circle-load-left">
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <path d="M15.947,8.379 C15.872,4.257 12.596,0.967 8.644,1.042 C4.727,1.115 1.791,3.93216431 1.814,8.00616431 L0.204284668,8.00616443 C-0.0127153322,8.22616443 -0.0127153322,8.88200012 0.204284668,9.10200012 L2.115,10.86 C2.332,11.082 2.681,11.082 2.9,10.86 L4.82086158,9.10200012 C5.03886158,8.88200012 5.03886158,8.22616443 4.82086158,8.00616443 L3.203,8.00616431 C3.18,4.66816431 5.462,2.461 8.67,2.402 C11.902,2.34 14.582,5.032 14.645,8.404 C14.707,11.726 12.2,14.481 9.032,14.62 L9.032,15.981 C12.93,15.842 16.023,12.46 15.947,8.379 L15.947,8.379 Z" fill="#434343" class="si-glyph-fill"></path>
                </g>
              </svg>
            {/if}
        </svg>
        {isProDataLoading ? 'Regenerating...' : 'Re-generate'}
      </button>
    {:else}
      <span class="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 border border-rose-200">
        <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span> Pro feature
      </span>
    {/if}
  </div>

  {#if user?.isPro}
    {#if isProDataLoading}
      <TabLoadingSpinner message="Generating personalized copy and growth plan..." />
    {:else if displayFixesData}
      <div class="space-y-8">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="border border-indigo-200 rounded-lg p-4 bg-indigo-50/70 flex flex-col">
            <p class="text-sm font-semibold text-gray-800">Your Winning Content Hook:</p>
            <p class="mt-2 text-base text-gray-900 font-bold mb-3">
              {displayFixesData.contentHook}
              <span class="text-indigo-600 font-normal text-sm block mt-1">(Found in {displayFixesData.highestImpactCount} highest-impact posts)</span>
            </p>
            
            <div class="mt-auto p-3 border border-indigo-300 bg-white/80 rounded-lg">
                <p class="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wide">Proven Example from your tweets:</p>
                <p class="text-sm text-gray-900 italic font-medium">"{displayFixesData.contentHookExample}"</p>
            </div>
          </div>

          <div class="border border-green-200 rounded-lg p-4 bg-green-50/70">
            <p class="text-sm font-semibold text-gray-800">Best Content Format for you:</p>
            <p class="mt-2 text-base text-gray-900 font-bold">
              {displayFixesData.contentFormat}
            </p>
             <p class="text-green-700 font-medium text-sm mt-2">
                 💡 Used in {displayFixesData.formatPercentage}% of your top performing posts.
            </p>
          </div>
        </div>

        <div>
          <h3 class="text-base font-semibold text-gray-900 mb-3">3 Optimized Bio Drafts (Fixed for you)</h3>
          <div class="space-y-4">
            {#each displayFixesData.bioDrafts as draft}
              <div class="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div class="p-4 flex items-start sm:items-center justify-between gap-4">
                    <div class="flex-1">
                        <p class="font-bold text-primary text-sm mb-1">
                            {draft.title}
                        </p>
                        <p class="text-sm text-gray-900 font-medium leading-relaxed">{draft.content}</p>
                    </div>
                    <button 
                        on:click={() => copyToClipboard(draft.content, "Bio Copied!")} 
                        class="shrink-0 mt-1 sm:mt-0 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors border border-gray-200"
                    >
                        Copy
                    </button>
                  </div>
                  <div class="bg-blue-50/50 px-4 py-2 border-t border-gray-100 flex gap-2 items-start">
                      <span class="text-blue-500 text-xs mt-0.5">💡</span>
                      <p class="text-xs text-blue-700 italic">{draft.rationale}</p>
                  </div>
              </div>
            {/each}
          </div>
        </div>

        <div>
          <h3 class="text-base font-semibold text-gray-900 mb-3">Optimized Pinned Tweet Draft</h3>
          <div class="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
            <div class="flex justify-between items-start mb-3">
                <p class="font-bold text-primary text-sm">Conversion-Focused Pinned Tweet</p>
                <span class="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">PIN THIS</span>
            </div>
            <p class="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-normal border-l-2 border-gray-200 pl-3 italic">
              {displayFixesData.pinnedTweetCopy}
            </p>
            <div class="mt-4 pt-3 border-t border-gray-100">
                 <button 
                    on:click={() => copyToClipboard(displayFixesData?.pinnedTweetCopy || "", "Tweet Copied!")} 
                    class="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-700 transition-colors shadow-sm"
                >
                    Copy Tweet Text
                </button>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-base font-semibold text-gray-900 mb-3">Your Weekly Content Plan (Next 5 Days)</h3>
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="divide-y divide-gray-100">
                {#each displayFixesData.weeklyContentPlan as post}
                     <div class="p-4 sm:flex gap-4 hover:bg-gray-50 transition-colors">
                        <div class="sm:w-32 shrink-0 mb-2 sm:mb-0">
                            <p class="text-xs font-bold uppercase tracking-wider text-gray-500">{post.day}</p>
                            <span class="inline-flex mt-1 items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                {post.theme}
                            </span>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm text-gray-800 leading-relaxed">
                                <span class="font-semibold text-primary mr-1">Idea:</span> 
                                {post.content}
                            </p>
                        </div>
                    </div>
                {/each}
              </div>
          </div>
        </div>

      </div>
    {/if}
  {:else}
    <LockedFeature 
      title="Unlock Your Full Growth Kit" 
      subtitle="Get all 3 Optimized Bio Drafts, your Best Performing Content Format, and the Pinned Tweet ready to copy-paste."
      {openProModal}
    >
      <div class="border border-indigo-200 rounded-lg p-4 bg-indigo-50/70 mb-6">
        <p class="text-sm font-semibold text-gray-800">Your Best Performing Content Hook:</p>
        <p class="mt-2 text-base text-gray-900 font-bold">The "Proof & Prediction" Framework...</p>
      </div>
      <div class="p-3 border border-gray-200 rounded-lg bg-white">
        <p class="font-bold text-primary">Bio Draft 1 (The Authority)</p>
        <p>Building @SaaSToolName from $0 to $10k MRR. Follow along for transparent growth logs...</p>
      </div>
      <div class="p-3 border border-gray-200 rounded-lg bg-white">
        <p class="font-bold text-primary">Best Content Format:</p>
        <p>Short-form threads (5-7 tweets). 82% of your top posts use this format.</p>
      </div>
    </LockedFeature>
  {/if}
</div>
