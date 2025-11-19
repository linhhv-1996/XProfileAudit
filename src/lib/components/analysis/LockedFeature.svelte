<script lang="ts">
  export let title: string;
  export let subtitle: string;
  export let openProModal: () => void;
</script>

<div class="relative">
  <div class="text-sm text-gray-400 space-y-4 blur-sm pointer-events-none select-none">
    <slot />
  </div>

  <div class="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-300 text-center py-10 z-10">
    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-md">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-6.75 0h13.5a2.25 2.25 0 0 1 2.25 2.25v6.75a2.25 2.25 0 0 1-2.25 2.25H2.25A2.25 2.25 0 0 1 0 19.5v-6.75a2.25 2.25 0 0 1 2.25-2.25Z" />
      </svg>
    </div>
    <p class="mt-4 text-lg font-bold text-gray-900">{title}</p>
    <p class="text-sm text-gray-600 max-w-md text-center mt-2 mb-5">{subtitle}</p>
    <button
      type="button"
      class="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-gray-900 transition-colors"
      on:click={openProModal}
    >
      Get Pro Access ($15/mo)
    </button>
  </div>
</div>
