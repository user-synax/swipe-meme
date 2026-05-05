import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  userA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  commonLikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meme',
  }],
  commonLikedIds: {
    type: [String],
    default: [],
  },
  commonMemeUrls: {
    type: [String],
    default: [],
  },
  jaccardScore: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'matched'],
    default: 'matched',
  },
  chatUnlocked: {
    type: Boolean,
    default: false,
  },
  seenBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

// Compound index on [userA, userB] unique
MatchSchema.index({ userA: 1, userB: 1 }, { unique: true });

export default mongoose.models.Match || mongoose.model('Match', MatchSchema);
