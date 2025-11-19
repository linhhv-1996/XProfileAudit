<script lang="ts">
  import LockedFeature from './LockedFeature.svelte';
  import TabLoadingSpinner from './TabLoadingSpinner.svelte'; 
  import { addToast } from '$lib/stores/toast';
  import type { MonetizationKit } from '$lib/types';

  export let user: any;
  export let displayMonetizationData: MonetizationKit | undefined;
  export let analysisData: any; 
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
      <p class="text-lg font-semibold text-gray-900">Monetization kit</p>
      <p class="mt-1 text-sm text-gray-500">Suggested pricing, packages & plug-and-play templates to pitch sponsors.</p>
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
                <defs>
                </defs>
                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <path d="M15.947,8.379 C15.872,4.257 12.596,0.967 8.644,1.042 C4.727,1.115 1.791,3.93216431 1.814,8.00616431 L0.204284668,8.00616443 C-0.0127153322,8.22616443 -0.0127153322,8.88200012 0.204284668,9.10200012 L2.115,10.86 C2.332,11.082 2.681,11.082 2.9,10.86 L4.82086158,9.10200012 C5.03886158,8.88200012 5.03886158,8.22616443 4.82086158,8.00616443 L3.203,8.00616431 C3.18,4.66816431 5.462,2.461 8.67,2.402 C11.902,2.34 14.582,5.032 14.645,8.404 C14.707,11.726 12.2,14.481 9.032,14.62 L9.032,15.981 C12.93,15.842 16.023,12.46 15.947,8.379 L15.947,8.379 Z" fill="#434343" class="si-glyph-fill">

                </path>
                    </g>
                </svg>
              {:else}
                <svg width="24px" height="24px" viewBox="0 -0.5 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="si-glyph si-glyph-circle-load-left">
                <defs>
                </defs>
                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <path d="M15.947,8.379 C15.872,4.257 12.596,0.967 8.644,1.042 C4.727,1.115 1.791,3.93216431 1.814,8.00616431 L0.204284668,8.00616443 C-0.0127153322,8.22616443 -0.0127153322,8.88200012 0.204284668,9.10200012 L2.115,10.86 C2.332,11.082 2.681,11.082 2.9,10.86 L4.82086158,9.10200012 C5.03886158,8.88200012 5.03886158,8.22616443 4.82086158,8.00616443 L3.203,8.00616431 C3.18,4.66816431 5.462,2.461 8.67,2.402 C11.902,2.34 14.582,5.032 14.645,8.404 C14.707,11.726 12.2,14.481 9.032,14.62 L9.032,15.981 C12.93,15.842 16.023,12.46 15.947,8.379 L15.947,8.379 Z" fill="#434343" class="si-glyph-fill">

                </path>
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
      <TabLoadingSpinner message="Generating monetization roadmap and templates..." />
    {:else if displayMonetizationData}
      <div class="space-y-6">
        <div class="border border-green-200 rounded-lg p-5 bg-green-50/70 mb-6">
          <p class="text-sm font-semibold text-gray-800">Projected Sponsor Value (for one dedicated post):</p>
          <div class="mt-2 flex items-baseline gap-2">
            <p class="text-2xl font-extrabold text-gray-900">
                {displayMonetizationData.projectedSponsorValue}
            </p>
             <p class="text-green-700 font-medium text-xs">
              (Based on {analysisData.analysis.avgEngagementRate}% Avg. ER & audience size)
            </p>
          </div>
        </div>

        <div>
          <h3 class="text-base font-semibold text-gray-900 mb-3">Suggested Sponsorship Packages</h3>
          <div class="rounded-lg border border-gray-200 bg-white overflow-hidden">
            {#each displayMonetizationData.packages as pkg, i}
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 {i !== displayMonetizationData.packages.length - 1 ? 'border-b border-gray-100' : ''}">
                <div class="mb-2 sm:mb-0">
                  <div class="text-sm font-bold text-primary">{pkg.name}</div>
                  <div class="text-xs text-gray-500 mt-0.5">{pkg.description}</div>
                </div>
                <div class="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full self-start sm:self-auto">
                    {pkg.price}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div>
          <h3 class="text-base font-semibold text-gray-900 mb-3">Pitch Email Snippet (Ready to Copy)</h3>
          <div class="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
            <div class="flex justify-between items-center mb-3">
                <p class="font-bold text-primary text-sm">The "Synergy First" Pitch</p>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                <p class="italic text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-serif">
                    "{displayMonetizationData.pitchEmailSnippet}"
                </p>
            </div>
            <button 
                on:click={() => copyToClipboard(displayMonetizationData?.pitchEmailSnippet || "", "Snippet Copied!")} 
                class="inline-flex items-center rounded-lg bg-white border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
                Copy Snippet
            </button>
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <LockedFeature 
      title="Unlock Monetization Blueprint" 
      subtitle="Access suggested pricing, packages, and ready-to-use email & DM templates to pitch brands and sponsors."
      {openProModal}
    >
      <div class="border border-green-200 rounded-lg p-4 bg-green-50/70 mb-6">
        <p class="text-sm font-semibold text-gray-800">Projected Sponsor Value (for one dedicated post):</p>
        <p class="mt-2 text-base font-bold text-gray-900">$325 USD...</p>
      </div>
      <div class="p-3 border border-gray-200 rounded-lg bg-white">
        <p class="font-bold text-primary">Sponsorship Packages</p>
        <ul class="list-disc pl-4 space-y-1 text-sm">
          <li>**Standard:** 1 tweet, 1 day pinning ($300)</li>
          <li>**Premium:** 3 tweets over 1 week... ($850)</li>
        </ul>
      </div>
    </LockedFeature>
  {/if}
</div>
