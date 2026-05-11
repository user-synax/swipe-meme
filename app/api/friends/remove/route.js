import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Friend from '@/models/Friend';
import { verifyToken } from '@/lib/auth';

export async function DELETE(req) {
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

    // Find the friendship (must be accepted)
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

    // Delete the friendship
    await Friend.findByIdAndDelete(friendId);

    return NextResponse.json({ 
      success: true, 
      message: 'Friend removed'
    }, { status: 200 });
  } catch (error) {
    console.error('Remove friend error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
