<script lang="ts">
  import type { TabId, ProFixesResult, MonetizationKit } from "$lib/types";
  import { page } from "$app/stores";
  import { addToast } from "$lib/stores/toast";

  export let hasResult: boolean;
  export let openProModal: () => void;
  export let isLoading: boolean = false;
  export let analysisData: any = null;
  export let handle: any = "";

  // Lấy dữ liệu user từ store
  $: user = $page.data.user;

  // New state for Pro Data, loaded on-demand
  let proDataLoaded = false;
  let isProDataLoading = false;
  let proFixesData: ProFixesResult | undefined = undefined;
  let proMonetizationData: MonetizationKit | undefined = undefined;

  let activeTab: TabId = "audit-free";

  // --- NEW LOGIC: FETCH PRO DATA ON TAB CLICK ---
  async function fetchProData(handle: string) {
    if (!handle) return;
    if (proDataLoaded || isProDataLoading || !user?.isPro) return;

    isProDataLoading = true;
    addToast("Generating Pro report...", "info");

    try {
      const response = await fetch("/api/generate-pro-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.toLowerCase() }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate Pro content.");
      }

      const data = await response.json();
      proFixesData = data.fixesGrowth;
      proMonetizationData = data.monetizationKit;
      proDataLoaded = true;

      if (data.isCached) {
        addToast("Loaded Pro report from cache.", "info");
      } else {
        addToast("Pro report generated successfully!", "success");
      }
    } catch (error: any) {
      console.error(error);
      addToast(error.message, "error");
    } finally {
      isProDataLoading = false;
    }
  }

  function handleTabClick(tab: TabId) {
    activeTab = tab;

    // Nếu là user Pro và chuyển sang tab Pro, kiểm tra và fetch data
    if (user?.isPro && (tab === "fixes-growth" || tab === "monetization-kit")) {
      fetchProData(handle);
    }
  }

  $: formattedTime = analysisData?.timestamp
    ? new Date(analysisData.timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // Dữ liệu Pro để hiển thị UI
  $: displayFixesData = proFixesData;
  $: displayMonetizationData = proMonetizationData;
</script>

<section class="mt-0 mx-auto max-w-5xl px-4 sm:px-6 lg:px-0">
  {#if isLoading || isProDataLoading}
    <section class="mt-0 max-w-4xl mx-auto text-center">
      <div
        class="rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-8 max-w-2xl mx-auto shadow-soft"
      >
        <div
          class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-primary shadow-inner"
        >
          <svg
            class="h-5 w-5 animate-spin text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 
24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
        </div>
        <p class="mt-4 text-lg font-semibold text-gray-900">
          {#if isProDataLoading}Generating Pro Content...{:else}Analyzing
            profile...{/if}
        </p>

        <p class="mt-1 text-sm text-gray-600 max-w-md mx-auto">
          {#if isProDataLoading}Please wait, our AI is writing your drafts &
            roadmap...{:else}Please wait, we're auditing the bio, pinned tweet,
            and last 20 posts...{/if}
        </p>
      </div>
    </section>
  {:else}
    <section class="mt-0 max-w-4xl mx-auto">
      {#if !hasResult}
        <div
          class="rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-8 text-center max-w-2xl mx-auto shadow-soft"
        >
          <div
            class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 shadow-inner"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.6"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 
9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <p class="mt-4 text-lg font-semibold text-gray-900">
            Run your first X Profile Audit
          </p>
          <p class="mt-1 text-sm text-gray-600 max-w-md mx-auto">
            Paste an X handle above and hit
            <span class="font-medium">'Analyze profile'</span> to generate your personalized
            report.
          </p>
        </div>
      {/if}

      {#if hasResult && analysisData}
        {#if !user?.isPro}
          <div
            class="mt-0 rounded-lg bg-blue-50 border border-blue-200 p-4 text-center max-w-4xl mx-auto"
          >
            <p class="text-sm text-blue-800">
              This report was generated at <strong class="font-semibold"
                >{formattedTime}</strong
              >
              (data is cached for 10 minutes).
            </p>
            <button
              type="button"
              class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              on:click={openProModal}
            >
              ✨ Upgrade to Pro to analyze real-time data
            </button>
          </div>
        {/if}

        <div
          class="mt-8 rounded-lg bg-white shadow-soft border border-gray-200"
        >
          <div class="mx-auto max-w-full">
            <div
              class="flex justify-center overflow-x-auto whitespace-nowrap text-sm border-b border-gray-200"
            >
              <button
                type="button"
                class="tab-button relative px-5 py-2.5 text-sm border-b-2
transition-colors"
                class:text-primary={activeTab === "audit-free"}
                class:font-semibold={activeTab === "audit-free"}
                class:border-primary={activeTab === "audit-free"}
                class:text-gray-600={activeTab !== "audit-free"}
                class:font-medium={activeTab !== "audit-free"}
                class:border-transparent={activeTab !== "audit-free"}
                on:click={() => handleTabClick("audit-free")}
              >
                Audit Overview
              </button>

              <button
                type="button"
                class="tab-button relative px-5 py-2.5 text-sm border-b-2 transition-colors"
                class:text-primary={activeTab === "fixes-growth"}
                class:font-semibold={activeTab === "fixes-growth"}
                class:border-primary={activeTab === "fixes-growth"}
                class:text-gray-600={activeTab !== "fixes-growth"}
                class:font-medium={activeTab !== "fixes-growth"}
                class:border-transparent={activeTab !== "fixes-growth"}
                on:click={() => handleTabClick("fixes-growth")}
              >
                Copy &amp; Growth
                {#if !user?.isPro}
                  <span
                    class="ml-1 inline-flex items-center rounded-full px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wide"
                  >
                    Pro
                  </span>
                {/if}
              </button>

              <button
                type="button"
                class="tab-button relative px-5 py-2.5 text-sm border-b-2 transition-colors"
                class:text-primary={activeTab === "monetization-kit"}
                class:font-semibold={activeTab === "monetization-kit"}
                class:border-primary={activeTab === "monetization-kit"}
                class:text-gray-600={activeTab !== "monetization-kit"}
                class:font-medium={activeTab !== "monetization-kit"}
                class:border-transparent={activeTab !== "monetization-kit"}
                on:click={() => handleTabClick("monetization-kit")}
              >
                Monetization Kit

                {#if !user?.isPro}
                  <span
                    class="ml-1 inline-flex items-center rounded-full px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wide"
                  >
                    Pro
                  </span>
                {/if}
              </button>
            </div>
          </div>

          <div id="tab-content-container">
            {#if activeTab === "audit-free"}
              <div class="tab-content p-6 sm:p-8">
                <div class=" pb-2 mb-0 space-y-5">
                  <div class="grid gap-6 md:grid-cols-2 md:items-start">
                    <div class="space-y-6">
                      <div
                        class="border border-gray-200 rounded-lg p-4 bg-gray-50/70"
                      >
                        <p class="text-sm font-semibold text-gray-800">
                          Your Target Audience Profile
                        </p>
                        <p class="mt-2 text-sm text-gray-900 text-left">
                          Based on your content, you are successfully reaching: <br
                          />

                          <span class="font-bold text-primary">
                            {analysisData.analysis.targetAudience}
                          </span>.
                        </p>
                      </div>

                      <div
                        class="flex items-center gap-4 text-sm bg-white p-3 rounded-lg border border-gray-200"
                      >
                        <p class="font-semibold text-gray-600">
                          Avg. Engagement Rate:
                        </p>
                        <p class="text-lg font-extrabold text-gray-900">
                          {analysisData.analysis.avgEngagementRate}%
                        </p>
                      </div>

                      <div>
                        <div class="flex items-center justify-between mb-2">
                          <p class="text-sm font-semibold text-gray-800">
                            Key Scores (0–100)
                          </p>
                          <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary
text-white"
                          >
                            Overall: {analysisData.analysis.totalScore}/100
                          </span>
                        </div>
                        <div class="mt-4 space-y-3 text-xs">
                          <div class="flex items-center gap-3">
                            <div class="w-32 text-gray-600">Niche Clarity</div>
                            <div class="flex-1">
                              <div class="h-2 rounded-full bg-gray-200">
                                <div
                                  class="h-2 rounded-full bg-primary"
                                  style="width: {analysisData.analysis.keyScores
                                    .nicheClarity}%"
                                ></div>
                              </div>
                            </div>
                            <div
                              class="w-10 text-right text-gray-900 font-semibold"
                            >
                              {analysisData.analysis.keyScores.nicheClarity}
                            </div>
                          </div>
                          <div class="flex items-center gap-3">
                            <div class="w-32 text-gray-600">Offer Clarity</div>
                            <div class="flex-1">
                              <div class="h-2 rounded-full bg-gray-200">
                                <div
                                  class="h-2 rounded-full bg-primary"
                                  style="width: {analysisData.analysis.keyScores
                                    .offerClarity}%"
                                ></div>
                              </div>
                            </div>
                            <div
                              class="w-10 text-right text-gray-900 font-semibold"
                            >
                              {analysisData.analysis.keyScores.offerClarity}
                            </div>
                          </div>
                          <div class="flex items-center gap-3">
                            <div class="w-32 text-gray-600">
                              Monetization Readiness
                            </div>
                            <div class="flex-1">
                              <div class="h-2 rounded-full bg-gray-200">
                                <div
                                  class="h-2 rounded-full bg-primary"
                                  style="width: {analysisData.analysis.keyScores
                                    .monetization}%"
                                ></div>
                              </div>
                            </div>
                            <div
                              class="w-10 text-right text-gray-900 font-semibold"
                            >
                              {analysisData.analysis.keyScores.monetization}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div
                        class="mt-0 space-y-4 text-sm text-gray-800 text-left"
                      >
                        <div
                          class="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3"
                        >
                          <p
                            class="text-xs font-bold uppercase tracking-wide text-rose-700"
                          >
                            Biggest leaks
                          </p>
                          <ul
                            class="mt-2 space-y-1.5 list-disc pl-5 text-sm text-rose-800 marker:text-rose-500"
                          >
                            {#each analysisData.analysis.leaks as leak}
                              <li>{leak}</li>
                            {/each}
                          </ul>
                        </div>
                        <div
                          class="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3"
                        >
                          <p
                            class="text-xs font-bold uppercase tracking-wide text-emerald-700"
                          >
                            Growth tips (What to do)
                          </p>
                          <ul
                            class="mt-2 space-y-1.5 list-disc pl-5 text-sm text-emerald-800 marker:text-emerald-500"
                          >
                            {#each analysisData.analysis.tips as tip}
                              <li>{tip}</li>
                            {/each}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {/if}

            {#if activeTab === "fixes-growth"}
              <div class="tab-content p-6 sm:p-8">
                <div
                  class="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-6 mb-6"
                >
                  <div>
                    <p class="text-lg font-semibold text-gray-900">
                      Copy fixes &amp; content breakdown
                    </p>
                    <p class="mt-1 text-sm text-gray-500">
                      Optimized bio, pinned tweet drafts, and a deeper look at
                      what actually performs.
                    </p>
                  </div>
                  {#if !user?.isPro}
                    <span
                      class="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 border border-rose-200"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                      Pro feature
                    </span>
                  {/if}
                </div>

                {#if user?.isPro}
                  {#if displayFixesData}
                    <div class="space-y-8">
                      <div class="grid gap-6 md:grid-cols-2">
                        <div
                          class="border border-indigo-200 rounded-lg p-4 bg-indigo-50/70"
                        >
                          <p class="text-sm font-semibold text-gray-800">
                            Your Winning Content Hook:
                          </p>
                          <p class="mt-2 text-base text-gray-900 font-bold">
                            {displayFixesData.contentHook}
                            <span class="text-indigo-600 font-normal text-sm">
                              (Found in your {displayFixesData.highestImpactCount}
                              highest-impact posts)
                            </span>
                          </p>
                        </div>

                        <div
                          class="border border-green-200 rounded-lg p-4 bg-green-50/70"
                        >
                          <p class="text-sm font-semibold text-gray-800">
                            Best Content Format for you:
                          </p>
                          <p class="mt-2 text-base text-gray-900 font-bold">
                            {displayFixesData.contentFormat}
                            <span class="text-green-600 font-normal text-sm">
                              ({displayFixesData.formatPercentage}% of your top
                              posts use this)
                            </span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 class="text-base font-semibold text-gray-900 mb-3">
                          3 Optimized Bio Drafts (Ready to Copy)
                        </h3>
                        <div class="space-y-3">
                          {#each displayFixesData.bioDrafts as draft}
                            <div
                              class="p-3 border border-gray-200 rounded-lg bg-white flex items-center justify-between"
                            >
                              <div class="flex-1 mr-4">
                                <p class="font-bold text-primary">
                                  {draft.title}
                                </p>
                                <p class="mt-1 text-sm text-gray-700">
                                  {draft.content}
                                </p>
                              </div>
                              <button
                                on:click={() => {
                                  navigator.clipboard.writeText(draft.content);
                                  addToast("Bio Copied!", "success");
                                }}
                                class="shrink-0 rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                          {/each}
                        </div>
                      </div>

                      <div>
                        <h3 class="text-base font-semibold text-gray-900 mb-3">
                          Optimized Pinned Tweet Draft
                        </h3>
                        <div
                          class="p-4 border border-gray-200 rounded-xl bg-white shadow-soft"
                        >
                          <p class="font-bold text-primary mb-2">
                            The "Conversion Funnel" Tweet
                          </p>
                          <p class="whitespace-pre-wrap text-sm text-gray-800">
                            {displayFixesData.pinnedTweetCopy}
                          </p>
                          <button
                            on:click={() => {
                              navigator.clipboard.writeText(
                                displayFixesData.pinnedTweetCopy,
                              );
                              addToast("Tweet Copied!", "success");
                            }}
                            class="mt-3 inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            Copy Tweet
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 class="text-base font-semibold text-gray-900 mb-3">
                          Your Next 5 Content Ideas (Never get writer's block)
                        </h3>
                        <ul
                          class="space-y-2 text-sm text-gray-700 list-disc pl-5"
                        >
                          {#each displayFixesData.nextTweetIdeas as idea}
                            <li class="pl-1 text-gray-800 font-medium">
                              {idea}
                            </li>
                          {/each}
                        </ul>
                      </div>
                    </div>
                  {:else}{/if}
                {:else}
                  <div class="relative">
                    <div
                      class="border border-indigo-200 rounded-lg p-4 bg-indigo-50/70 mb-6"
                    >
                      <p class="text-sm font-semibold text-gray-800">
                        Your Best Performing Content Hook:
                      </p>
                      <p class="mt-2 text-base text-gray-900 font-bold">
                        The "Proof &amp; Prediction" Framework
                        <span class="text-indigo-600 font-normal text-sm">
                          (Found in your 3 highest-impact posts)
                        </span>
                      </p>
                    </div>

                    <div class="relative">
                      <div
                        class="text-sm text-gray-400 space-y-4 blur-sm pointer-events-none"
                      >
                        <div
                          class="p-3 border border-gray-200 rounded-lg bg-white"
                        >
                          <p class="font-bold text-primary">
                            Bio Draft 1 (The Authority)
                          </p>
                          <p>
                            Building @SaaSToolName from $0 to $10k MRR. Follow
                            along for transparent growth logs &amp; playbooks. I
                            help indie devs launch profitable products.
                          </p>
                        </div>
                        <div
                          class="p-3 border border-gray-200 rounded-lg bg-white"
                        >
                          <p class="font-bold text-primary">
                            Best Content Format:
                          </p>
                          <p>
                            Short-form threads (5-7 tweets) focused on a single
                            tactical problem.
                            <strong>82% of your top posts</strong> use this format.
                          </p>
                        </div>
                        <div
                          class="p-3 border border-gray-200 rounded-lg bg-white"
                        >
                          <p class="font-bold text-primary">
                            Your Pinned Tweet Copy:
                          </p>
                          <p class="italic">
                            "If you're a founder struggling with initial
                            traction, this thread is for you. I detail the 3
                            systems I use to get my first 100 paid users..."
                          </p>
                        </div>
                      </div>

                      <div
                        class="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-300 text-center py-10"
                      >
                        <div
                          class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-md"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.6"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-6.75 0h13.5a2.25 2.25 
                            0 0 1 2.25 2.25v6.75a2.25 2.25 0 0 1-2.25 2.25H2.25A2.25 2.25 0 0 1 0 19.5v-6.75a2.25 2.25 0 0 1 2.25-2.25Z"
                            />
                          </svg>
                        </div>
                        <p class="mt-4 text-lg font-bold text-gray-900">
                          Unlock Your Full Growth Kit
                        </p>
                        <p
                          class="text-sm text-gray-600 max-w-md text-center mt-2 mb-5"
                        >
                          Get all 3 Optimized Bio Drafts, your Best Performing
                          Content Format, and the Pinned Tweet ready to
                          copy-paste.
                        </p>
                        <button
                          type="button"
                          class="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-gray-900 transition-colors"
                          on:click={openProModal}
                        >
                          Get Pro Access ($15/mo)
                        </button>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}

            {#if activeTab === "monetization-kit"}
              <div class="tab-content p-6 sm:p-8">
                <div
                  class="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-6 mb-6"
                >
                  <div>
                    <p class="text-lg font-semibold text-gray-900">
                      Monetization kit
                    </p>
                    <p class="mt-1 text-sm text-gray-500">
                      Suggested pricing, packages &amp; plug-and-play templates
                      to pitch sponsors.
                    </p>
                  </div>
                  {#if !user?.isPro}
                    <span
                      class="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 border border-rose-200"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                      Pro feature
                    </span>
                  {/if}
                </div>

                {#if user?.isPro}
                  {#if displayMonetizationData}
                    <div class="space-y-6">
                      <div
                        class="border border-green-200 rounded-lg p-4 bg-green-50/70 mb-6"
                      >
                        <p class="text-sm font-semibold text-gray-800">
                          Projected Sponsor Value (for one dedicated post):
                        </p>
                        <p class="mt-2 text-base font-bold text-gray-900">
                          {displayMonetizationData.projectedSponsorValue}
                          <span class="text-green-600 font-normal text-sm">
                            (Calculated based on {analysisData.analysis
                              .avgEngagementRate}% Avg. ER &amp; follower count)
                          </span>
                        </p>
                      </div>

                      <div>
                        <h3 class="text-base font-semibold text-gray-900 mb-3">
                          Suggested Sponsorship Packages
                        </h3>
                        <div
                          class="p-3 border border-gray-200 rounded-lg bg-white space-y-2"
                        >
                          {#each displayMonetizationData.packages as pkg}
                            <div
                              class="flex justify-between items-center border-b border-gray-100 last:border-b-0 py-1.5"
                            >
                              <div class="text-sm text-gray-700">
                                <strong class="text-primary">{pkg.name}:</strong
                                >
                                {pkg.description}
                              </div>
                              <span class="text-sm font-bold text-green-600"
                                >{pkg.price}</span
                              >
                            </div>
                          {/each}
                        </div>
                      </div>

                      <div>
                        <h3 class="text-base font-semibold text-gray-900 mb-3">
                          Pitch Email Snippet (Ready to Copy)
                        </h3>
                        <div
                          class="p-4 border border-gray-200 rounded-xl bg-white shadow-soft"
                        >
                          <p class="font-bold text-primary mb-2">
                            The "Synergy First" Pitch
                          </p>
                          <p class="italic text-sm text-gray-800">
                            {displayMonetizationData.pitchEmailSnippet}
                          </p>
                          <button
                            on:click={() => {
                              navigator.clipboard.writeText(
                                displayMonetizationData.pitchEmailSnippet,
                              );
                              addToast("Snippet Copied!", "success");
                            }}
                            class="mt-3 inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            Copy Snippet
                          </button>
                        </div>
                      </div>
                    </div>
                  {:else}
                    <!--  -->
                  {/if}
                {:else}
                  <div class="relative">
                    <div
                      class="border border-green-200 rounded-lg p-4 bg-green-50/70 mb-6"
                    >
                      <p class="text-sm font-semibold text-gray-800">
                        Projected Sponsor Value (for one dedicated post):
                      </p>
                      <p class="mt-2 text-base font-bold text-gray-900">
                        $325 USD
                        <span class="text-green-600 font-normal text-sm">
                          (Calculated based on 1.9% Avg. ER &amp; 50K
                          Impressions/mo)
                        </span>
                      </p>
                    </div>

                    <div class="relative">
                      <div
                        class="text-sm text-gray-400 space-y-4 blur-sm pointer-events-none"
                      >
                        <div
                          class="p-3 border border-gray-200 rounded-lg bg-white"
                        >
                          <p class="font-bold text-primary">
                            Sponsorship Packages
                          </p>
                          <ul class="list-disc pl-4 space-y-1">
                            <li>**Standard:** 1 tweet, 1 day pinning ($300)</li>
                            <li>
                              **Premium:** 3 tweets over 1 week, included in a
                              Thread ($850)
                            </li>
                            <li>
                              **Acquisition:** 1 Month Partnership, dedicated
                              Thread, Bio mention ($2,500)
                            </li>
                          </ul>
                        </div>
                        <div
                          class="p-3 border border-gray-200 rounded-lg bg-white"
                        >
                          <p class="font-bold text-primary">
                            Pitch Email Template Snippet
                          </p>
                          <p class="italic">
                            "Hi [Brand Contact], I saw your recent launch and
                            noticed a huge synergy with my audience (SaaS
                            Founders, 1.9% ER). I have a 3-tier package perfect
                            for driving MQLs..."
                          </p>
                        </div>
                      </div>

                      <div
                        class="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-300 text-center py-10"
                      >
                        <div
                          class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-md"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.6"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-6.75 0h13.5a2.25 2.25 0 0 1 2.25 2.25v6.75a2.25 2.25 0 0 1-2.25 2.25H2.25A2.25 2.25 0 0 1 0 19.5v-6.75a2.25 2.25 0 0 1 2.25-2.25Z"
                            />
                          </svg>
                        </div>
                        <p class="mt-4 text-lg font-bold text-gray-900">
                          Unlock Monetization Blueprint
                        </p>
                        <p
                          class="text-sm text-gray-600 max-w-md text-center mt-2 mb-5"
                        >
                          Access suggested pricing, packages, and ready-to-use
                          email &amp; DM templates to pitch brands and sponsors.
                        </p>
                        <button
                          type="button"
                          class="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-gray-900 transition-colors"
                          on:click={openProModal}
                        >
                          Get Pro Access ($15/mo)
                        </button>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </section>
  {/if}
</section>
