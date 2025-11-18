<script lang="ts">
  export let handle: string;
  export let onAnalyze: () => void;
</script>

<section class="mx-auto max-w-5xl px-4 pt-12 pb-6 sm:px-6 lg:px-0">
  <div class="max-w-3xl mx-auto text-center space-y-7">
    <div
      class="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-3 py-1 text-xs text-primary font-medium shadow-sm"
    >
      <span>Get your full X strategy &amp; monetization roadmap.</span>
    </div>

    <div class="space-y-4">
      <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-5xl">
        Turn your X profile into a high-converting, growth-ready asset.
      </h1>
      <p class="text-base sm:text-lg leading-relaxed text-gray-600 max-w-xl mx-auto">
        Paste your handle, we read your bio &amp; last 20 posts, then return a clear
        <strong>audit</strong>, <strong>fixed copy</strong> and
        <strong>growth &amp; monetization tips</strong>.
      </p>
    </div>

    <div class="max-w-xl mx-auto w-full text-left space-y-4 pt-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div class="relative flex-1">
          <label for="handle-input" class="sr-only">X handle</label>
          <span
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-500"
          >
            @
          </span>
          <input
            id="handle-input"
            type="text"
            placeholder="your_handle"
            bind:value={handle}
            class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-7 pr-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-primary focus:ring-primary focus:ring-1 transition-all"
          />
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-gray-900 transition-colors whitespace-nowrap"
          on:click={onAnalyze}
        >
          Analyze profile
        </button>
      </div>

      <p class="text-center text-[11px] text-gray-500">
        ℹ️ Free reports are cached for 10 minutes.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 pt-1">
        <div class="inline-flex items-center gap-1.5">
          <span
            class="h-4 w-4 rounded-full border border-gray-300 bg-white flex items-center justify-center text-[10px] font-bold text-primary shadow-sm"
          >
            ✓
          </span>
          <span>Read-only, public data only</span>
        </div>
        <div class="inline-flex items-center gap-1.5">
          <span
            class="h-4 w-4 rounded-full border border-gray-300 bg-white flex items-center justify-center text-[10px] font-bold text-primary shadow-sm"
          >
            ✓
          </span>
          <span>No posting on your behalf</span>
        </div>
      </div>
    </div>
  </div>
</section>
