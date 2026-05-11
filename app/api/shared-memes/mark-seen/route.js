import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SharedMeme from '@/models/SharedMeme';
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

    const { sharedMemeId, markAll } = await req.json();

    if (markAll) {
      // Mark all received memes as seen
      await SharedMeme.updateMany(
        { recipient: userId, seen: false },
        { $set: { seen: true } }
      );

      return NextResponse.json({ 
        success: true, 
        message: 'All memes marked as seen' 
      }, { status: 200 });
    }

    if (!sharedMemeId) {
      return NextResponse.json({ error: 'Shared meme ID is required' }, { status: 400 });
    }

    // Mark specific meme as seen
    const sharedMeme = await SharedMeme.findOneAndUpdate(
      { _id: sharedMemeId, recipient: userId },
      { $set: { seen: true } },
      { new: true }
    );

    if (!sharedMeme) {
      return NextResponse.json({ error: 'Shared meme not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Meme marked as seen' 
    }, { status: 200 });
  } catch (error) {
    console.error('Mark seen error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
