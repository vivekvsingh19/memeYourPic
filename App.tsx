

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
import { UserService } from './services/userService';
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);
  const [captions, setCaptions] = useState<GeneratedCaption[]>([]);
  const [isWatermarked, setIsWatermarked] = useState<boolean>(true);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || ''
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);


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
    const loadCredits = async () => {
      if (user) {
        try {
          // Sync with Firestore
          const remoteCredits = await UserService.syncUser(user);
          setCredits(remoteCredits);
        } catch (error) {
          console.error("Failed to sync credits:", error);
        }
      } else {
        // Guest Logic
        const storageKey = 'meme_credits_guest_v4';
        const saved = localStorage.getItem(storageKey);
        if (saved !== null) {
          setCredits(parseInt(saved, 10));
        } else {
          // New guest: 40 free credits
          const initialCredits = 40;
          localStorage.setItem(storageKey, initialCredits.toString());
          setCredits(initialCredits);
        }
      }
    };
    loadCredits();
  }, [user]);

  // Update storage for GUESTS ONLY whenever credits change
  useEffect(() => {
    if (!user) {
      const storageKey = 'meme_credits_guest_v4';
      localStorage.setItem(storageKey, credits.toString());
    }
  }, [credits, user]);

  // ... (Watermark stuff) ...

  // Handle Payment Return
  const paymentProcessed = React.useRef(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      // Prevent double processing in Strict Mode
      if (paymentProcessed.current) return;

      const params = new URLSearchParams(window.location.search);
      const isSuccess = params.get('payment_success') === 'true';

      // Check for pending payment
      const pendingPayment = localStorage.getItem('pending_payment');

      if (isSuccess) {
        paymentProcessed.current = true;

        let pack = params.get('pack');
        if (!pack && pendingPayment) {
          pack = pendingPayment;
        }

        let addedCredits = 0;
        if (pack === 'starter') addedCredits = 100;
        if (pack === 'pro') addedCredits = 500;
        if (pack === 'agency') addedCredits = 1500;

        if (addedCredits > 0) {
          if (user) {
            // Update Firestore
            try {
              const newBalance = await UserService.addCredits(user.uid, addedCredits);
              setCredits(newBalance);
            } catch (error) {
              console.error("Failed to add credits to DB:", error);
              // Fallback to local state so user isn't mad immediately,
              // but we should probably log this error remotely
              setCredits(prev => prev + addedCredits);
            }
          } else {
            // Update Local (Guest)
            setCredits(prev => prev + addedCredits);
          }

          setSuccessMessage(`Payment Successful! ${addedCredits} credits added to your account. 🚀`);
          localStorage.removeItem('pending_payment');
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    };

    processPayment();
  }, [user]);

  // Event Handlers
  const handleFileSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setSelectedTemplate(null);
  };

  const handleTemplateSelect = (template: MemeTemplateImage) => {
    setSelectedTemplate(template);
    setImagePreview(template.url);
    // Fetch the image and convert to File
    fetch(template.url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'template.jpg', { type: 'image/jpeg' });
        setImageFile(file);
      });
  };

  const handlePricingClick = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setView('HOME');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setView('HOME');
    setCaptions([]);
  };

  const handleBuyCredits = async (amount: number, cost: string) => {
    const packId = amount === 100 ? 'starter' : amount === 500 ? 'pro' : 'agency';
    const link = getDodoPaymentLink(packId, currency);

    // Save pending payment for guest recovery
    localStorage.setItem('pending_payment', packId);

    window.location.href = link;
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
      // Deduct credits FIRST (or optimistically)
      if (user) {
        await UserService.deductCredits(user.uid, 10);
        // If deduction succeeds, update local
        setCredits(prev => Math.max(0, prev - 10));
      } else {
        setCredits(prev => Math.max(0, prev - 10));
      }

      // Generate
      const generatedCaptions = await generateMemeCaptions(imageFile, roastMode, language);

      setCaptions(generatedCaptions);
      setIsWatermarked(true);
      setView('RESULT');
    } catch (err: any) {
      console.error(err);
      // If error was insufficient funds from DB, it will be caught here
      if (err.message && err.message.includes("Insufficient credits")) {
        setError("Not enough credits! Please buy more.");
      } else {
        setError("AI brain freeze. Try again or check your API key.");
        // Ideally refund credits here if generation failed but deduction worked?
        // For simplicity, we assume generation is stable or we accept small loss risk for user.
        // To be robust: deduct AFTER generation success, but that risks abuse.
        // Better: Refund on catch.
        if (user) {
          await UserService.addCredits(user.uid, 10);
          setCredits(prev => prev + 10);
        } else {
          setCredits(prev => prev + 10);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };



  const handleSpendCredits = async (amount: number) => {
    try {
      if (user) {
        await UserService.deductCredits(user.uid, amount);
        setCredits(prev => Math.max(0, prev - amount));
      } else {
        setCredits(prev => Math.max(0, prev - amount));
      }
    } catch (error: any) {
      console.error("Spend credits failed:", error);
      if (error.message.includes("Insufficient")) {
        alert("Not enough credits!");
      }
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
        <FriendBattle
          credits={credits}
          onSpendCredits={handleSpendCredits}
          onBuyCredits={() => handlePricingClick()}
        />
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

        {/* Payment Success Modal */}
        {successMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-black text-center relative overflow-hidden">
              {/* Confetti Background (CSS only for simplicity) */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

              <div className="text-6xl mb-4 animate-bounce">
                🎉
              </div>
              <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter text-brand-600">You're Rich!</h3>
              <p className="text-xl font-bold text-gray-800 mb-6">
                {successMessage}
              </p>
              <button
                onClick={() => setSuccessMessage(null)}
                className="w-full bg-black text-white py-4 rounded-xl border-2 border-black shadow-hard hover:bg-gray-800 font-black uppercase tracking-widest hover:-translate-y-1 transition-all"
              >
                Let's Cook 👨‍🍳
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
