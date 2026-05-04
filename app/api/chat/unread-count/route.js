import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();

    let userId;
    try {
      userId = verifyToken(req);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all matches where user is participant and chat is unlocked
    const matches = await Match.find({
      $or: [{ userA: userId }, { userB: userId }],
      chatUnlocked: true,
    }).select('_id userA userB');

    if (matches.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    const matchIds = matches.map((m) => m._id);

    // Count unread messages (messages from others that are not read)
    const unreadCount = await Message.countDocuments({
      matchId: { $in: matchIds },
      senderId: { $ne: userId },
      read: false,
    });

    return NextResponse.json({ count: unreadCount }, { status: 200 });
  } catch (error) {
    console.error('Unread count error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
