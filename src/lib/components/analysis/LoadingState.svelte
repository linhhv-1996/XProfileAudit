<script lang="ts">
  export let isProDataLoading: boolean = false;
</script>

<section class="mt-0 max-w-4xl mx-auto text-center">
  <div class="rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-8 max-w-2xl mx-auto shadow-soft">
    <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-primary shadow-inner">
      <svg class="h-5 w-5 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
    </div>
    <p class="mt-4 text-lg font-semibold text-gray-900">
      {#if isProDataLoading}Generating Pro Content...{:else}Analyzing profile...{/if}
    </p>
    <p class="mt-1 text-sm text-gray-600 max-w-md mx-auto">
      {#if isProDataLoading}Please wait, our AI is writing your drafts & roadmap...{:else}Please wait, we're auditing the bio, pinned tweet, and last 20 posts...{/if}
    </p>
  </div>
</section>
