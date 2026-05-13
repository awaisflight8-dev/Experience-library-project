import React, { useState, useRef, useEffect } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';

interface Props {
  storyId: string;
  title: string;
}

export default function ShareButton({ storyId, title }: Props) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const url = `${window.location.origin}/story/${storyId}`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this experience: ${title}`,
          url
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Error sharing via native API:", err);
        }
      }
    } else {
      setShowOptions(!showOptions);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowOptions(false);
    }, 2000);
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this experience: ${title} ${url}`)}`, '_blank');
    setShowOptions(false);
  };

  return (
    <div className="relative flex-1" ref={menuRef}>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNativeShare(); }}
        className="w-full flex items-center justify-center gap-2 hover:bg-[#F0F2F5] py-1.5 rounded-md cursor-pointer transition-colors text-[#65676B] font-semibold text-[15px]"
      >
        <Share2 className="w-5 h-5" /> Share
      </button>

      {showOptions && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10 py-1">
          <button 
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-[15px] font-semibold text-gray-700 transition-colors text-left"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4 text-gray-500" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button 
            onClick={handleWhatsAppShare}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-[15px] font-semibold text-gray-700 transition-colors text-left border-t border-gray-100"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#25D366]">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.47-1.761-1.643-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
