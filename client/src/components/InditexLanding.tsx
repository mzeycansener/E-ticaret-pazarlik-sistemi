import { ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

const HERO_IMAGE = "/butik.png";

interface LandingProps {
  onStart: () => void;
}

export function InditexLanding({ onStart }: LandingProps) {
  const [showPromo, setShowPromo] = useState(true);

  return (
    
    <div className="fixed inset-0 w-full h-full bg-black text-white font-sans z-[9999] flex flex-col overflow-hidden">
      
      {/* --- 1. PROMO BAR (Üst Şerit) --- */}
      {showPromo && (
        <div className="flex-none bg-black text-white py-3 px-4 relative z-50 border-b border-white/10">
          <div className="container mx-auto text-center flex justify-center items-center">
            <p className="text-[10px] md:text-xs tracking-[0.15em] uppercase font-medium">
              ⭐ <span className="font-bold mx-1">HAN BUTİK</span> — %60'A VARAN SADAKAT İNDİRİMİ
            </p>
          </div>
          <button
            onClick={() => setShowPromo(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 relative w-full h-full">
        
        {/* Arka Plan Resmi */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="Fashion Campaign"
            className="w-full h-full object-cover object-center opacity-90"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.style.backgroundColor = '#1a1a1a';
            }}
          />
          {/* Karartma (Yazılar okunsun diye) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
        </div>

        {/* İçerik (Sol - Orta) */}
        <div className="relative z-10 h-full container mx-auto px-6 md:px-12 flex items-center">
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            
            {/* Marka */}
            <div className="space-y-4">
              <div className="inline-block border border-white/30 bg-white/5 backdrop-blur-md px-3 py-1 rounded-sm mb-2">
                 <span className="text-[10px] uppercase tracking-widest font-bold">2025 Koleksiyonu</span>
              </div>
              <h1 className="text-7xl md:text-9xl font-serif leading-[0.85] tracking-tighter text-white drop-shadow-2xl">
                HAN <br />
                <span className="italic font-light opacity-80 ml-2">BUTİK</span>
              </h1>
            </div>

            {/* Açıklama */}
            <div className="border-l-2 border-white/50 pl-6">
              <p className="text-lg md:text-xl text-gray-200 font-light leading-relaxed max-w-lg">
                Sadakat puanlarını topla, seviyeni yükselt ve sana özel
                <strong className="text-white font-medium block mt-1"> VIP ayrıcalıkların</strong> tadını çıkar.
              </p>
            </div>

            {/* Butonlar */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onStart}
                className="group bg-white text-black px-10 py-4 rounded-full hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(255,255,255,0.2)] cursor-pointer"
              >
                <span className="font-bold tracking-wide text-sm">ALIŞVERİŞE BAŞLA</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>
        
        {/* Scroll İkonu */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce hidden md:block z-20 pointer-events-none">
          <div className="w-5 h-9 border-2 border-white/40 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </div>

      </div>
    </div>
  );
}