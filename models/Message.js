import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index for efficient querying by matchId and sorting by createdAt
MessageSchema.index({ matchId: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
