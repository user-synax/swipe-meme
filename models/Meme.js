import mongoose from 'mongoose';

const MemeSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  pool: {
    type: String,
    enum: ['trending', 'category'],
    default: 'trending',
  },
  likes: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.models.Meme || mongoose.model('Meme', MemeSchema);
