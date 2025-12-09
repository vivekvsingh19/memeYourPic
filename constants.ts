

import { MemeStyle } from './types';

export const MEME_STYLES: MemeStyle[] = [
  {
    id: 'toxic',
    label: 'Toxic',
    emoji: '😈',
    prompt: 'Style: Roast-heavy, toxic, sarcastic, and slightly mean. Focus on bad decisions and red flags.'
  },
  {
    id: 'crush',
    label: 'Crush Gone Wrong',
    emoji: '💔',
    prompt: 'Style: Self-deprecating, cringey, or heartbroken. Focus on being ignored, delusional, or friend-zoned.'
  },
  {
    id: 'exam',
    label: 'Exam Struggle',
    emoji: '📚',
    prompt: 'Style: Academic failure, procrastination, last-minute studying, and the pain of being a student.'
  },
  {
    id: 'corporate',
    label: 'Corporate Slave',
    emoji: '💼',
    prompt: 'Style: Cynical 9-to-5 humor, annoying bosses, endless meetings, and fake corporate enthusiasm.'
  },
  {
    id: 'bollywood',
    label: 'Bollywood Drama',
    emoji: '🎬',
    prompt: 'Style: Overly dramatic, soap-opera reactions. Think plot twists, shocked relatives, and extreme close-ups.'
  },
  {
    id: 'pain',
    label: 'Life is Pain',
    emoji: '😭',
    prompt: 'Style: Dark humor, existential dread, and "why is this happening to me" energy.'
  },
  {
    id: 'wholesome',
    label: 'Wholesome',
    emoji: '🥰',
    prompt: 'Style: Cute, uplifting, supportive, and positive vibes. Focus on friendship and good days.'
  },
];

export const SUPPORTED_LANGUAGES = [
  { id: 'english', label: 'English 🇺🇸', prompt: 'English' },
  { id: 'hinglish', label: 'Hinglish 🇮🇳', prompt: 'Hinglish (Hindi mixed with English in Latin script). Use viral Indian Gen-Z slang like "Bhai", "Scene", "Mast", "Kata", "Gajab", etc. Be relatable to Desi internet culture.' },
  { id: 'hindi', label: 'Hindi 🇮🇳', prompt: 'Hindi (Devanagari script). Use colloquial, funny, and relatable Hindi.' },
  { id: 'spanish', label: 'Spanish 🇪🇸', prompt: 'Spanish. Use colloquial and relatable humor.' },
  { id: 'french', label: 'French 🇫🇷', prompt: 'French. Use casual, witty, and culturally relevant French internet humor.' },
  { id: 'german', label: 'German 🇩🇪', prompt: 'German. Use funny, relatable German internet humor.' },
  { id: 'portuguese', label: 'Portuguese 🇧🇷', prompt: 'Portuguese. Use Brazilian internet slang and humor.' },
  { id: 'italian', label: 'Italian 🇮🇹', prompt: 'Italian. Use expressive and funny Italian humor.' },
  { id: 'japanese', label: 'Japanese 🇯🇵', prompt: 'Japanese. Use natural casual speech and internet slang (net slang).' },
  { id: 'korean', label: 'Korean 🇰🇷', prompt: 'Korean. Use casual speech (Banmal) and popular internet slang.' },
  { id: 'chinese', label: 'Chinese 🇨🇳', prompt: 'Simplified Chinese. Use popular internet slang.' },
  { id: 'russian', label: 'Russian 🇷🇺', prompt: 'Russian. Use culturally relevant and funny memes.' },
  { id: 'arabic', label: 'Arabic 🇸🇦', prompt: 'Arabic. Use funny and relatable humor suitable for Arab internet culture.' },
];

export const PLACEHOLDER_IMG = "https://picsum.photos/800/600";

export interface MemeTemplateImage {
  id: string;
  name: string;
  url: string;
}

export const POPULAR_TEMPLATES: MemeTemplateImage[] = [
  {
    id: 'drake',
    name: 'Drake Hotline Bling',
    url: 'https://i.imgflip.com/30b1gx.jpg',
  },
  {
    id: 'distracted',
    name: 'Distracted Boyfriend',
    url: 'https://i.imgflip.com/1ur9b0.jpg',
  },
  {
    id: 'buttons',
    name: 'Two Buttons',
    url: 'https://i.imgflip.com/1g8my4.jpg',
  },
  {
    id: 'change-mind',
    name: 'Change My Mind',
    url: 'https://i.imgflip.com/24y43o.jpg',
  },
  {
    id: 'oprah',
    name: 'Oprah You Get A',
    url: 'https://i.imgflip.com/gtj5t.jpg',
  },
  {
    id: 'fine',
    name: 'This Is Fine',
    url: 'https://i.imgflip.com/wxica.jpg',
  },
  {
    id: 'cat-woman',
    name: 'Woman Yelling At Cat',
    url: 'https://i.imgflip.com/26am.jpg',
  },
  {
    id: 'success',
    name: 'Success Kid',
    url: 'https://i.imgflip.com/1bhk.jpg',
  },
  {
    id: 'evil-kermit',
    name: 'Evil Kermit',
    url: 'https://i.imgflip.com/1e7ql7.jpg',
  },
  {
    id: 'futurama-fry',
    name: 'Futurama Fry',
    url: 'https://i.imgflip.com/1bgw.jpg',
  },
  {
    id: 'doge',
    name: 'Doge',
    url: 'https://i.imgflip.com/4t0m5.jpg',
  },
  {
    id: 'disaster-girl',
    name: 'Disaster Girl',
    url: 'https://i.imgflip.com/23ls.jpg',
  },
  {
    id: 'grumpy-cat',
    name: 'Grumpy Cat',
    url: 'https://i.imgflip.com/8p0a.jpg',
  },
  {
    id: 'roll-safe',
    name: 'Roll Safe Think About It',
    url: 'https://i.imgflip.com/1h7in3.jpg',
  },
  {
    id: 'mocking-spongebob',
    name: 'Mocking Spongebob',
    url: 'https://i.imgflip.com/1otk96.jpg',
  },
  {
    id: 'batman-slapping',
    name: 'Batman Slapping Robin',
    url: 'https://i.imgflip.com/9ehk.jpg',
  },
  {
    id: 'pikachu',
    name: 'Surprised Pikachu',
    url: 'https://i.imgflip.com/2kbn1e.jpg',
  },
  {
    id: 'harold',
    name: 'Hide the Pain Harold',
    url: 'https://i.imgflip.com/gk5el.jpg',
  },
  {
    id: 'pigeon',
    name: 'Is This A Pigeon',
    url: 'https://i.imgflip.com/1jwhww.jpg',
  },
  {
    id: 'leo-django',
    name: 'Leonardo Django Laugh',
    url: 'https://i.imgflip.com/46hhvr.jpg',
  },
  {
    id: 'bernie',
    name: 'Bernie Sanders Mittens',
    url: 'https://i.imgflip.com/4u7ax6.jpg',
  },
  {
    id: 'uno-draw',
    name: 'Uno Draw 25 Cards',
    url: 'https://i.imgflip.com/3lmzyx.jpg',
  },
  {
    id: 'clown-makeup',
    name: 'Clown Makeup',
    url: 'https://i.imgflip.com/38el31.jpg',
  },
  {
    id: 'buff-doge',
    name: 'Buff Doge vs Cheems',
    url: 'https://i.imgflip.com/43a45p.jpg',
  },
  {
    id: 'sad-pablo',
    name: 'Sad Pablo Escobar',
    url: 'https://i.imgflip.com/1c1uej.jpg',
  },
  {
    id: 'one-does-not-simply',
    name: 'One Does Not Simply',
    url: 'https://i.imgflip.com/1bij.jpg',
  },
  {
    id: 'ancient-aliens',
    name: 'Ancient Aliens',
    url: 'https://i.imgflip.com/18k14.jpg',
  },
  {
    id: 'philosoraptor',
    name: 'Philosoraptor',
    url: 'https://i.imgflip.com/1bgs.jpg',
  },
  {
    id: 'bad-luck-brian',
    name: 'Bad Luck Brian',
    url: 'https://i.imgflip.com/1bip.jpg',
  },
  {
    id: 'monkey-puppet',
    name: 'Monkey Puppet',
    url: 'https://i.imgflip.com/326kwi.jpg',
  },
  {
    id: 'panik-kalm',
    name: 'Panik Kalm Panik',
    url: 'https://i.imgflip.com/3qqcim.jpg',
  },
  {
    id: 'trade-offer',
    name: 'Trade Offer',
    url: 'https://i.imgflip.com/54hjww.jpg',
  },
  {
    id: 'always-has-been',
    name: 'Always Has Been',
    url: 'https://i.imgflip.com/46e43q.jpg',
  },
  {
    id: 'anakin-padme',
    name: 'Anakin Padme',
    url: 'https://i.imgflip.com/5c7lwq.jpg',
  },
  {
    id: 'think-mark',
    name: 'Think Mark Think',
    url: 'https://i.imgflip.com/59qo1q.jpg',
  },
  {
    id: 'running-balloon',
    name: 'Running Away Balloon',
    url: 'https://i.imgflip.com/261o3j.jpg',
  },
  {
    id: 'exit-ramp',
    name: 'Left Exit 12 Off Ramp',
    url: 'https://i.imgflip.com/22bdq6.jpg',
  },
];

export const DAILY_PACKS = [
  {
    id: 'npc',
    title: 'NPC Week',
    desc: 'Oblivion dialogue vibes',
    emoji: '🤖',
    color: 'bg-blue-100',
    templates: ['drake', 'distracted', 'buttons']
  },
  {
    id: 'gym',
    title: 'Gym Bro Pack',
    desc: 'Do you even lift?',
    emoji: '💪',
    color: 'bg-gray-200',
    templates: ['buff-doge', 'chad', 'success']
  },
  {
    id: 'anime',
    title: 'Anime Roast',
    desc: 'Main character energy',
    emoji: '✨',
    color: 'bg-pink-100',
    templates: ['pikachu', 'pigeon', 'anime']
  },
  {
    id: 'corp',
    title: 'Corporate Life',
    desc: 'Per my last email',
    emoji: '💼',
    color: 'bg-indigo-100',
    templates: ['office', 'harold', 'fine']
  },
];