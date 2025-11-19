// src/routes/api/generate-pro-content/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { getCache, setCache } from '$lib/server/cache';
import { generateProFixes, type MonetizationKit } from '$lib/server/proAI';
import { getUserProfile } from '$lib/server/users';

const PRO_DATA_TTL = 30 * 60;

export const POST: RequestHandler = async ({ request, locals }) => {
    // 1. Check Auth & Pro Status
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = locals.user.uid;
    const { handle } = await request.json();

    const dbUser = await getUserProfile(uid);
    const isUserPro = dbUser?.isPro === true;

    if (!isUserPro) {
        return json({ error: 'Forbidden: Pro access required' }, { status: 403 });
    }
    
    // 2. Check Cache
    const cachedProData = await getCache(`pro_data:${handle}`);
    if (cachedProData) {
        console.log(`[PRO GENERATION] Loaded cached Pro data for: ${handle}`);
        return json({ ...cachedProData, isCached: true });
    }

    // 3. Load Context Data (Đã được cache bởi /api/analyze)
    const contextData: any = await getCache(`user_data:${handle}`);
    if (!contextData) {
        return json({ error: 'Context data missing. Run audit first.' }, { status: 400 });
    }

    try {
        console.log(`[PRO GENERATION] Running NEW AI generation for: ${handle}`);
        
        // --- PRO GENERATION LOGIC ---
        const proPayload = {
            bio: contextData.profile.description || "", 
            pinnedTweetText: contextData.pinnedTweetText,
            recentTweetsText: contextData.recentTweetsText,
            niche: contextData.niche, 
            apiChecks: contextData.apiChecks
        };
        
        // Goị AI để tạo Copy & Growth Fixes (Tab 2)
        const fixesGrowth = await generateProFixes(proPayload);
        
        // Logic Monetization Kit (Tab 3) - Cần tái tạo để giữ logic on-demand
        const followers = contextData.profile.followers_count;
        const avgEr = contextData.avgEngagementRate; // Lấy từ cache context

        let projectedValue = 300; 
        if (followers > 5000) projectedValue = 500;
        if (followers > 10000) projectedValue = 800;
        if (avgEr && avgEr > 2.5) projectedValue *= 1.2;

        const roundToFifty = (value: number) => Math.round(value / 50) * 50;

        const monetizationKit: MonetizationKit = {
            projectedSponsorValue: `$${roundToFifty(projectedValue)} USD`,
            packages: [
                { name: 'Standard Tweet', price: `$${roundToFifty(projectedValue * 0.6)}`, description: '1 dedicated post' },
                { name: 'Pinned Thread', price: `$${roundToFifty(projectedValue * 1.5)}`, description: '1 thread (3-5 tweets) pinned for 3 days' },
                { name: 'Full Campaign', price: `$${roundToFifty(projectedValue * 3)}`, description: '3 posts and 1 Bio mention over 1 week' },
            ],
            pitchEmailSnippet: `Hi [Brand Contact], I saw your recent launch and noticed a huge synergy with my audience (${contextData.niche}, ${avgEr}% ER). I have a 3-tier package perfect for driving MQLs...`
        }
        
        const proData = { fixesGrowth, monetizationKit };

        // 4. Caching Pro Data
        await setCache(`pro_data:${handle}`, proData, PRO_DATA_TTL);

        return json({ ...proData, isCached: false });

    } catch (error: any) {
        console.error('Lỗi trong /api/generate-pro-content:', error.message);
        return json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
};
