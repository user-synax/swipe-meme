import mongoose from 'mongoose';

const FriendSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  chatUnlocked: {
    type: Boolean,
    default: false,
  },
  sharedMemeCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Compound index on [requester, recipient] unique
FriendSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Index for querying friends by user
FriendSchema.index({ requester: 1, status: 1 });
FriendSchema.index({ recipient: 1, status: 1 });

export default mongoose.models.Friend || mongoose.model('Friend', FriendSchema);
