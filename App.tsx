

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import MemeEditor from './components/MemeEditor/MemeEditor';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import FriendBattle from './components/FriendBattle';
import UserDashboard from './components/UserDashboard';
import DeveloperApiPage from './components/DeveloperApiPage';
import { generateMemeCaptions } from './services/geminiService';
import { getDodoPaymentLink } from './services/paymentService'; // Import Service
import { GeneratedCaption, ViewState, User } from './types';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { authService } from './services/authService';
import { MemeTemplateImage } from './constants';
import { InstagramIcon } from './components/Icons';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

function App() {
  // State
  const [view, setView] = useState<ViewState | 'BATTLE' | 'DASHBOARD' | 'API'>('HOME');
  const [user, setUser] = useState<User | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplateImage | null>(null);
  const [roastMode, setRoastMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('english');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  // Detect Location for Pricing
  useEffect(() => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log("Detected Timezone:", timeZone); // Debug logging
      if (timeZone === 'Asia/Kolkata' || timeZone === 'Asia/Calcutta' || timeZone.includes('India')) {
        setCurrency('INR');
      }
    } catch (e) {
      console.log('Could not detect timezone');
    }
  }, []);

  // Credit System
  const [credits, setCredits] = useState<number>(0);

  // Load credits when user changes
  useEffect(() => {
    const storageKey = user ? `meme_credits_v2_${user.uid}` : 'meme_credits_guest_v2';
    const saved = localStorage.getItem(storageKey);

    if (saved !== null) {
      setCredits(parseInt(saved, 10));
    } else {
      // New user or guest without history gets 20 free credits (2 generations)
      const initialCredits = 20;
      localStorage.setItem(storageKey, initialCredits.toString());
      setCredits(initialCredits);
    }
  }, [user]);

  // Update storage whenever credits change
  useEffect(() => {
    const storageKey = user ? `meme_credits_v2_${user.uid}` : 'meme_credits_guest_v2';
    localStorage.setItem(storageKey, credits.toString());
  }, [credits, user]);

  // Watermark State
  const [isWatermarked, setIsWatermarked] = useState<boolean>(false);

  // Data State
  const [captions, setCaptions] = useState<GeneratedCaption[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL
        });
        // Redirect to home if on auth pages
        if (view === 'LOGIN' || view === 'SIGNUP' || view === 'FORGOT_PASSWORD') {
          setView('HOME');
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [view]);

  // Handlers
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP)');
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(url);
    setError(null);
  };

  const handleTemplateSelect = (template: MemeTemplateImage) => {
    setImageFile(null); // Clear file as we are using a URL
    setImagePreview(template.url);
    setSelectedTemplate(template); // Store the template
    setError(null);
    setCaptions([]); // Clear captions for new template
    setIsWatermarked(false); // No watermark for templates
    setView('RESULT'); // Go straight to editor
  };

  const handleMemeSelect = (imageUrl: string) => {
    setImageFile(null); // Clear file as we are using a URL
    setImagePreview(imageUrl);
    setSelectedTemplate(null);
    setError(null);
    setCaptions([]); // Clear captions
    setIsWatermarked(false); // No watermark
    setView('RESULT'); // Go straight to editor
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handlePricingClick = () => {
    if (view !== 'HOME') {
      setView('HOME');
      setTimeout(() => {
        const el = document.getElementById('pricing');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('pricing');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Payment Return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      const pack = params.get('pack');
      let addedCredits = 0;

      if (pack === 'starter') addedCredits = 10;
      if (pack === 'pro') addedCredits = 50;
      if (pack === 'agency') addedCredits = 150;

      if (addedCredits > 0) {
        setCredits(prev => prev + addedCredits);
        alert(`Payment Successful! ${addedCredits} credits added to your account.`);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const handleBuyCredits = (amount: number, cost: string) => {
    if (!user) {
      if (confirm("You need to be signed in to purchase credits. Sign up now?")) {
        setView('SIGNUP');
      }
      return;
    }

    // Determine Pack ID based on amount
    let packId = 'starter';
    if (amount === 500) packId = 'pro';
    if (amount === 1500) packId = 'agency';

    const paymentLink = getDodoPaymentLink(packId, currency);

    if (!paymentLink || paymentLink === '#') {
      alert(`Payment links for ${currency} not configured. Please check .env variables.`);
      return;
    }

    // Redirect to Dodo Payment
    window.location.href = paymentLink;
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      setError("Upload an image first, bestie!");
      return;
    }

    if (credits < 10) {
      setError("You've used your free AI generations! Upgrade for more.");
      handlePricingClick();
      return;
    }

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setApiKeyModalOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Auto-detect style based on image content (handled by service prompt)
      // Now passing selected language to service
      const generatedCaptions = await generateMemeCaptions(imageFile, roastMode, language);

      // Deduct credit only on success
      const newCredits = credits - 10;
      setCredits(newCredits);

      setCaptions(generatedCaptions);
      setIsWatermarked(true); // Add watermark for AI generation (Free user assumption)
      setView('RESULT');
    } catch (err: any) {
      console.error(err);
      setError("AI brain freeze. Try again or check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setView('HOME');
    setCaptions([]);
    setError(null);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setView('HOME');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Render logic

  // If in RESULT view, render the full screen Editor
  if (view === 'RESULT' && imagePreview) {
    return (
      <MemeEditor
        imageSrc={imagePreview}
        initialCaptions={captions}
        onBack={handleReset}
        onUpdateImage={setImagePreview}
        includeWatermark={isWatermarked}
      />
    );
  }

  if (view === 'BATTLE') {
    return (
      <>
        <Navbar
          user={user}
          onLoginClick={() => setView('LOGIN')}
          onSignupClick={() => setView('SIGNUP')}
          onLogoClick={() => setView('HOME')}
          onPricingClick={handlePricingClick}
          onLogoutClick={handleLogout}
          onBattleClick={() => setView('BATTLE')}
          onDashboardClick={() => setView('DASHBOARD')}
        />
        <FriendBattle />
      </>
    );
  }



  if (view === 'DASHBOARD') {
    return (
      <>
        <Navbar
          user={user}
          onLoginClick={() => setView('LOGIN')}
          onSignupClick={() => setView('SIGNUP')}
          onLogoClick={() => setView('HOME')}
          onPricingClick={handlePricingClick}
          onLogoutClick={handleLogout}
          onBattleClick={() => setView('BATTLE')}
          onExploreClick={() => setView('EXPLORE')}
          onDashboardClick={() => setView('DASHBOARD')}
        />
        <UserDashboard
          user={user || { uid: 'guest', email: 'guest@example.com' }}
          credits={credits}
          onApiClick={() => setView('API')}
          onBuyCredits={handleBuyCredits}
        />
      </>
    );
  }

  if (view === 'API') {
    return (
      <>
        <Navbar
          user={user}
          onLoginClick={() => setView('LOGIN')}
          onSignupClick={() => setView('SIGNUP')}
          onLogoClick={() => setView('HOME')}
          onPricingClick={handlePricingClick}
          onLogoutClick={handleLogout}
          onBattleClick={() => setView('BATTLE')}
          onExploreClick={() => setView('EXPLORE')}
          onDashboardClick={() => setView('DASHBOARD')}
        />
        <DeveloperApiPage />
      </>
    );
  }

  // Auth Views
  if (view === 'LOGIN') {
    return (
      <LoginPage
        onSwitchToSignup={() => setView('SIGNUP')}
        onBack={() => setView('HOME')}
        onForgotPassword={() => setView('FORGOT_PASSWORD')}
      />
    );
  }

  if (view === 'SIGNUP') {
    return (
      <SignupPage
        onSwitchToLogin={() => setView('LOGIN')}
        onBack={() => setView('HOME')}
      />
    );
  }

  if (view === 'FORGOT_PASSWORD') {
    return (
      <ForgotPasswordPage
        onSwitchToLogin={() => setView('LOGIN')}
        onBack={() => setView('HOME')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <SpeedInsights />
      <Analytics />
      <Navbar
        user={user}
        onLoginClick={() => setView('LOGIN')}
        onSignupClick={() => setView('SIGNUP')}
        onLogoClick={() => setView('HOME')}
        onPricingClick={handlePricingClick}
        onLogoutClick={handleLogout}
        onBattleClick={() => setView('BATTLE')}
        onDashboardClick={() => setView('DASHBOARD')}
      />

      <main className="flex-grow flex flex-col items-center w-full">

        {/* Error Banner */}
        {error && (
          <div className="fixed top-24 z-50 w-full max-w-lg px-4 animate-bounce">
            <div className="w-full p-4 bg-red-500 border-2 border-black text-white rounded-xl shadow-hard font-bold flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} className="text-white hover:text-black">✕</button>
            </div>
          </div>
        )}

        {/* API Key Modal Stub */}
        {apiKeyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-black">
              <h3 className="text-2xl font-black mb-4 uppercase">API Key Missing</h3>
              <p className="text-gray-600 mb-6 font-medium">
                To generate viral memes, we need to access the Gemini API.
                Please ensure the API key is configured.
              </p>
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="w-full bg-brand-500 text-white py-3 rounded-xl border-2 border-black shadow-hard-sm font-black uppercase hover:translate-y-[-2px] transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* ================= HOME PAGE ================= */}
        <HomePage
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
          roastMode={roastMode}
          onToggleRoastMode={() => setRoastMode(!roastMode)}
          onGenerate={handleGenerate}
          imageFile={imageFile}
          imagePreview={imagePreview}
          onClearImage={handleClearImage}
          onTemplateSelect={handleTemplateSelect}
          selectedLanguage={language}
          onLanguageChange={setLanguage}
          onSignupClick={() => setView('SIGNUP')}
          credits={credits}
          onBuyCredits={handleBuyCredits}
          currency={currency}
        />

      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t-2 border-black bg-white mt-auto">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-gray-500">
          <p>© 2025 Meme Your Pic — Instant Memes. Zero Talent Required.</p>

          <div className="flex items-center gap-6">
            <span className="uppercase tracking-widest text-xs hidden md:block">Developer</span>
            <a
              href="https://x.com/vivek_uncovered"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-black transition-colors group"
            >
              {/* X Logo */}
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current group-hover:scale-110 transition-transform">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>@vivek_uncovered</span>
            </a>
            <a
              href="https://www.instagram.com/vivek_uncovered/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-black transition-colors group"
            >
              <InstagramIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>@vivek_uncovered</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
