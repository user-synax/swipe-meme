let cache = { memes: [], fetchedAt: 0 };
const TTL = 2 * 60 * 60 * 1000; // 2 hours

export async function getCachedMemes() {
  if (Date.now() - cache.fetchedAt < TTL && cache.memes.length > 0) {
    return cache.memes;
  }
  const { fetchFromAllSubreddits } = await import('./fetchRedditMemes');
  const fresh = await fetchFromAllSubreddits();
  cache = { memes: fresh, fetchedAt: Date.now() };
  return cache.memes;
}
