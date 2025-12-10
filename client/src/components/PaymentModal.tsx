import { useState } from 'react'
import { X, CreditCard, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { processPayment } from '../utils/api'

interface PaymentModalProps {
  totalAmount: number
  onSuccess: () => void
  onClose: () => void
}

export function PaymentModal({ totalAmount, onSuccess, onClose }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cardData, setCardData] = useState({
    holder: '',
    number: '',
    expiry: '',
    cvv: ''
  })

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    
    const result = await processPayment({
      ...cardData,
      amount: totalAmount
    })

    if (result.success) {
      setTimeout(() => {
        setLoading(false)
        onSuccess() // Başarılı tetikleyicisi
      }, 1500)
    } else {
      setLoading(false)
      setError(result.error || "Ödeme başarısız.")
    }
  }

  const handleNumChange = (e: any) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    setCardData({ ...cardData, number: val });
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg"><Lock className="w-5 h-5" /></div>
            <div><h3 className="font-bold text-lg">Güvenli Ödeme</h3><p className="text-xs text-slate-400">256-bit SSL Korumalı</p></div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-8">
          <div className="mb-8 text-center">
            <p className="text-sm text-slate-500 uppercase tracking-widest mb-1">Ödenecek Tutar</p>
            <p className="text-4xl font-serif font-bold text-slate-900">{totalAmount.toFixed(2)} ₺</p>
          </div>

          <form onSubmit={handlePayment} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Kart Sahibi</label>
              <input required type="text" placeholder="AD SOYAD" className="w-full border p-3 rounded-lg text-sm font-medium outline-none focus:border-black" value={cardData.holder} onChange={e => setCardData({...cardData, holder: e.target.value.toUpperCase()})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Kart Numarası</label>
              <div className="relative">
                <input required type="text" placeholder="0000 0000 0000 0000" className="w-full border p-3 pl-10 rounded-lg text-sm font-medium outline-none focus:border-black" value={cardData.number} onChange={handleNumChange} />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">SKT</label>
                <input required type="text" placeholder="AA/YY" maxLength={5} className="w-full border p-3 rounded-lg text-center text-sm font-medium outline-none focus:border-black" value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})} />
              </div>
              <div className="w-1/2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">CVV</label>
                <input required type="text" placeholder="123" maxLength={3} className="w-full border p-3 rounded-lg text-center text-sm font-medium outline-none focus:border-black" value={cardData.cvv} onChange={e => setCardData({...cardData, cvv: e.target.value})} />
              </div>
            </div>

            {error && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg"><AlertCircle className="w-4 h-4" /> {error}</div>}

            <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> İşleniyor...</> : <><CheckCircle className="w-5 h-5" /> Ödemeyi Tamamla</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}