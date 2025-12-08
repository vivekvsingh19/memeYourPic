
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedCaption } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Basic safety filter list (client-side precaution)
// In a real app, this would be more robust or handled by a separate moderation API
const BANNED_KEYWORDS = [
  'kill', 'suicide', 'die', 'hate', 'stupid', 'idiot', // basic negative words that might be too harsh if unchecked
  'racist', 'sexist', 'nazi', 'pedophile', // severe
  'ugly', 'fat', // personal attacks
];

const filterCaptions = (captions: string[]): string[] => {
  return captions.filter(caption => {
    const lower = caption.toLowerCase();
    // Check for banned words
    const hasBannedWord = BANNED_KEYWORDS.some(word => {
      // Simple boundary check to avoid false positives in substrings
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(lower);
    });
    return !hasBannedWord;
  });
};

export const generateMemeCaptions = async (
  imageFile: File,
  roastMode: boolean = false,
  languageId: string = 'english'
): Promise<GeneratedCaption[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Gemini API Key is missing! Check VITE_GEMINI_API_KEY.");
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  const base64Image = await fileToGenerativePart(imageFile);

  // Get specific prompt instruction for the selected language
  const languageObj = SUPPORTED_LANGUAGES.find(l => l.id === languageId) || SUPPORTED_LANGUAGES[0];
  const languageInstruction = languageObj.prompt;

  // Prompt engineering for Vision + Humor analysis
  const systemInstruction = `
    You are an expert AI Meme Generator specializing in viral Gen-Z humor.
    Your goal is to turn photos into shareable, relatable content.
  `;

  // Dynamic instructions based on Roast Mode
  const toneInstruction = roastMode
    ? `
      MODE: SAVAGE ROAST 🔥
      - Be brutally honest, sarcastic, and cutting.
      - Roast the person, the context, or the vibe in the photo.
      - Use dry, deadpan humor.
      - Make it sting a little, but keep it funny.
      `
    : `
      MODE: FUN & RELATABLE 😆
      - Light-hearted, self-deprecating, and viral Gen-Z humor.
      - Focus on "Me IRL" moments.
      `;

  const safetyInstruction = `
    SAFETY RULES (CRITICAL):
    - Do NOT use slurs, hate speech, or sexually explicit content.
    - Do NOT make jokes about self-harm, severe violence, or protected groups (race, religion, gender).
    - If roasting, target the *situation* or *choices*, not inherent traits.
  `;

  const prompt = `
    Analyze the provided image specifically for meme potential.
    1. Detect the MOOD (e.g., awkward, confident, chaotic, sad).
    2. Detect the SCENE (e.g., party, exam hall, bedroom, office).
    3. Detect the CONTEXT (e.g., trying to impress someone, failing at a task, group drama).

    Based on this analysis, automatically determine the best meme archetype fitting this specific image.

    Then, generate 10 funny meme captions.

    OUTPUT LANGUAGE: ${languageInstruction}

    ${toneInstruction}

    ${safetyInstruction}

    RULES:
    - Keep text short and punchy (max 8–12 words).
    - Use emojis only if they enhance the joke.
    - The output must be a raw JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        },
        // Higher temperature for more creative roasting
        temperature: roastMode ? 1.2 : 1.0,
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    let captionsRaw = JSON.parse(jsonText) as string[];

    // Apply safety filter
    const initialCount = captionsRaw.length;
    captionsRaw = filterCaptions(captionsRaw);

    if (captionsRaw.length < initialCount) {
      console.log(`Filtered ${initialCount - captionsRaw.length} unsafe captions.`);
    }

    // Fallback if everything was filtered (unlikely but possible with aggressive roasting)
    if (captionsRaw.length === 0) {
      captionsRaw = ["Image too powerful for words", "Error 404: Roast not found", "Try a different angle maybe?"];
    }

    return captionsRaw.map((text, index) => ({
      id: `cap-${Date.now()}-${index}`,
      text: text
    }));

  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // Handle specific API errors
    if (error.message?.includes('leaked') || error.message?.includes('403')) {
      throw new Error("API Key blocked by Google (Leaked). Please generate a new key.");
    }

    // Fallback if API fails to parse or network error
    throw new Error("Failed to generate memes. Please try again.");
  }
};
