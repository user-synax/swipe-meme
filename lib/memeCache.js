import Meme from '@/models/Meme';
import connectDB from './db';

const CACHE_TTL_MINUTES = 30;

export async function getCachedMemes() {
  await connectDB();

  // Check if we have fresh memes in DB
  const cutoff = new Date(Date.now() - CACHE_TTL_MINUTES * 60 * 1000);
  let memes = await Meme.find({ isActive: true, updatedAt: { $gte: cutoff } }).lean();

  if (memes.length === 0) {
    // Fetch fresh memes from Reddit
    const { fetchFromAllSubreddits } = await import('./fetchRedditMemes');
    const fresh = await fetchFromAllSubreddits();

    if (fresh.length > 0) {
      // Deactivate old memes
      await Meme.updateMany({}, { isActive: false });

      // Insert new memes with redditId
      const memesWithRedditId = fresh.map(m => ({
        ...m,
        redditId: m.redditId,
        isActive: true,
      }));
      await Meme.insertMany(memesWithRedditId, { ordered: false }).catch(() => {});

      memes = await Meme.find({ isActive: true }).lean();
    } else {
      // Fallback: return any existing active memes even if stale
      memes = await Meme.find({ isActive: true }).lean();
    }
  }

  return memes;
}
