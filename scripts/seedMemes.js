import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const FALLBACK_MEMES = [
  {
    redditId: 'seed_001',
    imageUrl: 'https://i.redd.it/abc123.jpg',
    title: 'When the code works on first try',
    tags: ['coding', 'relatable'],
    pool: 'trending',
    upvotes: 10000,
    isActive: true,
  },
  {
    redditId: 'seed_002',
    imageUrl: 'https://i.redd.it/def456.jpg',
    title: 'Indian parents be like',
    tags: ['desi', 'relatable'],
    pool: 'category',
    upvotes: 5000,
    isActive: true,
  },
  {
    redditId: 'seed_003',
    imageUrl: 'https://i.redd.it/ghi789.jpg',
    title: 'Gen Z humor is something else',
    tags: ['genz', 'absurd'],
    pool: 'category',
    upvotes: 3000,
    isActive: true,
  },
  {
    redditId: 'seed_004',
    imageUrl: 'https://i.redd.it/jkl012.jpg',
    title: 'Wholesome moment',
    tags: ['wholesome'],
    pool: 'category',
    upvotes: 8000,
    isActive: true,
  },
  {
    redditId: 'seed_005',
    imageUrl: 'https://i.redd.it/mno345.jpg',
    title: 'Dark humor incoming',
    tags: ['dark', 'genz'],
    pool: 'category',
    upvotes: 2000,
    isActive: true,
  },
];

async function seedMemes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Meme = mongoose.models.Meme || mongoose.model('Meme', new mongoose.Schema({
      redditId: { type: String, required: true, unique: true },
      imageUrl: { type: String, required: true },
      title: { type: String, default: '' },
      tags: { type: [String], default: [] },
      pool: { type: String, enum: ['trending', 'category'], default: 'category' },
      upvotes: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
    }, { timestamps: true }));

    // Only seed if no active memes exist
    const existingCount = await Meme.countDocuments({ isActive: true });
    if (existingCount > 0) {
      console.log(`${existingCount} active memes already exist. Skipping seed.`);
      process.exit(0);
    }

    await Meme.insertMany(FALLBACK_MEMES, { ordered: false });
    console.log(`Seeded ${FALLBACK_MEMES.length} fallback memes`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedMemes();
