<script lang="ts">
  import type { TabId, ProFixesResult, MonetizationKit } from "$lib/types";
  import { page } from "$app/stores";
  import { addToast } from "$lib/stores/toast";

  // Import sub-components
  import LoadingState from "$lib/components/analysis/LoadingState.svelte";
  import EmptyState from "$lib/components/analysis/EmptyState.svelte";
  import AuditOverview from "$lib/components/analysis/AuditOverview.svelte";
  import ProFixesTab from "$lib/components/analysis/ProFixesTab.svelte";
  import MonetizationTab from "$lib/components/analysis/MonetizationTab.svelte";
  import ProfileCard from "$lib/components/analysis/ProfileCard.svelte";

  export let hasResult: boolean;
  export let openProModal: () => void;
  export let isLoading: boolean = false;
  export let analysisData: any = null;
  export let handle: any = "";

  $: user = $page.data.user;

  // Pro Data State (Giữ nguyên)
  let proDataLoaded = false;
  let isProDataLoading = false;
  let proFixesData: ProFixesResult | undefined = undefined;
  let proMonetizationData: MonetizationKit | undefined = undefined;

  let lastProHandle: string | undefined = undefined;

  $: {
      if (analysisData) {
          const currentHandle = handle.toLowerCase();
          if (lastProHandle !== currentHandle) {
              proDataLoaded = false;
              proFixesData = undefined;
              proMonetizationData = undefined;
              lastProHandle = undefined;
              console.log(`[AnalysisSection] Handle changed to ${currentHandle}. Resetting Pro data.`);
          }
      }
  }

  let activeTab: TabId = "audit-free";

  function handleRegenerate() {
    fetchProData(handle, true);
  }

  async function fetchProData(handle: string, regenerate: boolean = false) {
    if (!handle) {
      addToast("Please analyze a profile first.", "error");
      return;
    }

    if (isProDataLoading) return;
    if (!user?.isPro) return;

    if (proDataLoaded && !regenerate) {
        return;
    }

    isProDataLoading = true;
    addToast("Generating Pro report...", "info");
    try {
      const response = await fetch("/api/generate-pro-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.toLowerCase(), regenerate }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate Pro content.");
      }

      const data = await response.json();
      proFixesData = data.fixesGrowth;
      proMonetizationData = data.monetizationKit;
      proDataLoaded = true;

      lastProHandle = handle.toLowerCase();

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

  $: displayFixesData = proFixesData;
  $: displayMonetizationData = proMonetizationData;
</script>

<section class="mt-0 mx-auto max-w-5xl px-4 sm:px-6 lg:px-0">
  {#if isLoading}
    <LoadingState isProDataLoading={false} />
  {:else}
    <section class="mt-0 max-w-4xl mx-auto">
      {#if !hasResult}
        <EmptyState />
      {/if}

      {#if hasResult && analysisData}
        <ProfileCard 
           profile={analysisData.profile} 
           totalScore={analysisData.analysis.totalScore} 
        />

        {#if !user?.isPro}
          <div class="mt-0 rounded-lg bg-blue-50 border border-blue-200 p-4 text-center max-w-4xl mx-auto">
            <p class="text-sm text-blue-800">
              This report was generated at <strong class="font-semibold">{formattedTime}</strong>
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

        <div class="mt-8 rounded-lg bg-white shadow-soft border border-gray-200">
          <div class="mx-auto max-w-full">
            <div class="flex justify-center overflow-x-auto whitespace-nowrap text-sm border-b border-gray-200">
              <button
                type="button"
                class="tab-button relative px-5 py-2.5 text-sm border-b-2 transition-colors"
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
                Copy & Growth
                {#if !user?.isPro}
                  <span class="ml-1 inline-flex items-center rounded-full px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wide">Pro</span>
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
                  <span class="ml-1 inline-flex items-center rounded-full px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wide">Pro</span>
                {/if}
              </button>
            </div>
          </div>

          <div id="tab-content-container">
            {#if activeTab === "audit-free"}
              <AuditOverview {analysisData} />
            {/if}

            {#if activeTab === "fixes-growth"}
              <ProFixesTab {user} {displayFixesData} {openProModal} {isProDataLoading} {handleRegenerate}/>
            {/if}

            {#if activeTab === "monetization-kit"}
              <MonetizationTab {user} {displayMonetizationData} {analysisData} {openProModal} {isProDataLoading} {handleRegenerate}/>
            {/if}
          </div>
        </div>
      {/if}
    </section>
  {/if}
</section>
