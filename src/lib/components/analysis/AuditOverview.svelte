<script lang="ts">
  export let analysisData: any;
</script>

<div class="tab-content p-6 sm:p-8">
  <div class="pb-2 mb-0 space-y-5">
    <div class="grid gap-6 md:grid-cols-2 md:items-start">
      <div class="space-y-6">
        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50/70">
          <p class="text-sm font-semibold text-gray-800">Your Target Audience Profile</p>
          <p class="mt-2 text-sm text-gray-900 text-left">
            Based on your content, you are successfully reaching: <br />
            <span class="font-bold text-primary">{analysisData.analysis.targetAudience}</span>.
          </p>
        </div>

        <div class="flex items-center gap-4 text-sm bg-white p-3 rounded-lg border border-gray-200">
          <p class="font-semibold text-gray-600">Avg. Engagement Rate:</p>
          <p class="text-lg font-extrabold text-gray-900">{analysisData.analysis.avgEngagementRate}%</p>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-semibold text-gray-800">Key Scores (0–100)</p>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
              Overall: {analysisData.analysis.totalScore}/100
            </span>
          </div>
          <div class="mt-4 space-y-3 text-xs">
             <div class="flex items-center gap-3">
              <div class="w-32 text-gray-600">Niche Clarity</div>
              <div class="flex-1"><div class="h-2 rounded-full bg-gray-200"><div class="h-2 rounded-full bg-primary" style="width: {analysisData.analysis.keyScores.nicheClarity}%"></div></div></div>
              <div class="w-10 text-right text-gray-900 font-semibold">{analysisData.analysis.keyScores.nicheClarity}</div>
            </div>

            <div class="flex items-center gap-3">
              <div class="w-32 text-gray-600">Content Strategy</div>
              <div class="flex-1"><div class="h-2 rounded-full bg-gray-200"><div class="h-2 rounded-full bg-primary" style="width: {analysisData.analysis.keyScores.contentStrategy}%"></div></div></div>
              <div class="w-10 text-right text-gray-900 font-semibold">{analysisData.analysis.keyScores.contentStrategy}</div>
            </div>

             <div class="flex items-center gap-3">
              <div class="w-32 text-gray-600">Offer Clarity</div>
              <div class="flex-1"><div class="h-2 rounded-full bg-gray-200"><div class="h-2 rounded-full bg-primary" style="width: {analysisData.analysis.keyScores.offerClarity}%"></div></div></div>
              <div class="w-10 text-right text-gray-900 font-semibold">{analysisData.analysis.keyScores.offerClarity}</div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-32 text-gray-600">Monetization Readiness</div>
              <div class="flex-1"><div class="h-2 rounded-full bg-gray-200"><div class="h-2 rounded-full bg-primary" style="width: {analysisData.analysis.keyScores.monetization}%"></div></div></div>
              <div class="w-10 text-right text-gray-900 font-semibold">{analysisData.analysis.keyScores.monetization}</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="mt-0 space-y-4 text-sm text-gray-800 text-left">
          <div class="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3">
            <p class="text-xs font-bold uppercase tracking-wide text-rose-700">Biggest leaks</p>
            <ul class="mt-2 space-y-1.5 list-disc pl-5 text-sm text-rose-800 marker:text-rose-500">
              {#each analysisData.analysis.leaks as leak}
                <li>{leak}</li>
              {/each}
            </ul>
          </div>
          <div class="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3">
            <p class="text-xs font-bold uppercase tracking-wide text-emerald-700">Growth tips (What to do)</p>
            <ul class="mt-2 space-y-1.5 list-disc pl-5 text-sm text-emerald-800 marker:text-emerald-500">
              {#each analysisData.analysis.tips as tip}
                <li>{tip}</li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
