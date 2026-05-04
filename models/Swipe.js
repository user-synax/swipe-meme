import mongoose from 'mongoose';

const SwipeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  memeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meme',
    required: false,
  },
  memeRedditId: {
    type: String,
    required: true,
  },
  imageUrl: String,
  tags: [String],
  action: {
    type: String,
    enum: ['like', 'dislike'],
    required: true,
  },
}, { timestamps: true });

// Compound index on [userId, memeRedditId] unique
SwipeSchema.index({ userId: 1, memeRedditId: 1 }, { unique: true });

export default mongoose.models.Swipe || mongoose.model('Swipe', SwipeSchema);
