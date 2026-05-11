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

    // Get incoming friend requests
    const incomingRequests = await Friend.find({
      recipient: userId,
      status: 'pending'
    })
    .populate('requester', 'username avatar humorType')
    .sort({ createdAt: -1 });

    // Get outgoing friend requests
    const outgoingRequests = await Friend.find({
      requester: userId,
      status: 'pending'
    })
    .populate('recipient', 'username avatar humorType')
    .sort({ createdAt: -1 });

    return NextResponse.json({ 
      incoming: incomingRequests,
      outgoing: outgoingRequests,
      totalPending: incomingRequests.length + outgoingRequests.length
    }, { status: 200 });
  } catch (error) {
    console.error('Friend requests error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
