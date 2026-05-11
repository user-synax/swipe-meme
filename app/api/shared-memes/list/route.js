import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SharedMeme from '@/models/SharedMeme';
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

    const { searchParams } = new URL(req.url);
    const friendId = searchParams.get('friendId');
    const type = searchParams.get('type') || 'received'; // 'sent' or 'received'

    let query = {};
    
    if (friendId) {
      // Get memes shared with specific friend
      query = type === 'sent' 
        ? { sender: userId, recipient: friendId }
        : { sender: friendId, recipient: userId };
    } else {
      // Get all memes
      query = type === 'sent' 
        ? { sender: userId }
        : { recipient: userId };
    }

    const sharedMemes = await SharedMeme.find(query)
      .populate('sender', 'username avatar')
      .populate('recipient', 'username avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({ sharedMemes }, { status: 200 });
  } catch (error) {
    console.error('Shared memes list error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
