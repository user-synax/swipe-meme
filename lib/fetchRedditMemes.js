const SUBREDDITS = [
  { name: 'dankinindia', defaultTag: 'desi' },
  { name: 'teenagers', defaultTag: 'genz' },
  { name: 'shitposting', defaultTag: 'absurd' },
  { name: 'dankmemes', defaultTag: 'genz' },
  { name: 'me_irl', defaultTag: 'relatable' },
  { name: 'BollyBlindsNGossip', defaultTag: 'desi' },
  { name: 'ProgrammerHumor', defaultTag: 'coding' },
  { name: 'memes', defaultTag: 'relatable' },
  { name: 'AdviceAnimals', defaultTag: 'relatable' },
  { name: 'terriblefacebookmemes', defaultTag: 'absurd' },
  { name: 'IndianDankMemes', defaultTag: 'desi' },
  { name: 'ComedyCemetery', defaultTag: 'absurd' }
]

async function fetchSubreddit(name, defaultTag, timeframe) {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${name}/top.json?t=${timeframe}&limit=50`,
      {
        headers: { 'User-Agent': 'MemeMate/1.0 (web app)' },
        next: { revalidate: 3600 }
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.data.children
      .map(p => p.data)
      .filter(p =>
        p.post_hint === 'image' &&
        !p.over_18 &&
        p.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      )
      .map(p => ({
        redditId: p.id,
        imageUrl: p.url,
        title: p.title,
        tags: inferTags(p.title, name, defaultTag),
        pool: p.score > 5000 ? 'trending' : 'category',
        upvotes: p.score
      }))
  } catch {
    return []
  }
}

export async function fetchFromAllSubreddits() {
  const results = await Promise.allSettled(
    SUBREDDITS.flatMap(({ name, defaultTag }) => [
      fetchSubreddit(name, defaultTag, 'day'),
      fetchSubreddit(name, defaultTag, 'week'),
      fetchSubreddit(name, defaultTag, 'month'),
    ])
  )

  const all = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)

  const seen = new Set()
  return all.filter(m => {
    if (seen.has(m.redditId)) return false
    seen.add(m.redditId)
    return true
  })
}

function inferTags(title, subreddit, defaultTag) {
  const tags = [defaultTag]
  const t = title.toLowerCase()
  if (t.includes('dark') || t.includes('death') || t.includes('pain')) tags.push('dark')
  if (t.includes('relatable') || t.includes('me when') || t.includes('nobody')) tags.push('relatable')
  if (t.includes('wholesome') || t.includes('love') || t.includes('happy')) tags.push('wholesome')
  if (t.includes('gen z') || t.includes('brainrot') || t.includes('rizz') || t.includes('slay')) tags.push('genz')
  if (t.includes('bhai') || t.includes('yaar') || t.includes('indian') || t.includes('india')) tags.push('desi')
  return [...new Set(tags)]
}
