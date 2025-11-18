<script lang="ts">
  let email = '';

  function handleGoogleLogin() {
    // TODO: nhét Google OAuth flow vào đây (Supabase, Clerk, custom backend, v.v.)
    console.log('Login with Google');
  }

  function handleMagicLink(event: SubmitEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    // TODO: call API gửi magic link
    console.log('Send magic link to:', email);
  }
</script>

<svelte:head>
  <title>Log in – X Profile Booster</title>
  <meta
    name="description"
    content="Log in to X Profile Booster with Google or magic link to access your saved audits and monetization kit."
  />
</svelte:head>

<section class="min-h-screen flex flex-col bg-gray-50">
  <div class="flex-1 flex flex-col">
    <!-- Main content -->
    <main class="flex-1 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-0">
      <div class="w-full max-w-md">
        <div class="mb-6 text-center">
          <p
            class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] text-gray-500 border border-gray-200 shadow-sm"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Passwordless, secure login
          </p>

          <h1 class="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Log in to X Profile Booster
          </h1>
          <p class="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            Use your Google account or a one-time magic link to access your profile audits and
            Pro growth kits.
          </p>
        </div>

        <div
          class="rounded-xl bg-white border border-gray-200 shadow-soft px-4 py-5 sm:px-6 sm:py-6 space-y-5"
        >
          <!-- Google login -->
          <button
            type="button"
            class="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            on:click={handleGoogleLogin}
          >
            <!-- Fake Google icon -->
            <span
              class="flex h-4 w-4 items-center justify-center rounded-[4px] border border-gray-300 text-[9px] font-bold"
            >
              G
            </span>
            <span>Continue with Google</span>
          </button>

          <div class="relative my-2">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t border-gray-200"></span>
            </div>
            <div class="relative flex justify-center text-[11px]">
              <span class="bg-white px-2 text-gray-400">or use a magic link</span>
            </div>
          </div>

          <!-- Magic link form -->
          <form class="space-y-3" on:submit={handleMagicLink}>
            <div class="space-y-1.5">
              <label for="email" class="block text-xs font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autocomplete="email"
                bind:value={email}
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-primary focus:ring-primary focus:ring-1 outline-none"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              class="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-gray-900 transition-colors"
            >
              Send magic link
            </button>

            <p class="pt-1 text-[11px] text-gray-500">
              We&apos;ll send a one-time link to your inbox. No password needed.
            </p>
          </form>
        </div>

        <p class="mt-4 text-[11px] text-gray-400 text-center">
          By continuing, you agree to our
          <a href="/policy" class="underline underline-offset-2 hover:text-gray-700">
            Usage Policy
          </a>
          and
          <a href="/privacy" class="underline underline-offset-2 hover:text-gray-700">
            Privacy Policy
          </a>.
        </p>
      </div>
    </main>
  </div>
</section>
