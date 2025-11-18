import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RAPIDAPI_KEY } from '$env/static/private';

import { getAuditChecklist } from '$lib/server/ai';
import { calculateDeterministicScore, type ApiChecks } from '$lib/server/scoring';
import { getCache, setCache } from '$lib/server/cache';
import { getUserProfile } from '$lib/server/users';

const API_HOST = 'twitter241.p.rapidapi.com';

/**
 * Tính toán Tỷ lệ Tương tác Trung bình
 * (Tổng Engagements / Tổng Views) * 100
 */
function calculateAvgEngagementRate(tweets: any[]): number {
    let totalEngagements = 0;
    let totalViews = 0;

    if (!tweets || tweets.length === 0) return 0;

    for (const tweet of tweets) {
        if (tweet && tweet.legacy) {
            totalEngagements += (tweet.legacy.favorite_count || 0);
            totalEngagements += (tweet.legacy.reply_count || 0);
            totalEngagements += (tweet.legacy.retweet_count || 0);
            totalEngagements += (tweet.legacy.bookmark_count || 0);
        }

        if (tweet && tweet.views && tweet.views.count) {
            totalViews += Number(tweet.views.count) ?? 0;
        }
    }

    if (totalViews === 0) return 0;
    return (totalEngagements / totalViews);
}

export const POST: RequestHandler = async ({ request, locals }) => {
    // 1. Check Auth
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = locals.user.uid;
    const { handle } = await request.json();

    if (!handle) {
        return json({ error: 'Handle is required' }, { status: 400 });
    }

    try {
        const dbUser = await getUserProfile(uid);
        const isUserPro = dbUser?.isPro === true;

        // 2. Check Cache Kết quả hiển thị (Chỉ áp dụng cho user Free)
        // User Pro luôn được xem data mới nhất (Real-time)
        if (!isUserPro) {
            const cachedData = await getCache(handle);
            if (cachedData) {
                return json({ ...cachedData, isCached: true });
            }
        }

        console.log(`[RUNNING] Chạy analysis mới cho: ${handle} (Pro: ${isUserPro})`);

        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': API_HOST
            }
        };

        // --- Call 1: Lấy User Info ---
        const userUrl = `https://${API_HOST}/user?username=${handle}`;
        const userResponse = await fetch(userUrl, options);
        const userData = await userResponse.json();

        if (!userResponse.ok || !userData.result?.data?.user?.result) {
            console.error('API Error (User):', userData);
            throw new Error('User not found or invalid API response');
        }

        const userRaw = userData.result.data.user.result;
        const rest_id = userRaw.rest_id;
        const profileData = userRaw.legacy;
        
        // Check tích xanh (Blue Verified hoặc Verified Type)
        const isVerified = !!userRaw.is_blue_verified;

        // --- Call 2: Lấy Tweets ---
        const tweetsUrl = `https://${API_HOST}/user-tweets?user=${rest_id}&count=20`;
        const tweetsResponse = await fetch(tweetsUrl, options);
        const tweetsData = await tweetsResponse.json();

        if (!tweetsResponse.ok) {
            throw new Error('Failed to fetch tweets');
        }

        // --- Parse Timeline ---
        let pinnedTweet = null;
        let regularTweets: any[] = [];

        const instructions = tweetsData.result?.timeline?.instructions || [];
        instructions.forEach((inst: any) => {
            if (inst.type === 'TimelinePinEntry') {
                const result = inst.entry?.content?.itemContent?.tweet_results?.result;
                if (result) pinnedTweet = result;
            } else if (inst.type === 'TimelineAddEntries') {
                regularTweets = inst.entries
                    .filter((e: any) => e.content?.itemContent?.itemType === 'TimelineTweet')
                    .map((e: any) => e.content.itemContent.tweet_results.result);
            }
        });

        // --- Logic Phân Tích ---

        // 1. Tính Engagement Rate
        const rawAvgER = calculateAvgEngagementRate(regularTweets);
        const formattedAvgER = parseFloat((rawAvgER * 100).toFixed(2));

        // 2. Chuẩn bị Payload cho AI (Lấy 10 tweet text để tiết kiệm token)
        const recentTweetTexts = regularTweets
            .map((t: any) => t.legacy?.full_text || "")
            .filter((t: string) => !t.startsWith("RT @")) // Bỏ qua Retweet
            .slice(0, 10);

        const aiPayload = {
            bio: profileData.description || "",
            pinned_text: pinnedTweet?.legacy?.full_text || "",
            recent_tweets: recentTweetTexts,
            follower_count: profileData.followers_count
        };

        // 3. Gọi AI lấy Checklist (True/False)
        const checklist = await getAuditChecklist(aiPayload);

        // 4. Chuẩn bị dữ liệu check cứng từ API
        const apiChecks: ApiChecks = {
            hasLink: (profileData.entities?.url?.urls?.length || 0) > 0,
            hasPinned: !!pinnedTweet,
            isVerified: isVerified
        };

        // 5. Tính điểm Deterministic (Logic cứng)
        const scoring = calculateDeterministicScore(checklist, apiChecks);

        // 6. Đóng gói kết quả cuối cùng
        const finalResult = {
            timestamp: Date.now(),
            profile: profileData,
            isVerified,
            tweets: regularTweets,
            pinnedTweet,
            analysis: {
                targetAudience: checklist.targetAudience,
                avgEngagementRate: formattedAvgER,
                
                // Điểm số tổng (Score)
                totalScore: scoring.totalScore,
                
                // Điểm thành phần (Quy đổi ra thang 100 để hiển thị UI Progress Bar)
                keyScores: {
                    nicheClarity: Math.min(100, Math.round((scoring.breakdown.niche / 25) * 100)),
                    offerClarity: Math.min(100, Math.round((scoring.breakdown.offer / 30) * 100)), // Offer max 30
                    monetization: Math.min(100, Math.round((scoring.breakdown.monetization / 30) * 100)) // Money max 30
                },
                
                // Lỗi & Lời khuyên (Generated by Code, not AI hallucination)
                leaks: scoring.leaks,
                tips: scoring.tips,
                
                // Dữ liệu Pro để null (Sẽ gọi qua API /api/generate riêng khi user bấm)
                pro: null 
            }
        };

        // 7. Caching Strategy
        
        // Cache A: Lưu Context dữ liệu gốc (60 PHÚT)
        // Để dùng cho các tính năng Generate (Pro) sau này mà không cần gọi lại RapidAPI
        await setCache(`user_data:${handle}`, { 
            profile: profileData, 
            niche: checklist.targetAudience,
            apiChecks, // Lưu lại status link/pin để AI generate content chuẩn context
            recentTweetsText: recentTweetTexts // Lưu text tweet để AI học văn phong
        }, 3600); // 3600s = 1 giờ

        // Cache B: Lưu Kết quả Audit hiển thị (10 PHÚT - Default)
        await setCache(handle, finalResult);

        return json(finalResult);

    } catch (error: any) {
        console.error('Lỗi trong /api/analyze:', error.message);
        return json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
};
