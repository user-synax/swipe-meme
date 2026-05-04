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

    const { matchId } = await req.json();

    if (!matchId) {
      return NextResponse.json({ error: 'Missing matchId' }, { status: 400 });
    }

    const match = await Match.findById(matchId);
    
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Verify current user is part of this match
    if (match.userA.toString() !== userId && match.userB.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    match.chatUnlocked = true;
    await match.save();

    return NextResponse.json({ match }, { status: 200 });
  } catch (error) {
    console.error('Match unlock error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
