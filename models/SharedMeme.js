import mongoose from 'mongoose';

const SharedMemeSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  memeRedditId: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
  }],
  seen: {
    type: Boolean,
    default: false,
  },
  friendRelation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Friend',
  },
}, { timestamps: true });

// Index for querying shared memes
SharedMemeSchema.index({ sender: 1, recipient: 1 });
SharedMemeSchema.index({ recipient: 1, seen: 1 });
SharedMemeSchema.index({ friendRelation: 1 });

export default mongoose.models.SharedMeme || mongoose.model('SharedMeme', SharedMemeSchema);
