<script lang="ts">
  export let message: string;
</script>

<div class="flex flex-col items-center justify-center py-10 px-4 space-y-3 text-center">
  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-primary shadow-inner">
    <svg class="h-5 w-5 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
  </div>
  <p class="text-base font-semibold text-gray-800">{message}</p>
</div>
