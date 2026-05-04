import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Load env from .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const FALLBACK_MEMES = [
  {
    redditId: "seed_001",
    imageUrl:
      "https://images.unsplash.com/photo-1531297461136-82lw9z16330c?w=800&q=80",
    title: "When the code works on first try",
    tags: ["coding", "relatable"],
    pool: "trending",
    upvotes: 10000,
    isActive: true,
  },
  {
    redditId: "seed_002",
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80",
    title: "Cat judging your life choices",
    tags: ["desi", "relatable"],
    pool: "category",
    upvotes: 5000,
    isActive: true,
  },
  {
    redditId: "seed_003",
    imageUrl:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80",
    title: "Gen Z humor is something else",
    tags: ["genz", "absurd"],
    pool: "category",
    upvotes: 3000,
    isActive: true,
  },
  {
    redditId: "seed_004",
    imageUrl:
      "https://images.unsplash.com/photo-1450778869187-0ef86b9f6f7f?w=800&q=80",
    title: "Wholesome puppy moment",
    tags: ["wholesome"],
    pool: "category",
    upvotes: 8000,
    isActive: true,
  },
  {
    redditId: "seed_005",
    imageUrl:
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800&q=80",
    title: "When you realize its Monday tomorrow",
    tags: ["dark", "genz"],
    pool: "category",
    upvotes: 2000,
    isActive: true,
  },
];

async function seedMemes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const Meme =
      mongoose.models.Meme ||
      mongoose.model(
        "Meme",
        new mongoose.Schema(
          {
            redditId: { type: String, required: true, unique: true },
            imageUrl: { type: String, required: true },
            title: { type: String, default: "" },
            tags: { type: [String], default: [] },
            pool: {
              type: String,
              enum: ["trending", "category"],
              default: "category",
            },
            upvotes: { type: Number, default: 0 },
            isActive: { type: Boolean, default: true },
          },
          { timestamps: true },
        ),
      );

    // Only seed if no active memes exist
    const existingCount = await Meme.countDocuments({ isActive: true });
    if (existingCount > 0) {
      console.log(
        `${existingCount} active memes already exist. Skipping seed.`,
      );
      process.exit(0);
    }

    await Meme.insertMany(FALLBACK_MEMES, { ordered: false });
    console.log(`Seeded ${FALLBACK_MEMES.length} fallback memes`);

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seedMemes();
