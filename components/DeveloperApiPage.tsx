
import React, { useState } from 'react';
import { KeyIcon, CopyIcon, CheckIcon } from './Icons';

const DeveloperApiPage: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateKey = () => {
    // Mock key generation
    const mockKey = 'myp_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(mockKey);
  };

  const copyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-gray-800 rounded-2xl mb-6 border border-gray-700">
            <KeyIcon className="w-12 h-12 text-brand-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Meme Your Pic <span className="text-brand-500">API</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto">
            Integrate our viral meme generation engine into your own apps.
            Roast your users programmatically.
          </p>
        </div>

        {/* Key Generation Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 mb-12 shadow-2xl">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Your API Key</h2>

          {apiKey ? (
            <div className="bg-black rounded-xl p-4 flex items-center justify-between border border-gray-700">
              <code className="font-mono text-brand-400 text-lg">{apiKey}</code>
              <button
                onClick={copyKey}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                {copied ? <CheckIcon className="w-6 h-6 text-green-500" /> : <CopyIcon className="w-6 h-6" />}
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-6">You haven't generated an API key yet.</p>
              <button
                onClick={generateKey}
                className="px-8 py-4 bg-brand-500 text-black rounded-xl font-black uppercase tracking-widest hover:bg-brand-400 transition-all shadow-hard-sm hover:shadow-hard hover:-translate-y-1"
              >
                Generate New Key
              </button>
            </div>
          )}

          {apiKey && (
            <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-xl">
              <p className="text-yellow-500 text-sm font-bold">
                ⚠️ Keep this key secret. Do not share it or commit it to public repositories.
              </p>
            </div>
          )}
        </div>

        {/* Documentation Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4">Endpoints</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-300">
                <span className="px-2 py-1 bg-green-900 text-green-400 rounded text-xs font-mono font-bold">POST</span>
                <code className="text-sm">/v1/generate/roast</code>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="px-2 py-1 bg-green-900 text-green-400 rounded text-xs font-mono font-bold">POST</span>
                <code className="text-sm">/v1/generate/meme</code>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="px-2 py-1 bg-blue-900 text-blue-400 rounded text-xs font-mono font-bold">GET</span>
                <code className="text-sm">/v1/templates</code>
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4">Usage & Limits</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Monthly Requests</span>
                  <span className="font-bold">0 / 1,000</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full w-[0%]"></div>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Free tier includes 1,000 requests per month. Upgrade for higher limits.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DeveloperApiPage;
