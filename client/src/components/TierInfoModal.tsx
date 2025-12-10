import { X, ChevronRight, Shield, Crown, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'

const MODAL_IMAGE = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop";

interface TierInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TierInfoModal({ isOpen, onClose }: TierInfoModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleClose = () => {
    if (dontShowAgain) localStorage.setItem('hideWelcomeModal', 'true')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-4xl h-auto md:h-[550px] rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden relative animate-in slide-in-from-bottom-8 duration-700">
        
        <button onClick={handleClose} className="absolute top-6 right-6 p-2 bg-white/80 hover:bg-white rounded-full transition-all z-30 shadow-sm cursor-pointer"><X className="w-5 h-5" /></button>

        {/* SOL TARAF: GÖRSEL */}
        <div className="hidden md:block md:w-5/12 relative overflow-hidden bg-gray-200">
          <img 
            src={MODAL_IMAGE} 
            className="w-full h-full object-cover opacity-95 hover:scale-105 transition-transform duration-1000" 
            alt="Ayrıcalıklar Dünyası"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          <div className="absolute bottom-10 left-8 text-white z-10">
            <div className="w-10 h-1 bg-white/80 mb-4 rounded-full"></div>
            <p className="text-xs tracking-[0.3em] uppercase font-medium mb-1 opacity-90">Han Butik</p>
            <p className="text-2xl font-serif italic leading-tight">Ayrıcalıklar<br/>Dünyası</p>
          </div>
        </div>

        {/* SAĞ TARAF: BİLGİLER */}
        <div className="w-full md:w-7/12 p-10 bg-white flex flex-col justify-center relative">
          <div className="mb-6 relative z-10">
            <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-500 uppercase bg-indigo-50 px-3 py-1 rounded-full">Sadakat Programı</span>
            <h2 className="text-3xl font-serif text-slate-800 mt-4 tracking-tight">Seviyeni Yükselt,<br/><span className="italic text-slate-400 font-light">Farkı Hisset.</span></h2>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2 relative z-10 custom-scrollbar">
            
            {/* STANDART */}
            <div className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg"><Shield className="w-5 h-5 text-slate-500"/></div>
                <div><p className="text-sm font-bold text-slate-700 uppercase">Standart</p><p className="text-[10px] text-slate-400 font-medium">0 - 1.999 TL</p></div>
              </div>
              <div className="text-right"><span className="text-xs font-medium text-slate-500">Başlangıç</span></div>
            </div>

            {/* BRONZ (2K+) */}
            <div className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-lg">🥉</div>
                <div><p className="text-sm font-bold text-slate-800 uppercase">Bronz</p><p className="text-[10px] text-slate-500 font-medium">2.000 - 5.999 TL</p></div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded flex items-center gap-1"><Truck className="w-3 h-3"/> Ücretsiz Kargo</span>
              </div>
            </div>

            {/* GÜMÜŞ (6K+) */}
            <div className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-lg">🥈</div>
                <div><p className="text-sm font-bold text-slate-800 uppercase">Gümüş</p><p className="text-[10px] text-slate-500 font-medium">6.000 - 11.999 TL</p></div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                 <span className="text-[10px] text-slate-500">+ Ücretsiz Kargo</span>
                 <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">%10 İndirim</span>
              </div>
            </div>

            
            <div className="group flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center text-lg shadow-sm"><Crown className="w-5 h-5" /></div>
                <div>
                    
                    <p className="text-sm font-bold text-amber-400 uppercase tracking-wide">Altın VIP</p>
                    <p className="text-[10px] text-slate-300 font-medium">12.000 TL +</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-[10px] text-slate-300">+ Ücretsiz Kargo</span>
                {/* Etiket de sarı yapıldı */}
                <span className="text-xs font-bold text-black bg-amber-400 px-2 py-0.5 rounded">%15 İndirim + Pazarlık</span>
              </div>
            </div>

          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
            <label className="flex items-center gap-2 cursor-pointer group select-none">
               <div className="w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center transition-colors group-hover:border-black">{dontShowAgain && <div className="w-2 h-2 bg-slate-600 rounded-[1px]" />}</div>
               <input type="checkbox" className="hidden" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} />
               <span className="text-xs text-slate-400 font-medium group-hover:text-slate-600 transition-colors">Bir daha gösterme</span>
            </label>
            <button onClick={handleClose} className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-900 hover:text-slate-600 transition-opacity">
              Alışverişe Başla <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function useWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    const hasSeen = localStorage.getItem('hideWelcomeModal')
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])
  return { isOpen, onClose: () => setIsOpen(false) }
}