import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import { verifyToken } from '@/lib/auth';

// In-memory cache: userId -> { count, expiresAt }
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds
const unreadCache = new Map();

export async function GET(req) {
  try {
    await connectDB();

    let userId;
    try {
      userId = verifyToken(req);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check cache
    const cached = unreadCache.get(userId);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json({ count: cached.count });
    }

    // Count matches where user is participant and hasn't seen it
    const count = await Match.countDocuments({
      $or: [
        { userA: userId },
        { userB: userId }
      ],
      seenBy: { $ne: userId }
    });

    // Update cache
    unreadCache.set(userId, {
      count,
      expiresAt: Date.now() + CACHE_DURATION_MS
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Unread count API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
