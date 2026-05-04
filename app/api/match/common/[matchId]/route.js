import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import Swipe from '@/models/Swipe';
import User from '@/models/User';
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

    const { matchId } = await params;

    const match = await Match.findById(matchId);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Verify current user is part of this match
    if (match.userA.toString() !== userId && match.userB.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch user details
    const [userA, userB, currentUser] = await Promise.all([
      User.findById(match.userA).select('username avatar'),
      User.findById(match.userB).select('username avatar'),
      User.findById(userId).select('username avatar'),
    ]);

    // Fetch common memes (swipes)
    const commonMemes = await Swipe.find({
      userId: match.userA,
      memeRedditId: { $in: match.commonLikedIds },
      action: 'like'
    }).select('imageUrl memeRedditId tags');

    return NextResponse.json({
      match: {
        ...match.toObject(),
        userA,
        userB,
        currentUser: { id: userId, ...currentUser?.toObject() },
      },
      commonMemes,
    }, { status: 200 });
  } catch (error) {
    console.error('Common memes API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
