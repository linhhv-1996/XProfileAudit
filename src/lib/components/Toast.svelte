<script lang="ts">
  import { toasts, removeToast } from '$lib/stores/toast';
  import { fade, fly } from 'svelte/transition';

  const colors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-gray-900 text-white'
  };
</script>

<div class="fixed top-5 right-5 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
  {#each $toasts as toast (toast.id)}
    <div
      in:fly={{ y: -20, duration: 300 }} 
      out:fade={{ duration: 200 }}
      class="{colors[toast.type]} pointer-events-auto rounded-lg shadow-xl px-4 py-3 text-sm font-medium flex items-center justify-between gap-3 transform transition-all"
    >
      <span>{toast.message}</span>
      <button on:click={() => removeToast(toast.id)} class="opacity-70 hover:opacity-100">✕</button>
    </div>
  {/each}
</div>
