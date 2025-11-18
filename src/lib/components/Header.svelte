<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { addToast } from '$lib/stores/toast';
  import LoginModal from '$lib/components/LoginModal.svelte';
  export let openProModal: () => void;
  export let user: any;

  let showLogin = false;
  let showUserMenu = false;
  let dropdownRef: HTMLElement;

  function handleClickOutside(event: MouseEvent) {
    if (showUserMenu && dropdownRef && !dropdownRef.contains(event.target as Node)) {
      showUserMenu = false;
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    await invalidateAll();
    showUserMenu = false;
    addToast('Logged out successfully');
  }
</script>

<svelte:window on:click={handleClickOutside} />

<header class="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md transition-all supports-[backdrop-filter]:bg-white/60">
  <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
    
    <a href="/" class="flex items-center gap-2.5 group">
      <div class="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white shadow-md ring-1 ring-gray-900/5 transition-transform group-hover:scale-105 group-active:scale-95 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-tr from-gray-900 to-gray-800"></div>
        
        <svg class="relative w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <span class="text-lg font-bold tracking-tight text-gray-900 group-hover:text-gray-700 transition-colors">
        X Profile Booster
      </span>
    </a>

    <div class="flex items-center gap-3 sm:gap-4">
      {#if user}
        <div class="flex items-center gap-3 sm:gap-4">
          
          {#if user.isPro}
            <span class="hidden sm:inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <span class="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Pro Member
            </span>
          {:else}
            <button
              class="hidden sm:inline-flex items-center rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 hover:-translate-y-0.5 transition-all duration-200"
              type="button"
              on:click={openProModal}
            >
              <span class="mr-1.5">✨</span> Upgrade
            </button>
          {/if}

          <div class="relative" bind:this={dropdownRef}>
            <button 
              class="flex items-center gap-2 focus:outline-none group"
              on:click={() => showUserMenu = !showUserMenu}
              aria-label="User menu" 
            >
              <img 
                src={user.picture || `https://ui-avatars.com/api/?name=${user.name}`} 
                alt={user.name} 
                class="h-9 w-9 rounded-full border-2 border-white shadow-sm ring-2 ring-gray-100 group-hover:ring-gray-300 transition-all"
              />
              <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {#if showUserMenu}
              <div 
                class="absolute right-0 mt-3 w-60 origin-top-right rounded-xl bg-white p-1 shadow-xl ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-200 z-50"
              >
                <div class="px-3 py-2.5 mb-1 border-b border-gray-100">
                  <p class="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                  <p class="truncate text-xs text-gray-500 mt-0.5">{user.email}</p>
                </div>

                {#if !user.isPro}
                  <button 
                    class="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors mb-1"
                    on:click={() => { showUserMenu = false; openProModal(); }}
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Upgrade to Pro
                  </button>
                {/if}

                <button class="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                   <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                   Billing
                </button>

                <div class="my-1 h-px bg-gray-100"></div>

                <button 
                  class="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-rose-600 transition-colors"
                  on:click={handleLogout}
                >
                  <svg class="w-4 h-4 text-gray-400 group-hover:text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Log out
                </button>
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <button
          class="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors"
          on:click={() => showLogin = true}
        >
          Log in
      </button>
      {/if}
    </div>
  </div>
</header>

{#if showLogin}
  <LoginModal close={() => showLogin = false} />
{/if}
