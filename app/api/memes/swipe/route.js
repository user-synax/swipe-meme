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

    const { memeRedditId, imageUrl, tags, action } = await req.json();

    if (!memeRedditId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Check duplicate swipe
    const existingSwipe = await Swipe.findOne({ userId, memeRedditId });
    if (existingSwipe) {
      return NextResponse.json({ error: 'Meme already swiped' }, { status: 409 });
    }

    // 2. Create Swipe document
    await Swipe.create({
      userId,
      memeRedditId,
      imageUrl,
      tags,
      action
    });

    let triggerMatchCheck = false;

    // 3. Update User if liked
    if (action === 'like') {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { 
          $addToSet: { likedRedditIds: memeRedditId },
          $inc: { swipeCount: 1 }
        },
        { new: true }
      );

      if (updatedUser.swipeCount % 15 === 0) {
        triggerMatchCheck = true;
      }
    } else {
      // Still increment swipeCount for dislikes to trigger match check?
      // The prompt says: "If action === 'like': ... increment User.swipeCount"
      // So I will only increment and check trigger for likes as per instructions.
    }

    return NextResponse.json({ success: true, triggerMatchCheck }, { status: 201 });
  } catch (error) {
    console.error('Swipe API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
