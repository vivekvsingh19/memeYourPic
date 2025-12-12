/**
 * Imgflip API Service
 * Fetches popular meme templates from the free Imgflip API
 * API Docs: https://imgflip.com/api
 */

export interface ImgflipMeme {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  box_count: number;
}

export interface ImgflipApiResponse {
  success: boolean;
  data: {
    memes: ImgflipMeme[];
  };
}

// Cache for meme templates to avoid repeated API calls
let cachedMemes: ImgflipMeme[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

/**
 * Fetches the top 100 most popular meme templates from Imgflip
 * This endpoint is free and doesn't require authentication
 */
export async function fetchMemeTemplates(): Promise<ImgflipMeme[]> {
  // Return cached data if valid
  if (cachedMemes && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedMemes;
  }

  try {
    const response = await fetch('https://api.imgflip.com/get_memes');

    if (!response.ok) {
      throw new Error(`Imgflip API error: ${response.status}`);
    }

    const data: ImgflipApiResponse = await response.json();

    if (!data.success) {
      throw new Error('Imgflip API returned unsuccessful response');
    }

    // Cache the results
    cachedMemes = data.data.memes;
    cacheTimestamp = Date.now();

    return cachedMemes;
  } catch (error) {
    console.error('Failed to fetch meme templates:', error);

    // Return cached data if available, even if expired
    if (cachedMemes) {
      return cachedMemes;
    }

    // Throw error if no fallback available
    throw error;
  }
}

/**
 * Search meme templates by name
 */
export function searchMemeTemplates(memes: ImgflipMeme[], query: string): ImgflipMeme[] {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) {
    return memes;
  }

  return memes.filter(meme =>
    meme.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Convert Imgflip meme to MemeTemplateImage format for compatibility
 */
export function toMemeTemplateImage(meme: ImgflipMeme) {
  return {
    id: meme.id,
    name: meme.name,
    url: meme.url,
  };
}
