import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RAPIDAPI_KEY } from '$env/static/private';

import { getAIAnalysis } from '$lib/server/ai';
import { getCache, setCache } from '$lib/server/cache';
import { getUserProfile } from '$lib/server/users';

const API_HOST = 'twitter241.p.rapidapi.com';


/**
 * Tính toán Tỷ lệ Tương tác Trung bình
 * (Tổng Engagements / Tổng Views) * 100
 * Engagements = Likes + Replies + Retweets + Bookmarks
 */
function calculateAvgEngagementRate(tweets: any[]): number {
    let totalEngagements = 0;
    let totalViews = 0;

    // Nếu không có tweet nào thì trả về 0
    if (!tweets || tweets.length === 0) {
        return 0;
    }

    for (const tweet of tweets) {
        // Check cho an toàn, lỡ API trả về rác
        if (tweet && tweet.legacy) {
            totalEngagements += (tweet.legacy.favorite_count || 0);
            totalEngagements += (tweet.legacy.reply_count || 0);
            totalEngagements += (tweet.legacy.retweet_count || 0);
            totalEngagements += (tweet.legacy.bookmark_count || 0);
        }

        // Check xem có data 'views' không
        if (tweet && tweet.views && tweet.views.count) {
            totalViews += Number(tweet.views.count) ?? 0;
        }
    }

    // Tránh chia cho 0
    if (totalViews === 0) {
        return 0;
    }

    // Trả về giá trị thô (ví dụ: 0.019)
    return (totalEngagements / totalViews);
}

export const POST: RequestHandler = async ({ request, locals }) => {

    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = locals.user.uid;
    const { handle } = await request.json();

    if (!handle) {
        return json({ error: 'Handle is required' }, { status: 400 });
    }

    // Tùy chọn (options) cho mọi request call RapidAPI
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': API_HOST
        }
    };

    try {
        const dbUser = await getUserProfile(uid);
        const isUserPro = dbUser?.isPro === true;
        const forceRealtime = isUserPro;

        // ----- BƯỚC 1: CHECK CACHE (NẾU KHÔNG PHẢI "PRO") -----
        if (!forceRealtime) {
            const cachedData = await getCache(handle);
            if (cachedData) {
                return json(cachedData);
            }
        }

        // ----- BƯỚC 2: CACHE MISS (hoặc "PRO" force) -> CHẠY LẠI TỪ ĐẦU -----
        console.log(`[RUNNING] Chạy analysis mới cho: ${handle} (Force: ${!!forceRealtime})`);

        // --- Call 1: Lấy User Info (Bio, rest_id, followers...) ---
        const userUrl = `https://${API_HOST}/user?username=${handle}`;
        const userResponse = await fetch(userUrl, options);

        if (!userResponse.ok) {
            throw new Error(`Failed to fetch user (HTTP ${userResponse.status})`);
        }

        const fetchData = await userResponse.json();

        // Check xem handle có tồn tại không. API trả về 200 OK nhưng lỗi bên trong.
        if (!fetchData.result || !fetchData.result.data) {
            console.error('API Error (User):', fetchData);
            throw new Error(fetchData.message || 'User not found or invalid API response');
        }

        const userData = fetchData.result.data;

        // Nếu code chạy đến đây, data user an toàn
        const rest_id = userData.user.result.rest_id;
        const isBlueVerified = userData.user.result.is_blue_verified || false;
        const profileData = userData.user.result.legacy;

        // --- Call 2: Lấy Tweets bằng rest_id ---
        const tweetsUrl = `https://${API_HOST}/user-tweets?user=${rest_id}&count=2`;
        const tweetsResponse = await fetch(tweetsUrl, options);

        if (!tweetsResponse.ok) {
            throw new Error(`Failed to fetch tweets (HTTP ${tweetsResponse.status})`);
        }

        const tweetsData = await tweetsResponse.json();

        // Check xem có data timeline không
        if (!tweetsData.result || !tweetsData.result.timeline) {
            console.error('API Error (Tweets):', tweetsData);
            throw new Error('Invalid tweets API response: No timeline data');
        }

        // --- Xử lý data tweets ---
        let pinnedTweet = null;
        let regularTweets: any[] = [];

        tweetsData.result.timeline.instructions.forEach((inst: any) => {

            if (inst.type === 'TimelinePinEntry') {
                if (inst.entry && inst.entry.content && inst.entry.content.itemContent && inst.entry.content.entryType === 'TimelineTimelineItem') {
                    pinnedTweet = inst.entry.content.itemContent.tweet_results.result;
                }

                // 2. Lấy Tweet thường
            } else if (inst.type === 'TimelineAddEntries') {
                regularTweets = inst.entries
                    .filter((entry: any) =>
                        entry.content &&
                        entry.content.itemContent &&
                        entry.content.itemContent.itemType === 'TimelineTweet'
                    )
                    .map((entry: any) => entry.content.itemContent.tweet_results.result);
            }
        });


        // --- Call 3: Call API AI của ông (Ông tự thay thế đoạn này) ---
        // Ông sẽ gom (profileData, pinnedTweet, regularTweets)
        // và gửi cho API AI của ông


        // (Ông sẽ tự tính cái Avg. Engagement Rate dựa trên list `regularTweets`)
        const rawAvgER = calculateAvgEngagementRate(regularTweets);
        const formattedAvgER = parseFloat((rawAvgER * 100).toFixed(2));

        const llmPayload = {
            bio: profileData.description,
            pinned_tweet_text: pinnedTweet?.legacy?.full_text || null,
            recent_tweets: regularTweets.map((t: any) => t.legacy?.full_text),
            follower_count: profileData.followers_count,
            isBlueVerified: isBlueVerified
        };

        const aiAnalysis = await getAIAnalysis(llmPayload);

        const scores = aiAnalysis.keyScores;
        const overallScore = Math.round(
            (scores.nicheClarity + scores.offerClarity + scores.monetization) / 3
        );

        const finalAnalysis = {
            ...aiAnalysis,
            avgEngagementRate: formattedAvgER,
            overallScore: overallScore
        };

        const finalResult = {
            timestamp: Date.now(),
            profile: profileData,
            pinnedTweet: pinnedTweet,
            tweets: regularTweets,
            analysis: finalAnalysis
        };

        // ----- BƯỚC 3: LƯU VÀO CACHE (10 PHÚT) -----
        await setCache(handle, finalResult);

        // --- Trả về 1 cục JSON duy nhất cho frontend ---
        return json(finalResult);

    } catch (error: any) {
        console.error('Lỗi trong /api/analyze:', error.message);
        return json({ error: error.message }, { status: 500 });
    }
};
