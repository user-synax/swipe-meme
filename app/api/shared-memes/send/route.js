import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SharedMeme from '@/models/SharedMeme';
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

    const { recipientId, memeRedditId, imageUrl, title, tags } = await req.json();

    if (!recipientId || !memeRedditId || !imageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify they are friends
    const friendship = await Friend.findOne({
      status: 'accepted',
      $or: [
        { requester: userId, recipient: recipientId },
        { requester: recipientId, recipient: userId }
      ]
    });

    if (!friendship) {
      return NextResponse.json({ error: 'You must be friends to share memes' }, { status: 403 });
    }

    // Create shared meme record
    const sharedMeme = await SharedMeme.create({
      sender: userId,
      recipient: recipientId,
      memeRedditId,
      imageUrl,
      title: title || '',
      tags: tags || [],
      friendRelation: friendship._id
    });

    // Increment shared meme count on friendship
    await Friend.findByIdAndUpdate(friendship._id, {
      $inc: { sharedMemeCount: 1 }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Meme shared successfully',
      sharedMeme 
    }, { status: 201 });
  } catch (error) {
    console.error('Share meme error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
