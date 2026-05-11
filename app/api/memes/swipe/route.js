import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Swipe from '@/models/Swipe';
import User from '@/models/User';
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

    const { memeRedditId, imageUrl, tags, action, isSuperLike = false } = await req.json();

    if (!memeRedditId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Check duplicate swipe
    const existingSwipe = await Swipe.findOne({ userId, memeRedditId });
    if (existingSwipe) {
      return NextResponse.json({ error: 'Meme already swiped' }, { status: 409 });
    }

    // Fetch user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Create Swipe document
    await Swipe.create({
      userId,
      memeRedditId,
      imageUrl,
      tags,
      action,
      isSuperLike
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: action === 'like' ? { likedRedditIds: memeRedditId } : {},
        $inc: { swipeCount: 1 }
      },
      { new: true }
    );

    // Trigger match check more frequently for Super Likes (every 5 instead of 15)
    const triggerMatchCheck = isSuperLike ? 
      updatedUser.swipeCount % 5 === 0 : 
      updatedUser.swipeCount % 15 === 0;

    return NextResponse.json({
      success: true,
      isSuperLike,
      triggerMatchCheck
    }, { status: 201 });
  } catch (error) {
    console.error('Swipe API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
