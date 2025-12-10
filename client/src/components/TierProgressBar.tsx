import { Crown } from 'lucide-react'

interface TierProgressBarProps {
  totalPoints: number
  currentTier: string
  variant?: 'simple' | 'detailed'
}

export function TierProgressBar({ totalPoints = 0, currentTier }: TierProgressBarProps) {
  
  // Puanı sayıya çevir (Hata önleyici)
  const safePoints = Math.max(0, Number(totalPoints) || 0);

  // İlerleme Mantığı (2K - 6K - 12K Limitleri)
  const getProgressInfo = () => {
    // 1. DEMİR (0 - 1.999 TL)
    if (safePoints < 2000) {
      return {
        current: 'DEMİR',
        next: 'BRONZ',
        target: 2000,
        percent: (safePoints / 2000) * 100,
        remaining: 2000 - safePoints,
        barColor: '#3b82f6', // Mavi
        textColor: 'text-blue-600'
      }
    } 
    // 2. BRONZ (2.000 - 5.999 TL)
    else if (safePoints < 6000) {
      return {
        current: 'BRONZ',
        next: 'GÜMÜŞ',
        target: 6000,
        // (Mevcut - 2000) / 4000 * 100
        percent: ((safePoints - 2000) / 4000) * 100,
        remaining: 6000 - safePoints,
        barColor: '#f97316', // Turuncu
        textColor: 'text-orange-600'
      }
    } 
    // 3. GÜMÜŞ (6.000 - 11.999 TL)
    else if (safePoints < 12000) {
      return {
        current: 'GÜMÜŞ',
        next: 'ALTIN',
        target: 12000,
        // (Mevcut - 6000) / 6000 * 100
        percent: ((safePoints - 6000) / 6000) * 100,
        remaining: 12000 - safePoints,
        barColor: '#64748b', // Gri / Metalik
        textColor: 'text-slate-600'
      }
    } 
    // 4. ALTIN (12.000+)
    else {
      return {
        current: 'ALTIN',
        next: 'MAX',
        target: null,
        percent: 100,
        remaining: 0,
        barColor: '#eab308', 
        textColor: 'text-yellow-600'
      }
    }
  }

  const info = getProgressInfo()
  
  const displayPercent = Math.max(5, Math.min(info.percent, 100));

  return (
    <div className="w-full">
      {/* Üst Bilgi Satırı */}
      <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
        <span className={`uppercase tracking-widest ${info.textColor}`}>
          {info.current} SEVİYE
        </span>
        {info.next !== 'MAX' ? (
          <span className="text-slate-500 font-medium">{Math.max(0, info.remaining).toLocaleString('tr-TR')} TL kaldı</span>
        ) : (
          <span className="text-yellow-600 font-bold flex items-center gap-1">
            <Crown className="w-3 h-3 fill-yellow-500"/> ZİRVE
          </span>
        )}
      </div>
      
      {/* --- PROGRESS BAR */}
      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden border border-gray-300 relative shadow-inner">
        
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 relative"
          style={{ 
            width: `${displayPercent}%`,
            backgroundColor: info.barColor, // Rengi buradan zorluyoruz
          }} 
        >
          {/* İçindeki Parlama Efekti */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-t-full pointer-events-none"></div>
        </div>
      </div>
      
      
      {info.next !== 'MAX' && (
        <div className="text-right mt-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {info.next} HEDEFİ: <span className="text-slate-600 font-mono">{info.target?.toLocaleString('tr-TR')} TL</span>
          </span>
        </div>
      )}
    </div>
  )
}