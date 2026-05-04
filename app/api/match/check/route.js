import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Swipe from '@/models/Swipe';
import Match from '@/models/Match';
import { verifyToken } from '@/lib/auth';
import { getHumorType } from '@/lib/humorType';

export async function POST(req) {
  try {
    await connectDB();
    
    let userId;
    try {
      userId = verifyToken(req);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user and their liked meme tags to update humor type
    const userWithLikes = await User.findById(userId);
    if (!userWithLikes) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all tags from user's liked memes (swipes)
    const userLikes = await Swipe.find({ userId, action: 'like' }).select('tags');
    const allTags = userLikes.flatMap(s => s.tags);
    
    // Update humorType
    const humorType = getHumorType(allTags);
    await User.findByIdAndUpdate(userId, { humorType });

    const myLikes = new Set(userWithLikes.likedRedditIds);

    // Need at least 5 likes to start matching
    if (myLikes.size < 5) {
      return NextResponse.json({ checked: true, skipped: true, reason: 'Need at least 5 likes' });
    }

    // Find candidates who have at least one common like
    const candidates = await User.find({
      _id: { $ne: userId },
      likedRedditIds: { $in: [...myLikes] }
    }).select('likedRedditIds');

    const JACCARD_THRESHOLD = 0.25;

    for (const candidate of candidates) {
      // Check if match already exists
      const existingMatch = await Match.findOne({
        $or: [
          { userA: userId, userB: candidate._id },
          { userA: candidate._id, userB: userId }
        ]
      });

      if (existingMatch) continue;

      const theirLikes = new Set(candidate.likedRedditIds);
      const intersection = [...myLikes].filter(id => theirLikes.has(id));
      const union = new Set([...myLikes, ...theirLikes]);
      const jaccardScore = intersection.length / union.size;

      if (jaccardScore >= JACCARD_THRESHOLD) {
        // Fetch common meme URLs for display
        const commonSwipes = await Swipe.find({
          userId,
          memeRedditId: { $in: intersection },
          action: 'like'
        }).select('imageUrl memeRedditId');

        await Match.create({
          userA: userId,
          userB: candidate._id,
          commonLikedIds: intersection,
          commonMemeUrls: commonSwipes.map(s => s.imageUrl),
          jaccardScore,
          status: 'matched'
        });
      }
    }

    return NextResponse.json({ checked: true }, { status: 200 });
  } catch (error) {
    console.error('Match check error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
