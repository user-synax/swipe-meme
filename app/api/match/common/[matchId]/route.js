import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import Swipe from '@/models/Swipe';
import { verifyToken } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    await connectDB();
    
    let userId;
    try {
      userId = verifyToken(req);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId } = params;

    const match = await Match.findById(matchId);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Verify current user is part of this match
    if (match.userA.toString() !== userId && match.userB.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch common memes (swipes)
    const commonMemes = await Swipe.find({
      userId: match.userA, // Either user works as they both liked these
      memeRedditId: { $in: match.commonLikedIds },
      action: 'like'
    }).select('imageUrl memeRedditId tags');

    return NextResponse.json({ commonMemes }, { status: 200 });
  } catch (error) {
    console.error('Common memes API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
