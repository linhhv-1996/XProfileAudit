import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RAPIDAPI_KEY } from '$env/static/private';

import { getAuditChecklist } from '$lib/server/ai';
import { calculateDeterministicScore, type ApiChecks } from '$lib/server/scoring';
import { getCache, setCache } from '$lib/server/cache';
import { getUserProfile } from '$lib/server/users';
import { logToFile } from '$lib/server/dev';

const API_HOST = 'twitter241.p.rapidapi.com';

// --- HELPER: CLEAN DATA (Lọc rác) ---
function cleanProfile(raw: any) {
    return {
        name: raw?.core?.name || "",
        handle: raw?.core?.screen_name || "",
        bio: raw.legacy.description || "",
        avatar: raw.avatar.image_url || "",
        banner: raw.legacy.profile_banner_url,
        followers: raw.legacy.followers_count || 0,
        following: raw.legacy.friends_count || 0,
        tweetsCount: raw.legacy.statuses_count || 0,
        isVerified: raw.is_blue_verified || false,
        website: raw.legacy.entities?.url?.urls?.[0]?.expanded_url || "",
        joined: raw.core.created_at,
        location: raw.location?.location || "",
    };
}

function cleanTweet(t: any) {
    if (!t) return null;
    return {
        id: t.rest_id || t.tweet.rest_id || "",
        text: t.legacy?.full_text || t.tweet?.legacy?.full_text || "",
        createdAt: t.legacy?.created_at || t.tweet?.legacy?.created_at,
        views: Number(t.views?.count || t.tweet?.views.count || 0),
        likes: t.legacy?.favorite_count || t.tweet?.legacy?.favorite_count || 0,
        retweets: t.legacy?.retweet_count || t.tweet?.legacy?.retweet_count || 0,
        replies: t.legacy?.reply_count || t.tweet?.legacy?.reply_count || 0,
        bookmarks: t.legacy?.bookmark_count || t.tweet?.legacy?.bookmark_count || 0,
        isReply: !!t.legacy?.in_reply_to_status_id_str,
        hasMedia: !!t.legacy?.entities?.media?.length
    };
}

function calculateAvgEngagementRate(tweets: any[]): number {
    let totalEngagements = 0;
    let totalViews = 0;
    if (!tweets || tweets.length === 0) return 0;

    for (const tweet of tweets) {
        totalEngagements += (tweet.likes + tweet.replies + tweet.retweets + tweet.bookmarks);
        totalViews += tweet.views;
    }

    if (totalViews === 0) return 0;
    return (totalEngagements / totalViews);
}

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

    const uid = locals.user.uid;
    const { handle: rawHandle } = await request.json();
    const handle = rawHandle.toLowerCase();

    if (!handle) return json({ error: 'Handle is required' }, { status: 400 });

    try {
        const dbUser = await getUserProfile(uid);
        const isUserPro = dbUser?.isPro === true;

        // Check Cache
        if (!isUserPro) {
            const cachedData = await getCache(handle);
            if (cachedData) return json({ ...cachedData, isCached: true });
        }

        console.log(`[RUNNING] Analyzing: ${handle}`);

        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': API_HOST
            }
        };

        // 1. Get User
        const userUrl = `https://${API_HOST}/user?username=${handle}`;
        const userResponse = await fetch(userUrl, options);
        const userData = await userResponse.json();

        if (!userData.result?.data?.user?.result) throw new Error('User not found');
        const userRaw = userData.result.data.user.result;
        
        const profile = cleanProfile(userRaw);
        // profile.isVerified = !!userRaw?.is_blue_verified;
        // profile.avatar = userRaw.avatar?.image_url || "";

        console.log(profile);

        // 2. Get Tweets
        const rest_id = userRaw.rest_id;
        const tweetsUrl = `https://${API_HOST}/user-tweets?user=${rest_id}&count=20`;
        const tweetsResponse = await fetch(tweetsUrl, options);
        const tweetsData = await tweetsResponse.json();

        let pinnedTweetRaw = null;
        let regularTweetsRaw: any[] = [];

        const instructions = tweetsData.result?.timeline?.instructions || [];
        instructions.forEach((inst: any) => {
            if (inst.type === 'TimelinePinEntry') {
                pinnedTweetRaw = inst.entry?.content?.itemContent?.tweet_results?.result;
            } else if (inst.type === 'TimelineAddEntries') {
                regularTweetsRaw = inst.entries
                    .filter((e: any) => e.content?.itemContent?.itemType === 'TimelineTweet')
                    .map((e: any) => e.content.itemContent.tweet_results.result);
            }
        });

        const tweets = regularTweetsRaw.map(cleanTweet).filter(t => t !== null);
        const pinnedTweet = cleanTweet(pinnedTweetRaw);

        logToFile('regularTweetsRaw.log', regularTweetsRaw);

        // 3. Logic Phân Tích
        const percentVisuals = tweets.length > 0 
            ? Math.round((tweets.filter(t => t.hasMedia).length / tweets.length) * 100) 
            : 0;
        
        const rawAvgER = calculateAvgEngagementRate(tweets);
        const formattedAvgER = parseFloat((rawAvgER * 100).toFixed(2));

        const recentTweetTexts = tweets
            .filter(t => !t.text.startsWith("RT @"))
            .slice(0, 20)
            .map(t => t.text);

        const aiPayload = {
            bio: profile.bio,
            pinned_text: pinnedTweet?.text || "",
            recent_tweets: recentTweetTexts,
            follower_count: profile.followers,
            profile_image_url: profile.avatar
        };

        // 4. Gọi AI Audit
        let checklist;
        if (profile.followers > 50000) {
             checklist = {
                 summary: { target_audience: "Global Audience" },
                 niche: { is_actually_authority: true },
                 content: { is_value_dense: true },
                 offer: { pinned_has_social_proof: true },
                 monetization: { link_is_lead_magnet: true }
             };
        } else {
             checklist = await getAuditChecklist(aiPayload);
        }

        const apiChecks: ApiChecks = {
            hasLink: !!profile.website,
            hasPinned: !!pinnedTweet,
            isVerified: profile.isVerified,
            percentVisuals,
            canDM: true, 
            followerCount: profile.followers
        };

        const scoring = calculateDeterministicScore(checklist, apiChecks);

        // 5. Đóng gói kết quả
        const finalResult = {
            timestamp: Date.now(),
            profile: profile,      
            tweets: tweets,       
            pinnedTweet: pinnedTweet,
            analysis: {
                targetAudience: checklist.summary?.target_audience || "General",
                avgEngagementRate: formattedAvgER,
                totalScore: scoring.totalScore,
                keyScores: {
                    nicheClarity: scoring.breakdown.niche,
                    contentStrategy: scoring.breakdown.content,
                    offerClarity: scoring.breakdown.offer,
                    monetization: scoring.breakdown.monetization,
                },
                leaks: scoring.leaks,
                tips: scoring.tips
            }
        };

        logToFile("finalResult_Clean.log", finalResult);

        await setCache(`user_data:${handle}`, { 
            profile, 
            niche: checklist.summary?.target_audience,
            apiChecks, 
            recentTweetsText: recentTweetTexts,
            avgEngagementRate: formattedAvgER,
            pinnedTweet // Cache luôn pinnedTweet để backup
        }, 3600);

        await setCache(handle, finalResult);

        return json(finalResult);

    } catch (error: any) {
        console.error('Analyze Error:', error);
        return json({ error: error.message }, { status: 500 });
    }
};
