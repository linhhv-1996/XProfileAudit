<script lang="ts">
  export let openProModal: () => void;
</script>

<header class="border-b border-gray-100 bg-white/95 backdrop-blur z-10 sticky top-0">
  <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-0">
    <!-- svelte-ignore a11y_invalid_attribute -->
    <a href="#" class="flex items-center gap-2">
      <div
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-white shadow-lg"
      >
        X
      </div>
      <span class="text-xl font-bold tracking-tight text-gray-900">X Profile Studio</span>
    </a>

    <div class="flex items-center gap-3 text-sm">
      <button
        class="hidden sm:inline-flex items-center rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-rose-600 transition-colors"
        type="button"
        on:click={openProModal}
      >
        <span class="mr-1">✨</span> Upgrade to Pro
      </button>

      <a
  href="/login"
  class="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
>
  Log in
</a>
    </div>
  </div>
</header>
