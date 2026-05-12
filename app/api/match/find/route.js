import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
  try {
    await connectDB();
    
    let userId;
    try {
      userId = verifyToken(req);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { friendId } = await req.json();

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
    }

    // Find match between current user and friend
    const match = await Match.findOne({
      $or: [
        { userA: userId, userB: friendId },
        { userA: friendId, userB: userId }
      ]
    });

    if (!match) {
      return NextResponse.json({ error: 'No match found' }, { status: 404 });
    }

    return NextResponse.json({ matchId: match._id }, { status: 200 });
  } catch (error) {
    console.error('Find match error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
