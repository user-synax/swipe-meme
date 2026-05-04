const SUBREDDITS = [
  { name: 'dankinindia', defaultTag: 'desi' },
  { name: 'teenagers', defaultTag: 'genz' },
  { name: 'shitposting', defaultTag: 'absurd' },
  { name: 'dankmemes', defaultTag: 'genz' },
  { name: 'me_irl', defaultTag: 'relatable' },
  { name: 'BollyBlindsNGossip', defaultTag: 'desi' },
  { name: 'ProgrammerHumor', defaultTag: 'coding' }
]

export async function fetchFromAllSubreddits() {
  const results = await Promise.allSettled(
    SUBREDDITS.map(async ({ name, defaultTag }) => {
      const res = await fetch(
        `https://www.reddit.com/r/${name}/top.json?t=day&limit=30`,
        {
          headers: { 'User-Agent': 'SwipeMeme/1.0 (web app)' },
          next: { revalidate: 3600 } // 1 hour — daily top posts change hourly
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
    })
  )

  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
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
