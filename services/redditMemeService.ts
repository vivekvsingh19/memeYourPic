/**
 * Reddit Meme API Service
 * Fetches random memes from Reddit using the free meme-api.com
 * API Docs: https://github.com/D3vd/Meme_Api
 *
 * Subreddits supported: r/memes, r/dankmemes, r/me_irl, and any public subreddit
 */

export interface RedditMeme {
  postLink: string;
  subreddit: string;
  title: string;
  url: string;
  nsfw: boolean;
  spoiler: boolean;
  author: string;
  ups: number;
  preview: string[];
}

export interface RedditMemeResponse {
  count: number;
  memes: RedditMeme[];
}

// Cache for memes
let cachedMemes: RedditMeme[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes (memes are dynamic, so shorter cache)

// Available subreddits for memes
export const MEME_SUBREDDITS = [
  'memes',
  'dankmemes',
  'me_irl',
  'wholesomememes',
  'AdviceAnimals',
  'MemeEconomy',
];

/**
 * Fetches multiple random memes from Reddit
 * @param count Number of memes to fetch (max 50)
 * @param subreddit Optional specific subreddit (default: mixed from popular meme subreddits)
 */
export async function fetchRedditMemes(count: number = 20, subreddit?: string): Promise<RedditMeme[]> {
  // Return cached data if valid
  if (cachedMemes.length > 0 && Date.now() - cacheTimestamp < CACHE_DURATION && !subreddit) {
    return cachedMemes;
  }

  try {
    const endpoint = subreddit
      ? `https://meme-api.com/gimme/${subreddit}/${Math.min(count, 50)}`
      : `https://meme-api.com/gimme/${Math.min(count, 50)}`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Reddit Meme API error: ${response.status}`);
    }

    const data: RedditMemeResponse = await response.json();

    // Filter out NSFW and spoiler memes
    const safeMemes = data.memes.filter(meme => !meme.nsfw && !meme.spoiler);

    // Cache the results (only for default fetch)
    if (!subreddit) {
      cachedMemes = safeMemes;
      cacheTimestamp = Date.now();
    }

    return safeMemes;
  } catch (error) {
    console.error('Failed to fetch Reddit memes:', error);

    // Return cached data if available
    if (cachedMemes.length > 0) {
      return cachedMemes;
    }

    throw error;
  }
}

/**
 * Fetches a single random meme
 */
export async function fetchRandomMeme(subreddit?: string): Promise<RedditMeme | null> {
  try {
    const endpoint = subreddit
      ? `https://meme-api.com/gimme/${subreddit}`
      : 'https://meme-api.com/gimme';

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Reddit Meme API error: ${response.status}`);
    }

    const meme: RedditMeme = await response.json();

    // Skip NSFW/spoiler
    if (meme.nsfw || meme.spoiler) {
      return fetchRandomMeme(subreddit); // Try again
    }

    return meme;
  } catch (error) {
    console.error('Failed to fetch random meme:', error);
    return null;
  }
}

/**
 * Convert RedditMeme to MemeTemplateImage format for compatibility
 */
export function redditMemeToTemplate(meme: RedditMeme) {
  return {
    id: meme.postLink,
    name: meme.title.length > 50 ? meme.title.substring(0, 47) + '...' : meme.title,
    url: meme.url,
  };
}
