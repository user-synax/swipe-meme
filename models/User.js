import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  humorType: {
    type: String,
    default: '',
  },
  likedMemes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meme',
  }],
  likedRedditIds: {
    type: [String],
    default: [],
  },
  swipeCount: {
    type: Number,
    default: 0,
  },
  dailySwipeCount: {
    type: Number,
    default: 0,
  },
  lastSwipeDate: {
    type: Date,
    default: null,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
