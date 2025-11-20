// File: src/routes/api/analyze/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RAPIDAPI_KEY } from '$env/static/private';

import { getAuditChecklist } from '$lib/server/ai';
import { calculateDeterministicScore, type ApiChecks } from '$lib/server/scoring';
import { getCache, setCache } from '$lib/server/cache';
import { getUserProfile } from '$lib/server/users';

import { logToFile } from '$lib/server/dev';

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
    // 1. Check Auth & Params
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = locals.user.uid;
    const { handle: rawHandle } = await request.json();
    const handle = rawHandle.toLowerCase();

    if (!handle) {
        return json({ error: 'Handle is required' }, { status: 400 });
    }

    try {
        const dbUser = await getUserProfile(uid);
        const isUserPro = dbUser?.isPro === true;

        // 2. Check Cache Kết quả hiển thị (Chỉ áp dụng cho user Free)
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
        
        const isVerified = !!userRaw.is_blue_verified;
        const profileImageUrl = userRaw.avatar?.image_url || "";
        const canDM = !!userRaw.dm_permissions?.can_dm
        profileData.profile_image_url_https = userRaw.avatar?.image_url || "";
        profileData.screen_name = handle;
        profileData.verified = isVerified;
        profileData.name = userRaw?.core?.name || "Unknow";

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

        // [NEW] 1. Tính toán tỷ lệ Visuals
        let tweetsWithMedia = 0;
        regularTweets.forEach((t: any) => {
            // Check media entities trong tweet
            const media = t?.legacy?.entities?.media;
            if (media && media.length > 0) {
                tweetsWithMedia++;
            }
        });
        const percentVisuals = regularTweets.length > 0 
            ? Math.round((tweetsWithMedia / regularTweets.length) * 100) 
            : 0;
        
        // 2. Tính Engagement Rate
        const rawAvgER = calculateAvgEngagementRate(regularTweets);
        const formattedAvgER = parseFloat((rawAvgER * 100).toFixed(2));

        // 3. Chuẩn bị Payload cho AI
        const recentTweetTexts = regularTweets
            .map((t: any) => t.legacy?.full_text || t?.tweet?.legacy?.full_text || "")
            .filter((t: string) => !t.startsWith("RT @"))
            .slice(0, 20);

        const aiPayload = {
            bio: profileData.description || "",
            pinned_text: pinnedTweet?.legacy?.full_text || pinnedTweet?.tweet?.legacy?.full_text || "",
            recent_tweets: recentTweetTexts,
            follower_count: profileData.followers_count,
            profile_image_url: profileImageUrl
        };

        // 4. Gọi AI lấy Checklist (True/False)
        const checklist = await getAuditChecklist(aiPayload);

        const followerCount = profileData.followers_count;

        // 5. Chuẩn bị dữ liệu check cứng từ API
        const apiChecks: ApiChecks = {
            hasLink: (profileData.entities?.url?.urls?.length || 0) > 0,
            hasPinned: !!pinnedTweet,
            isVerified: isVerified,
            percentVisuals: percentVisuals,
            canDM: canDM,
            followerCount: followerCount
        };

        // ============================================================
        // [NEW] WHALE BYPASS: Nếu > 50k Follower -> BỎ QUA AI LUÔN
        // ============================================================
        if (followerCount > 50000) {
            console.log(`[WHALE DETECTED] ${handle} has ${followerCount} followers. Skipping AI.`);

            const whaleResult = {
                timestamp: Date.now(),
                profile: profileData,
                isVerified,
                tweets: regularTweets,
                pinnedTweet,
                analysis: {
                    targetAudience: "The Entire Internet 🌍",
                    avgEngagementRate: formattedAvgER,
                    totalScore: 100,
                    keyScores: {
                        nicheClarity: 100,
                        contentStrategy: 100,
                        offerClarity: 100,
                        monetization: 100
                    },
                    leaks: [
                        "Suffering from Success.", 
                        "You broke the algorithm.", 
                        "Your account is too big for this tool.",
                        "Organic reach is unfair to others.",
                        "No leaks found. You are the leak."
                    ],
                    tips: [
                        "Keep doing whatever you are doing.",
                        "Launch a $5000 course.",
                        "Buy an island.",
                        "Tweet literally anything.",
                        "Invest in X Profile Booster 😉"
                    ],
                    pro: null
                }
            };

            // Cache kết quả này
             await setCache(`user_data:${handle}`, { 
                profile: profileData, 
                niche: { target_audience: "Everyone" },
                apiChecks, 
                recentTweetsText: recentTweetTexts,
                avgEngagementRate: formattedAvgER
            }, 3600);

            await setCache(handle, whaleResult);
            
            return json(whaleResult);
        }
        // ============================================================

        // 6. Tính điểm Deterministic (Logic cứng)
        const scoring = calculateDeterministicScore(checklist, apiChecks);

        logToFile("aiPayload.log", aiPayload);
        logToFile("apiChecks.log", apiChecks);

        // 7. Đóng gói kết quả cuối cùng
        const finalResult = {
            timestamp: Date.now(),
            profile: profileData,
            isVerified,
            tweets: regularTweets,
            pinnedTweet,
            analysis: {
                targetAudience: checklist.summary.target_audience,
                avgEngagementRate: formattedAvgER,
                totalScore: scoring.totalScore,
                keyScores: {
                    nicheClarity: scoring.breakdown.niche,
                    contentStrategy: scoring.breakdown.content,
                    offerClarity: scoring.breakdown.offer,
                    monetization: scoring.breakdown.monetization,
                },
                
                leaks: scoring.leaks,
                tips: scoring.tips,
                
                pro: null 
            }
        };

        logToFile("finalResult.log", finalResult);

        // 8. Caching Strategy
        
        // Cache A: Lưu Context dữ liệu gốc (60 PHÚT)
        await setCache(`user_data:${handle}`, { 
            profile: profileData, 
            niche: checklist.summary.target_audience,
            apiChecks, 
            recentTweetsText: recentTweetTexts,
            avgEngagementRate: formattedAvgER // Cache ER cho Pro tab
        }, 3600); 

        // Cache B: Lưu Kết quả Audit hiển thị (10 PHÚT - Default)
        await setCache(handle, finalResult);

        return json(finalResult);

    } catch (error: any) {
        console.error('Lỗi trong /api/analyze:', error.message);
        return json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
};
