<script lang="ts">
  export let closeProModal: () => void;

  let plan: 'monthly' | 'ltd' = 'monthly';
  function handleContinue() {
    console.log('Selected plan:', plan);
  }
</script>

<div class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm px-4 animate-fade-in">
  
  <button 
    class="absolute inset-0 w-full h-full bg-transparent border-0 cursor-default focus:outline-none" 
    on:click={closeProModal}
    type="button"
    aria-label="Close modal backdrop"
    tabindex="-1"
  ></button>

  <div class="relative w-full max-w-[520px] rounded-xl border border-gray-200 bg-white shadow-2xl transform transition-all scale-100 z-10">
    <div class="flex items-start justify-between gap-3 border-b border-gray-100 px-5 sm:px-6 py-4">
      <div class="space-y-1">
        <p class="text-lg font-bold text-gray-900">
          Upgrade to X Profile Booster <span class="text-rose-600">Pro</span>
        </p>
        <p class="text-sm text-gray-500">
          Unlock the complete <strong>Monetization Kit</strong> & <strong>Growth Templates</strong>.
        </p>
      </div>
      <button
        class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
        type="button"
        on:click={closeProModal}
        aria-label="Close modal" 
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="px-5 sm:px-6 py-5 space-y-6">
      
      <div class="text-center sm:text-left">
        {#if plan === 'monthly'}
          <div class="flex items-baseline gap-1 justify-center sm:justify-start">
              <span class="text-4xl font-extrabold text-gray-900">$15</span>
              <span class="text-base font-medium text-gray-500">/ month</span>
          </div>
          <p class="mt-1 text-sm text-gray-500">Flexible plan. Cancel anytime.</p>
        {:else}
          <div class="flex items-baseline gap-1 justify-center sm:justify-start">
              <span class="text-4xl font-extrabold text-gray-900">$65</span>
              <span class="text-base font-medium text-gray-500">one-time</span>
          </div>
          <p class="mt-1 text-sm text-gray-500">Lifetime access. Pay once, use forever.</p>
        {/if}
      </div>

      <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="relative flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left
            {plan === 'monthly' ? 'border-rose-600 bg-rose-50/30' : 'border-gray-200 hover:border-gray-300'}"
            on:click={() => (plan = 'monthly')}
          >
            <div class="flex items-center justify-between w-full mb-1">
                <span class="text-sm font-bold {plan === 'monthly' ? 'text-rose-700' : 'text-gray-900'}">Monthly</span>
                {#if plan === 'monthly'}
                    <div class="h-4 w-4 rounded-full bg-rose-600 flex items-center justify-center">
                        <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                {/if}
            </div>
            <span class="text-xs text-gray-500">$15 / mo</span>
          </button>

          <button
            type="button"
            class="relative flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left
            {plan === 'ltd' ? 'border-rose-600 bg-rose-50/30' : 'border-gray-200 hover:border-gray-300'}"
            on:click={() => (plan = 'ltd')}
          >
            <div class="absolute -top-2.5 right-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wide rounded-full shadow-sm">
                Best Value
            </div>
            <div class="flex items-center justify-between w-full mb-1">
                <span class="text-sm font-bold {plan === 'ltd' ? 'text-rose-700' : 'text-gray-900'}">Lifetime</span>
                 {#if plan === 'ltd'}
                    <div class="h-4 w-4 rounded-full bg-rose-600 flex items-center justify-center">
                        <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                {/if}
            </div>
            <span class="text-xs text-gray-500">$65 one-time</span>
          </button>
      </div>

      <div class="space-y-3">
        <p class="text-xs font-bold uppercase tracking-wider text-gray-500">What's included:</p>
        <ul class="space-y-2 text-sm text-gray-700">
          <li class="flex items-start gap-2.5">
            <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span><strong>Real-time Analysis</strong> (No caching delays)</span>
          </li>
          <li class="flex items-start gap-2.5">
            <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span><strong>3 Optimized Bio Drafts</strong> (Copy-paste ready)</span>
          </li>
          <li class="flex items-start gap-2.5">
            <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span><strong>Monetization Roadmap</strong> & Sponsor Pricing</span>
          </li>
           <li class="flex items-start gap-2.5">
            <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span><strong>Content Hooks & Email Templates</strong></span>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-gray-100 px-5 sm:px-6 py-4 bg-gray-50/50 rounded-b-xl">
      <button
        class="w-full rounded-xl bg-rose-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 hover:bg-rose-700 hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all"
        type="button"
        on:click={handleContinue}
      >
        {#if plan === 'monthly'}
          Start Monthly Plan ($15)
        {:else}
          Get Lifetime Access ($65)
        {/if}
      </button>
      <p class="mt-3 text-center text-[10px] text-gray-400">
        Secure payment via Stripe. 30-day money-back guarantee.
      </p>
    </div>
  </div>
</div>
