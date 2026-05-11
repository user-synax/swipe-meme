import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Friend from '@/models/Friend';
import User from '@/models/User';
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

    // Find all accepted friendships where user is either requester or recipient
    const friendships = await Friend.find({
      status: 'accepted',
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    })
    .populate('requester', 'username avatar humorType')
    .populate('recipient', 'username avatar humorType')
    .sort({ updatedAt: -1 });

    // Format friends list with other user's info
    const formattedFriends = friendships.map(friendship => {
      const isRequester = friendship.requester._id.toString() === userId;
      const otherUser = isRequester ? friendship.recipient : friendship.requester;
      
      return {
        _id: friendship._id,
        user: otherUser,
        chatUnlocked: friendship.chatUnlocked,
        sharedMemeCount: friendship.sharedMemeCount,
        createdAt: friendship.createdAt,
        updatedAt: friendship.updatedAt
      };
    });

    return NextResponse.json({ friends: formattedFriends }, { status: 200 });
  } catch (error) {
    console.error('Friends list error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
