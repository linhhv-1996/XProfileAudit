<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { addToast } from '$lib/stores/toast';
  import LoginModal from '$lib/components/LoginModal.svelte';

  export let openProModal: () => void;
  export let user: any;

  let showLogin = false;
  let showUserMenu = false;
  let dropdownRef: HTMLElement; // Biến để tham chiếu đến cái hộp menu

  // Hàm xử lý click ra ngoài (Click Outside)
  function handleClickOutside(event: MouseEvent) {
    // Nếu menu đang mở VÀ click không nằm trong dropdownRef -> Đóng menu
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

<header class="border-b border-gray-100 bg-white/95 backdrop-blur z-10 sticky top-0">
  <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-0">
    <a href="/" class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-white shadow-lg">
        X
      </div>
      <span class="text-xl font-bold tracking-tight text-gray-900">X Profile Studio</span>
    </a>

    <div class="flex items-center gap-3 text-sm">
      {#if user}
        <div class="flex items-center gap-3">
          
          {#if user.isPro}
            <button class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              Pro Member
            </button>
          {:else}
            <button
              class="hidden sm:inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition-all transform hover:-translate-y-0.5"
              type="button"
              on:click={openProModal}
            >
              <span class="mr-1">✨</span> Upgrade Pro
            </button>
          {/if}

          <div class="relative" bind:this={dropdownRef}>
            <button 
              class="flex items-center focus:outline-none transition-transform active:scale-95"
              on:click={() => showUserMenu = !showUserMenu}
              aria-label="User menu" 
            >
              <img 
                src={user.picture || `https://ui-avatars.com/api/?name=${user.name}`} 
                alt={user.name} 
                class="h-9 w-9 rounded-full border border-gray-200 shadow-sm hover:ring-2 hover:ring-gray-200 transition-all"
              />
            </button>

            {#if showUserMenu}
              <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-fade-in origin-top-right">
                
                <div class="px-4 py-3 border-b border-gray-50">
                  <p class="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                  <p class="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <div class="py-1">
                  {#if user.isPro}
                    <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <span>💳</span> Manage Subscription
                    </button>
                  {:else}
                    <button 
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      on:click={() => {
                        showUserMenu = false;
                        openProModal();
                      }}
                    >
                      <span>🚀</span> Upgrade to Pro
                    </button>
                  {/if}
                </div>

                <div class="border-t border-gray-50 py-1">
                  <button 
                    class="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2"
                    on:click={handleLogout}
                  >
                    <span>🚪</span> Log out
                  </button>
                </div>

              </div>
            {/if}
          </div>
        </div>
      {:else}
        <button
          class="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
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
