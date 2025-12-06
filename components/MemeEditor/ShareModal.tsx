import React, { useState } from 'react';
import { 
  InstagramIcon, FacebookIcon, TwitterIcon, WhatsappIcon, 
  DownloadIcon, CopyIcon, ShareIcon 
} from '../Icons';

interface ShareModalProps {
  imageDataUrl: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ imageDataUrl, onClose }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  // Handle Native Share (Mobile - Instagram/Whatsapp etc)
  const handleNativeShare = async () => {
    try {
      const blob = await (await fetch(imageDataUrl)).blob();
      const file = new File([blob], 'meme-your-pic.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Meme Your Pic',
          text: 'Check out this meme I made! 😂',
          files: [file],
        });
      } else {
        alert("Sharing not supported on this device/browser. Use Download instead!");
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `meme-${Date.now()}.png`;
    link.href = imageDataUrl;
    link.click();
  };

  const handleCopy = async () => {
    try {
      const blob = await (await fetch(imageDataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      alert("Failed to copy image to clipboard.");
    }
  };

  const handleTwitterShare = () => {
    // Twitter only supports text + URL sharing via web intent, not direct image upload.
    // We prompt the user to download first or just share text.
    // For a better UX, we'll open a tweet intent and ask them to paste the image if they copied it.
    const text = "Made with Meme Your Pic 🤣";
    const url = "https://memeyourpic.com"; // Replace with actual URL
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up transform transition-all">
        
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">Share</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">✕</button>
        </div>

        {/* Meme Preview */}
        <div className="bg-gray-50 p-6 flex justify-center items-center">
           <div className="relative shadow-xl rounded-lg overflow-hidden border-4 border-white transform hover:scale-[1.02] transition-transform duration-300">
              <img src={imageDataUrl} alt="Generated Meme" className="max-h-[40vh] object-contain" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                 <p className="text-[10px] text-white/80 text-center font-medium">Made with Meme Your Pic</p>
              </div>
           </div>
        </div>

        {/* Share Options Grid */}
        <div className="p-6">
          <p className="text-xs font-bold text-gray-400 uppercase mb-4 text-center">Share Directly To</p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-6">
             {/* Native / System Share (Best for Instagram/FB on Mobile) */}
             <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 group min-w-[70px]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500 text-white flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                   <InstagramIcon className="w-7 h-7" />
                </div>
                <span className="text-xs font-medium text-gray-600">Stories</span>
             </button>

             <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 group min-w-[70px]">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                   <FacebookIcon className="w-7 h-7" />
                </div>
                <span className="text-xs font-medium text-gray-600">Facebook</span>
             </button>

             <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 group min-w-[70px]">
                <div className="w-14 h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                   <WhatsappIcon className="w-7 h-7" />
                </div>
                <span className="text-xs font-medium text-gray-600">WhatsApp</span>
             </button>

             <button onClick={handleTwitterShare} className="flex flex-col items-center gap-2 group min-w-[70px]">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                   <TwitterIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-600">X / Twitter</span>
             </button>
             
             <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 group min-w-[70px]">
                <div className="w-14 h-14 rounded-2xl bg-gray-600 text-white flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                   <ShareIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-600">More</span>
             </button>
          </div>

          <div className="border-t border-gray-100 pt-4 flex gap-3">
             <button 
               onClick={handleCopy}
               className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
             >
                <CopyIcon className="w-4 h-4" />
                {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
             </button>
             <button 
               onClick={handleDownload}
               className="flex-1 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
             >
                <DownloadIcon className="w-4 h-4" />
                Save Image
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;