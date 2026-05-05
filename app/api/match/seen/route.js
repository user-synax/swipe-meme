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

    // Find match and verify user is part of it
    const match = await Match.findById(matchId);

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Security: verify user is actually userA or userB
    const isParticipant = match.userA.toString() === userId || match.userB.toString() === userId;
    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Add user to seenBy using $addToSet
    await Match.findByIdAndUpdate(matchId, {
      $addToSet: { seenBy: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark seen API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
