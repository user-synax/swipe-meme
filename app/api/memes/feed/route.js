import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Swipe from '@/models/Swipe';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { getCachedMemes } from '@/lib/memeCache';

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const filterTag = searchParams.get('tag');

    let userId;
    try {
      userId = verifyToken(req);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    // 1. Get already swiped memes
    const swipedMemes = await Swipe.find({ userId }).select('memeRedditId');
    const swipedIds = new Set(swipedMemes.map(s => s.memeRedditId));

    // 2. Get user liked tags for personalization
    const likedSwipes = await Swipe.find({ userId, action: 'like' }).select('tags');
    const tagFrequencies = {};
    likedSwipes.forEach(swipe => {
      swipe.tags.forEach(tag => {
        tagFrequencies[tag] = (tagFrequencies[tag] || 0) + 1;
      });
    });

    // 3. Get all memes from cache
    let allMemes = await getCachedMemes();

    // 4. Filter by tag if provided
    if (filterTag) {
      allMemes = allMemes.filter(m => m.tags.includes(filterTag));
    }

    // 5. Filter out swiped memes
    const availableMemes = allMemes.filter(m => !swipedIds.has(m.redditId));

    // 6. Split into trending and category
    const trendingPool = availableMemes.filter(m => m.pool === 'trending');
    const categoryPool = availableMemes.filter(m => m.pool === 'category');

    // 7. Select 5 trending + 10 category
    // For category pool, prefer memes with preferred tags
    const sortedCategoryPool = [...categoryPool].sort((a, b) => {
      const aScore = a.tags.reduce((acc, tag) => acc + (tagFrequencies[tag] || 0), 0);
      const bScore = b.tags.reduce((acc, tag) => acc + (tagFrequencies[tag] || 0), 0);
      return bScore - aScore;
    });

    const selectedTrending = trendingPool.sort(() => 0.5 - Math.random()).slice(0, 5);
    const selectedCategory = sortedCategoryPool.slice(0, 10);

    // 8. Combine and shuffle
    const feed = [...selectedTrending, ...selectedCategory].sort(() => 0.5 - Math.random());

    return NextResponse.json({ memes: feed }, { status: 200 });
  } catch (error) {
    console.error('Feed API error:', error);
    return NextResponse.json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
