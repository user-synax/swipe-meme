import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Friend from '@/models/Friend';
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

    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Find the user to send request to
    const recipient = await User.findOne({ username: username.toLowerCase().trim() });
    
    if (!recipient) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent sending request to self
    if (recipient._id.toString() === userId) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    // Check if friend request already exists in either direction
    const existingRequest = await Friend.findOne({
      $or: [
        { requester: userId, recipient: recipient._id },
        { requester: recipient._id, recipient: userId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        return NextResponse.json({ error: 'Already friends with this user' }, { status: 409 });
      } else if (existingRequest.status === 'pending') {
        return NextResponse.json({ error: 'Friend request already pending' }, { status: 409 });
      }
    }

    // Create new friend request
    const friendRequest = await Friend.create({
      requester: userId,
      recipient: recipient._id,
      status: 'pending'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Friend request sent',
      friendRequest 
    }, { status: 201 });
  } catch (error) {
    console.error('Friend request error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Friend request already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
