import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Match from '@/models/Match';
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

    const { id: targetId } = await params;

    // Verify a Match exists between requester and target with chatUnlocked: true
    const match = await Match.findOne({
      $or: [
        { userA: userId, userB: targetId },
        { userA: targetId, userB: userId }
      ],
      chatUnlocked: true
    });

    if (!match) {
      return NextResponse.json({ error: 'Forbidden', code: 'LOCKED_PROFILE' }, { status: 403 });
    }

    const user = await User.findById(targetId).select('username avatar bio humorType');
    if (!user) {
      return NextResponse.json({ error: 'User not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('User profile API error:', error);
    return NextResponse.json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
