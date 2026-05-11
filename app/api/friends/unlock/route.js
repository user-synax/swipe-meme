import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Friend from '@/models/Friend';
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

    // Find the friendship
    const friendship = await Friend.findOne({
      _id: friendId,
      status: 'accepted',
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    // Check if already unlocked
    if (friendship.chatUnlocked) {
      return NextResponse.json({ 
        success: true, 
        message: 'Profile already unlocked',
        chatUnlocked: true 
      }, { status: 200 });
    }

    // Unlock the profile
    friendship.chatUnlocked = true;
    await friendship.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Profile unlocked',
      chatUnlocked: true 
    }, { status: 200 });
  } catch (error) {
    console.error('Unlock friend error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
