<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎨 Meme Your Pic

Turn your photos into viral memes instantly with AI-powered captions!

View the app: https://ai.studio/apps/drive/1tpcxVjZqMwhz5Bz2ZbwjF3E4fKBs61Fv

---

## 🔐 Security Notice

**⚠️ IMPORTANT:** Never commit your `.env` file to git! API keys should be kept secret.

If you've accidentally committed API keys:
1. **Immediately revoke** the exposed keys
2. Follow the instructions in [SECURITY_FIX.md](./SECURITY_FIX.md)

---

## 🚀 Run Locally

**Prerequisites:** Node.js 16+

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Then edit `.env` and add your API keys:

```env
# Get your Gemini API key from: https://aistudio.google.com/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Get Firebase config from: https://console.firebase.google.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at http://localhost:3000

---

## 📦 Build for Production

```bash
npm run build
```

**Note:** Built files in `dist/` folder should NOT be committed to git (already in `.gitignore`).

---

## 🌐 Deploy

### Vercel (Recommended)

1. Push your code to GitHub (ensure `.env` is NOT committed)
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables in Netlify dashboard

---

## 🛡️ Security Best Practices

- ✅ `.env` is in `.gitignore`
- ✅ Never commit API keys
- ✅ Use environment variables on deployment platforms
- ✅ Rotate keys if accidentally exposed
- ✅ Enable Firebase App Check for production

---

## 📝 License

MIT
