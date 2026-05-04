import mongoose from 'mongoose';

const MemeSchema = new mongoose.Schema({
  redditId: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  pool: {
    type: String,
    enum: ['trending', 'category'],
    default: 'category',
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.models.Meme || mongoose.model('Meme', MemeSchema);
