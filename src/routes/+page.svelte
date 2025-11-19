<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import HeroSection from '$lib/components/HeroSection.svelte';
  import AnalysisSection from '$lib/components/AnalysisSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ProModal from '$lib/components/ProModal.svelte';
  import LoginModal from '$lib/components/LoginModal.svelte';

  import { page } from '$app/stores';
  import { addToast } from '$lib/stores/toast';

  $: user = $page.data.user;

  let handle = '';
  let hasResult = false;
  let showProModal = false;
  let isLoading = false;
  let analysisData: any = null;
  let showLoginGate = false;

  function openProModal() {
    showProModal = true;
  }

  function closeProModal() {
    showProModal = false;
  }

  async function onAnalyze() {
    const trimmed = handle.trim();
    
    // 1. Validate Handle
    if (!trimmed) {
      addToast('Please enter an X handle to analyze.', 'info');
      return;
    }

    // 2. HARD GATE: Chưa login -> Bắt login ngay lập tức
    if (!user) {
      showLoginGate = true;
      return;
    }

    // 3. Đã login -> Bắt đầu chạy
    isLoading = true;
    hasResult = false;
    analysisData = null;

    try {
      // Gọi API (Client CHỈ gửi handle, Server tự quyết định quyền hạn)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: trimmed
        })
      });

      if (response.status === 401) {
        showLoginGate = true;
        isLoading = false;
        return;
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Something went wrong');
      }
      
      const data = await response.json();
      analysisData = data;
      hasResult = true;
      
      // Thông báo nhẹ cho user biết trạng thái data
      if (data.isCached) {
        addToast('Loaded report (Free tier cached)', 'info');
      } else {
        addToast('Real-time analysis complete!', 'success');
      }

    } catch (error: any) {
      console.error(error);
      addToast(error.message, 'error');
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>X Profile Booster — AI Audit & Monetization for Creators</title>
  
  <meta name="description" content="Stop losing followers. Our AI analyzes your X (Twitter) profile to reveal leaks, generate high-converting bios, and build your monetization roadmap." />
  
  <meta name="keywords" content="X profile audit, Twitter bio generator, social media optimization, monetization kit, creator tools, AI audit, X Profile Booster" />
  
  <link rel="canonical" href="https://xprofilebooster.com/" />
  
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://xprofilebooster.com/" />
  <meta property="og:title" content="X Profile Booster — Turn your profile into a business" />
  <meta property="og:description" content="Free AI Audit. Fix your Bio. Unlock Growth. Get your personalized report in seconds." />
  <meta property="og:site_name" content="X Profile Booster" />
  <meta property="og:image" content="https://xprofilebooster.com/og-image.png" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@MaxSlashWang" /> <meta name="twitter:creator" content="@MaxSlashWang" />
  <meta name="twitter:title" content="X Profile Booster — AI Audit & Monetization" />
  <meta name="twitter:description" content="Is your profile repelling money? Get a free AI audit and fix your bio instantly." />
  <meta name="twitter:image" content="https://xprofilebooster.com/og-image.png" />
</svelte:head>

<div class="min-h-screen flex flex-col relative">
  <Header {openProModal} {user} />

  <main class="flex-1">
    <HeroSection bind:handle {onAnalyze} />
    
    <AnalysisSection {hasResult} {openProModal} {analysisData} {isLoading} {handle} />
    
    <FAQSection />
  </main>

  <Footer />

  {#if showProModal}
    <ProModal {closeProModal} />
  {/if}

  {#if showLoginGate}
    <LoginModal 
      close={() => showLoginGate = false} 
      onSuccess={() => onAnalyze()} 
    />
  {/if}
</div>
