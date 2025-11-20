<script lang="ts">
  export let profile: any;
  export let totalScore: number;

  // Helper format số
  function formatNumber(num: number) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  // Màu sắc
  $: scoreColor = totalScore >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' 
                : totalScore >= 50 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' 
                : 'text-rose-600 bg-rose-50 border-rose-200';

  const DEFAULT_AVATAR = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
  $: avatarUrl = (profile?.profile_image_url_https || profile?.profile_image_url || "").replace('_normal', '_400x400');
</script>

<div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-300 transition-colors">

  <div class="flex items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
    
    <div class="relative shrink-0">
      <img 
        src={avatarUrl || DEFAULT_AVATAR} 
        alt={profile?.name} 
        class="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-gray-200 shadow-sm object-cover"
      />
      {#if profile?.verified}
        <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow-sm z-10">
           <svg class="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g></svg>
        </div>
      {/if}
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex flex-wrap items-baseline gap-x-2 mb-1">
        <h2 class="text-base sm:text-lg font-bold text-gray-900 truncate">{profile?.name || "Unknown"}</h2>
        <a href={`https://twitter.com/${profile?.screen_name}`} target="_blank" rel="noreferrer" class="text-sm text-gray-500 hover:text-gray-700 truncate">@{profile?.screen_name}</a>
      </div>
      
      <div class="flex items-center gap-3 text-xs sm:text-sm text-gray-500">
        <div class="flex items-center gap-1" title="Followers">
            <span class="font-bold text-gray-800">{formatNumber(profile?.followers_count || 0)}</span>
            <span class="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Followers</span>
        </div>
        <div class="w-px h-3 bg-gray-300"></div>
        <div class="flex items-center gap-1" title="Following">
            <span class="font-bold text-gray-800">{formatNumber(profile?.friends_count || 0)}</span>
            <span class="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Following</span>
        </div>
        <div class="w-px h-3 bg-gray-300"></div>
        <div class="flex items-center gap-1" title="Tweets">
            <span class="font-bold text-gray-800">{formatNumber(profile?.statuses_count || 0)}</span>
            <span class="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Tweets</span>
        </div>
      </div>
    </div>
  </div>

  <div class="flex items-center justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:pl-6 sm:border-l">
    <div class="text-left sm:text-right">
       <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Audit Score</p>
       <p class="text-[11px] text-gray-500 font-medium hidden sm:block">AI Analysis</p>
    </div>
    
    <div class="flex items-center justify-center px-3 py-1.5 rounded-lg border {scoreColor} shadow-sm min-w-[80px]">
       <span class="text-xl font-black">{totalScore}</span>
       <span class="text-xs font-semibold opacity-70 ml-0.5">/100</span>
    </div>
  </div>

</div>
