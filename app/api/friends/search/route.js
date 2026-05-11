import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
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

    const { query } = await req.json();

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        error: 'Search query must be at least 2 characters' 
      }, { status: 400 });
    }

    const searchTerm = query.trim().toLowerCase();

    // Search users by username (case-insensitive partial match)
    const users = await User.find({
      username: { $regex: searchTerm, $options: 'i' },
      _id: { $ne: userId }
    })
    .select('username avatar humorType')
    .limit(20);

    // Get existing friend relationships for these users
    const userIds = users.map(u => u._id.toString());
    
    const existingRelations = await Friend.find({
      $or: [
        { requester: userId, recipient: { $in: userIds } },
        { recipient: userId, requester: { $in: userIds } }
      ]
    });

    // Map relation status to users
    const results = users.map(user => {
      const relation = existingRelations.find(r => 
        r.requester.toString() === user._id.toString() || 
        r.recipient.toString() === user._id.toString()
      );

      return {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        humorType: user.humorType,
        relationStatus: relation ? relation.status : null,
        relationId: relation ? relation._id : null,
        isRequester: relation ? relation.requester.toString() === userId : false
      };
    });

    return NextResponse.json({ users: results }, { status: 200 });
  } catch (error) {
    console.error('Friend search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
