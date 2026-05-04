import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;

    // Validate input
    if (!matchId) {
      return NextResponse.json({ error: 'matchId required' }, { status: 400 });
    }

    // Verify user
    let userId;
    try {
      userId = verifyToken(req);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify match exists and chat is unlocked
    const match = await Match.findById(matchId);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (!match.chatUnlocked) {
      return NextResponse.json({ error: 'Chat not unlocked' }, { status: 403 });
    }

    // Verify user is part of the match
    if (match.userA.toString() !== userId && match.userB.toString() !== userId) {
      return NextResponse.json({ error: 'Not authorized for this match' }, { status: 403 });
    }

    // Fetch messages
    const messages = await Message.find({ matchId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Check if there are more messages
    const total = await Message.countDocuments({ matchId });
    const hasMore = skip + messages.length < total;

    // Return in ascending order (oldest first)
    const reversedMessages = messages.reverse();

    return NextResponse.json({ messages: reversedMessages, hasMore }, { status: 200 });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
