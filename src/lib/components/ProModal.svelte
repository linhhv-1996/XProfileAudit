<script lang="ts">
  export let closeProModal: () => void;

  let plan: 'monthly' | 'ltd' = 'monthly';

  function handleContinue() {
    console.log('Selected plan:', plan);
  }
</script>

<div class="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/40 px-4">
  <div class="max-w-[520px] rounded-lg border border-gray-200 bg-white shadow-soft">
    <!-- Header -->
    <div
      class="flex items-start justify-between gap-3 border-b border-gray-200 px-5 sm:px-6 py-4 sm:py-5"
    >
      <div class="space-y-1">
        <p class="text-base sm:text-lg font-semibold text-gray-900">
          Upgrade to X Profile Studio Pro
        </p>
        <p class="text-xs sm:text-sm text-gray-500">
          Keep the audit free. Unlock the deeper copy &amp; monetization kit with Pro.
        </p>
      </div>
      <button
        class="text-gray-500 hover:text-gray-800 text-xs sm:text-sm rounded-full border border-gray-300 px-3 py-2 leading-none hover:bg-gray-50 transition-colors"
        type="button"
        on:click={closeProModal}
      >
        ✕
      </button>
    </div>

    <!-- Body -->
    <div class="px-5 sm:px-6 py-4 sm:py-5 space-y-5">
      <!-- Big price block (dynamic) -->
      <div>
        <p class="text-xs sm:text-sm font-medium text-gray-500">Pro access</p>

        {#if plan === 'monthly'}
          <p class="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">
            $15<span class="text-sm sm:text-base font-normal text-gray-500"> / month</span>
          </p>
          <p class="mt-1 text-xs text-gray-500">
            Ideal if you want to try X Profile Studio for a few months and keep it flexible.
          </p>
        {:else}
          <p class="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">
            $65<span class="text-sm sm:text-base font-normal text-gray-500"> one-time</span>
          </p>
          <p class="mt-1 text-xs text-gray-500">
            Lifetime access to all Pro features and future updates. No recurring fee.
          </p>
        {/if}
      </div>

      <!-- Plan toggle -->
      <div class="space-y-2">
        <p class="text-xs sm:text-sm font-medium text-gray-500">
          Choose how you want to pay
        </p>
        <div
          class="grid grid-cols-2 gap-2 text-xs sm:text-sm bg-gray-50 rounded-lg p-1 border border-gray-200"
        >
          <!-- Monthly -->
          <button
            type="button"
            class="flex flex-col items-start justify-center rounded-md px-2 py-2 text-left transition-colors"
            class:bg-white={plan === 'monthly'}
            class:border={plan === 'monthly'}
            class:border-gray-300={plan === 'monthly'}
            on:click={() => (plan = 'monthly')}
          >
            <span
              class="inline-flex items-center gap-1 text-[11px] font-semibold"
              class:text-primary={plan === 'monthly'}
              class:text-gray-700={plan !== 'monthly'}
            >
              Monthly
              <span
                class="hidden sm:inline text-[10px] rounded-full px-1.5 py-0.5 border border-emerald-200 text-emerald-600 bg-emerald-50"
                >Flexible</span
              >
            </span>
            <span class="mt-0.5 text-xs text-gray-500">
              $15 / month
            </span>
          </button>

          <!-- Lifetime -->
          <button
            type="button"
            class="flex flex-col items-start justify-center rounded-md px-2 py-2 text-left transition-colors"
            class:bg-white={plan === 'ltd'}
            class:border={plan === 'ltd'}
            class:border-gray-300={plan === 'ltd'}
            on:click={() => (plan = 'ltd')}
          >
            <span
              class="inline-flex items-center gap-1 text-[11px] font-semibold"
              class:text-primary={plan === 'ltd'}
              class:text-gray-700={plan !== 'ltd'}
            >
              Lifetime deal
              <span
                class="text-[10px] rounded-full px-1.5 py-0.5 border border-amber-200 text-amber-700 bg-amber-50"
                >Best value</span
              >
            </span>
            <span class="mt-0.5 text-xs text-gray-500">
              $65 one-time
            </span>
          </button>
        </div>
      </div>

      <!-- Features list -->
      <div class="space-y-1.5 text-sm text-gray-800">
        <p class="font-semibold text-gray-900 mb-1">Pro unlocks:</p>
        <ul class="space-y-1.5 pl-4 list-disc marker:text-primary">
          <li><strong>Multiple bio &amp; pinned tweet options</strong> based on your niche</li>
          <li>
            <strong>Content breakdown:</strong> best hooks, formats &amp; posting times
          </li>
          <li>
            <strong>Monetization score, packages &amp; suggested pricing</strong> ranges
          </li>
          <li>Pitch email &amp; DM templates <strong>ready to send to brands</strong></li>
        </ul>
      </div>
    </div>

    <!-- Footer actions -->
    <div class="flex flex-col gap-2 border-t border-gray-200 px-5 sm:px-6 py-3 sm:py-4">
      <button
        class="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-gray-900 transition-colors"
        type="button"
        on:click={handleContinue}
      >
        {#if plan === 'monthly'}
          Continue with Monthly
        {:else}
          Continue with Lifetime Deal ($65)
        {/if}
      </button>
      <div class="flex items-center justify-between">
        <button
          class="text-[10px] sm:text-xs text-gray-500 hover:text-gray-800"
          type="button"
          on:click={closeProModal}
        >
          Maybe later
        </button>
        <p class="text-[9px] sm:text-[10px] text-gray-400">
          You&apos;ll choose payment method on the next step.
        </p>
      </div>
    </div>
  </div>
</div>
