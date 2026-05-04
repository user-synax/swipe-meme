import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User'; // Required for population

export async function GET(req) {
  try {
    await connectDB();
    
    let userId;
    try {
      userId = verifyToken(req);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const matches = await Match.find({
      $or: [{ userA: userId }, { userB: userId }]
    })
    .populate('userA', 'username avatar humorType')
    .populate('userB', 'username avatar humorType')
    .sort({ createdAt: -1 });

    const formattedMatches = matches.map(match => {
      // Determine which user is the "other" user
      const otherUser = match.userA._id.toString() === userId ? match.userB : match.userA;
      
      return {
        _id: match._id,
        user: otherUser,
        jaccardScore: match.jaccardScore,
        commonMemeUrls: match.commonMemeUrls.slice(0, 3),
        chatUnlocked: match.chatUnlocked,
        createdAt: match.createdAt
      };
    });

    return NextResponse.json({ matches: formattedMatches }, { status: 200 });
  } catch (error) {
    console.error('Match list error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
