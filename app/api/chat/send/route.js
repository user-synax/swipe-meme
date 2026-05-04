import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';
import pusherServer from '@/lib/pusherServer';

export async function POST(req) {
  try {
    await connectDB();

    const { matchId, text } = await req.json();

    // Validate input
    if (!matchId || !text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    if (text.trim().length === 0 || text.length > 500) {
      return NextResponse.json({ error: 'Message must be 1-500 characters' }, { status: 400 });
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

    // Save message
    const message = await Message.create({
      matchId,
      senderId: userId,
      text: text.trim(),
    });

    // Trigger Pusher event
    await pusherServer.trigger(
      `match-${matchId}`,
      'new-message',
      {
        _id: message._id,
        senderId: userId,
        text: message.text,
        createdAt: message.createdAt,
      }
    );

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
