<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import HeroSection from '$lib/components/HeroSection.svelte';
  import AnalysisSection from '$lib/components/AnalysisSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ProModal from '$lib/components/ProModal.svelte';

  let handle = '';
  let hasResult = false;
  let showProModal = false;

  function openProModal() {
    showProModal = true;
  }

  function closeProModal() {
    showProModal = false;
  }

  function onAnalyze() {
    const trimmed = handle.trim();
    if (!trimmed) {
      alert('Please enter an X handle to analyze.');
      return;
    }
    hasResult = true;
  }
</script>

<svelte:head>
  <title>X Profile Studio – X profile audit &amp; monetization kit</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header {openProModal} />

  <main class="flex-1">
    <HeroSection bind:handle onAnalyze={onAnalyze} />

    <!-- chỉ truyền hasResult + openProModal, không chơi activeTab nữa -->
    <AnalysisSection {hasResult} {openProModal} />

    <FAQSection />
  </main>

  <Footer />

  {#if showProModal}
    <ProModal {closeProModal} />
  {/if}
</div>
