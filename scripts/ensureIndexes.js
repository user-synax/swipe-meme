const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function ensureIndexes() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}));
    const Swipe = mongoose.model('Swipe', new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      memeRedditId: String
    }));
    const Match = mongoose.model('Match', new mongoose.Schema({
      userA: mongoose.Schema.Types.ObjectId,
      userB: mongoose.Schema.Types.ObjectId
    }));

    console.log('Ensuring indexes...');
    
    await Swipe.collection.createIndex({ userId: 1, memeRedditId: 1 }, { unique: true });
    console.log('Swipe unique index ensured');

    await Match.collection.createIndex({ userA: 1, userB: 1 }, { unique: true });
    console.log('Match unique index ensured');

    console.log('All indexes ensured successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error ensuring indexes:', error);
    process.exit(1);
  }
}

ensureIndexes();
