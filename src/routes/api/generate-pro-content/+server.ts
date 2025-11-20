// src/routes/api/generate-pro-content/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { getCache, setCache } from '$lib/server/cache';
import { generateProFixes, type MonetizationKit } from '$lib/server/proAI';
import { getUserProfile } from '$lib/server/users';

const PRO_DATA_TTL = 30 * 60;

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = locals.user.uid;
    // NHẬN PROFILE & AUDIT LEAKS TỪ CLIENT GỬI LÊN
    const { handle: rawHandle, regenerate, auditLeaks, profile } = await request.json();
    const handle = rawHandle.toLowerCase();

    const dbUser = await getUserProfile(uid);
    const isUserPro = dbUser?.isPro === true;

    if (!isUserPro) {
        return json({ error: 'Forbidden: Pro access required' }, { status: 403 });
    }
    
    // 2. Check Cache (Nếu không regenerate)
    if (!regenerate) { 
        const cachedProData = await getCache(`pro_data:${handle}`);
        if (cachedProData) {
            console.log(`[PRO GENERATION] Loaded cached Pro data for: ${handle}`);
            return json({ ...cachedProData, isCached: true });
        }
    }

    // 3. Load Context Data (Tweets vẫn lấy từ cache server để đỡ nặng payload)
    const contextData: any = await getCache(`user_data:${handle}`);
    
    // Nếu mất cache Tweets thì buộc phải báo lỗi (vì Client không gửi tweets lên)
    if (!contextData) {
        return json({ error: 'Context data missing. Run audit first.' }, { status: 400 });
    }

    try {
        console.log(`[PRO GENERATION] Running NEW AI generation for: ${handle}`);

        // --- PRO GENERATION LOGIC ---
        const proPayload = {
            bio: profile?.description || contextData.profile.description || "", 
            pinnedTweetText: contextData.pinnedTweetText,
            recentTweetsText: contextData.recentTweetsText,
            niche: contextData.niche, 
            apiChecks: contextData.apiChecks,
            auditLeaks: auditLeaks || [],
            profile: profile || contextData.profile
        };
        
        // Goị AI để tạo Copy & Growth Fixes
        const fixesGrowth = await generateProFixes(proPayload);
        
        // Logic Monetization Kit
        const followers = proPayload.profile?.followers_count || 0;
        const avgEr = contextData.avgEngagementRate || 1.5;

        let projectedValue = 300; 
        if (followers > 5000) projectedValue = 500;
        if (followers > 10000) projectedValue = 800;
        if (avgEr > 2.5) projectedValue *= 1.2;

        const roundToFifty = (value: number) => Math.round(value / 50) * 50;

        const monetizationKit: MonetizationKit = {
            projectedSponsorValue: `$${roundToFifty(projectedValue)} USD`,
            packages: [
                { name: 'Standard Tweet', price: `$${roundToFifty(projectedValue * 0.6)}`, description: '1 dedicated post' },
                { name: 'Pinned Thread', price: `$${roundToFifty(projectedValue * 1.5)}`, description: '1 thread (3-5 tweets) pinned for 3 days' },
                { name: 'Full Campaign', price: `$${roundToFifty(projectedValue * 3)}`, description: '3 posts and 1 Bio mention over 1 week' },
            ],
            pitchEmailSnippet: `Hi [Brand Contact], I saw your recent launch. My audience (${contextData.niche}, ${avgEr}% ER) responds well to authentic storytelling. I have a 3-tier package perfect for driving MQLs...`
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
