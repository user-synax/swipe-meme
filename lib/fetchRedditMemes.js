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
      try {
        const res = await fetch(
          `https://www.reddit.com/r/${name}/hot.json?limit=50`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json',
            },
          }
        )
        if (!res.ok) {
          console.error(`Reddit API error for r/${name}: ${res.status} ${res.statusText}`)
          return []
        }
        const data = await res.json()
        if (!data.data || !data.data.children) {
          console.error(`Reddit API invalid response for r/${name}:`, data)
          return []
        }
        return data.data.children
          .map(p => p.data)
          .filter(p =>
            p.post_hint === 'image' &&
            !p.over_18 &&
            p.url && p.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          )
          .map(p => ({
            redditId: p.id,
            imageUrl: p.url,
            title: p.title,
            tags: inferTags(p.title, name, defaultTag),
            pool: p.score > 5000 ? 'trending' : 'category',
            upvotes: p.score
          }))
      } catch (err) {
        console.error(`Error fetching r/${name}:`, err.message)
        return []
      }
    })
  )

  const memes = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)

  console.log(`Fetched ${memes.length} memes from Reddit`)
  return memes
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
