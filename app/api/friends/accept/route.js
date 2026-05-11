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

    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // Find the friend request
    const friendRequest = await Friend.findById(requestId);

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    // Verify current user is the recipient
    if (friendRequest.recipient.toString() !== userId) {
      return NextResponse.json({ error: 'Not authorized to accept this request' }, { status: 403 });
    }

    // Check if already accepted or rejected
    if (friendRequest.status !== 'pending') {
      return NextResponse.json({ error: `Request already ${friendRequest.status}` }, { status: 400 });
    }

    // Accept the request
    friendRequest.status = 'accepted';
    await friendRequest.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Friend request accepted',
      friend: friendRequest 
    }, { status: 200 });
  } catch (error) {
    console.error('Accept friend error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
