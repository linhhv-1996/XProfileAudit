import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCache, setCache } from '$lib/server/cache';
import { generateProFixes, type MonetizationKit } from '$lib/server/proAI';
import { getUserProfile } from '$lib/server/users';
import { logToFile } from '$lib/server/dev';

const PRO_DATA_TTL = 30 * 60;

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

    // NHẬN pinnedTweet TỪ CLIENT
    const { handle: rawHandle, regenerate, auditLeaks, profile, topTweets, pinnedTweet } = await request.json();
    const handle = rawHandle.toLowerCase();

    const dbUser = await getUserProfile(locals.user.uid);
    if (!dbUser?.isPro) return json({ error: 'Forbidden' }, { status: 403 });
    
    if (!regenerate) { 
        const cachedProData = await getCache(`pro_data:${handle}`);
        if (cachedProData) return json({ ...cachedProData, isCached: true });
    }

    const contextData: any = await getCache(`user_data:${handle}`);
    
    try {
        const proPayload = {
            profile: profile || {},
            auditLeaks: auditLeaks || [],
            topTweets: topTweets || [],
            pinnedTweetText: pinnedTweet?.text || "",
            niche: contextData?.niche || "Tech"
        };
        
        const fixesGrowth = await generateProFixes({
             ...proPayload, 
             recentTweetsText: [],
             apiChecks: { hasPinned: !!proPayload.pinnedTweetText } as any 
        });

        logToFile('proPayload.log', proPayload);
        

        const followers = proPayload.profile?.followers || 0;

        const avgEr = contextData?.avgEngagementRate || 1.5;

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
            pitchEmailSnippet: `Hi [Brand], My audience (${proPayload.niche}, ${avgEr}% ER) loves authentic tools...`
        }
        
        const proData = { fixesGrowth, monetizationKit };
        await setCache(`pro_data:${handle}`, proData, PRO_DATA_TTL);

        return json({ ...proData, isCached: false });

    } catch (error: any) {
        console.error('API Error:', error);
        return json({ error: error.message }, { status: 500 });
    }
};
