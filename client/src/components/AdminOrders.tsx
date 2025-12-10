import { useState } from 'react'
import { Check, X, Clock, CheckCircle, XCircle, Handshake, HelpCircle, User, Info } from 'lucide-react'
import { approveOrder, makeCounterOffer } from '../utils/api'

interface AdminOrdersProps {
  orders: any[]
  onRefresh: () => void
}

export function AdminOrders({ orders, onRefresh }: AdminOrdersProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  
  // Modal State
  const [offerModal, setOfferModal] = useState<{ orderId: string; subtotal: number } | null>(null)
  const [offerPrice, setOfferPrice] = useState('')
  const [offerNote, setOfferNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApprove = async (orderId: string, approved: boolean) => {
    if(!confirm(approved ? "Onaylamak istediğine emin misin?" : "Reddetmek istediğine emin misin?")) return;
    
    try {
      await approveOrder(orderId, approved)
      onRefresh()
    } catch (err) {
      alert("İşlem sırasında hata oluştu.")
    }
  }

  const handleMakeOffer = async () => {
    if (!offerModal || !offerPrice) return

    try {
      setIsSubmitting(true);
      
      const originalPrice = offerModal.subtotal;
      const newPrice = Number(offerPrice);
      
      const discountPercent = ((originalPrice - newPrice) / originalPrice) * 100;

      if (discountPercent < 0) {
        alert("Hata: Orijinal fiyattan daha yüksek bir fiyat veremezsiniz!");
        setIsSubmitting(false);
        return;
      }

      const result = await makeCounterOffer(
        offerModal.orderId,
        discountPercent, 
        offerNote
      )
      
      if (result.success) {
        alert("✅ Teklif başarıyla gönderildi!");
        setOfferModal(null)
        setOfferPrice('')
        setOfferNote('')
        onRefresh()
      } else {
        alert("❌ Hata: " + (result.error || "Bilinmeyen hata"));
      }
    } catch (error: any) {
      console.error("Hata:", error);
      alert("Bağlantı hatası.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'fiyat_istegi': return { icon: HelpCircle, text: 'Fiyat İsteği', color: 'text-blue-600', bgColor: 'bg-blue-50' }
      case 'counter_offer': return { icon: Handshake, text: 'Teklif Verildi', color: 'text-orange-600', bgColor: 'bg-orange-50' }
      case 'onaylandi': return { icon: CheckCircle, text: 'Satış Tamamlandı', color: 'text-green-600', bgColor: 'bg-green-50' }
      case 'reddedildi': return { icon: XCircle, text: 'İptal Edildi', color: 'text-red-600', bgColor: 'bg-red-50' }
      default: return { icon: Clock, text: status, color: 'text-gray-600', bgColor: 'bg-gray-50' }
    }
  }

  const filteredOrders = orders.filter(order => {
      if (filter === 'all') return true;
      if (filter === 'pending') return order.status === 'pending_approval' || order.status === 'fiyat_istegi';
      if (filter === 'completed') return order.status === 'onaylandi' || order.status === 'completed';
      return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h2>Sipariş ve Talep Yönetimi</h2>
      </div>
      
      {/* Sekmeler */}
      <div className="flex gap-4 mb-6 border-b">
          <button onClick={() => setFilter('all')} className={`pb-2 px-1 ${filter === 'all' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}>Tümü</button>
          <button onClick={() => setFilter('pending')} className={`pb-2 px-1 ${filter === 'pending' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}>Bekleyenler</button>
          <button onClick={() => setFilter('completed')} className={`pb-2 px-1 ${filter === 'completed' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}>Tamamlananlar</button>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusInfo = getStatusInfo(order.status)
          const StatusIcon = statusInfo.icon
          const showActions = order.status === 'fiyat_istegi';
          const customerName = order.profiles?.name || "İsimsiz Müşteri";

          return (
            <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden p-6 border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium mb-1 flex items-center gap-2">
                    Talep #{order.id.slice(0, 8)}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusInfo.bgColor} ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3" /> {statusInfo.text}
                    </span>
                  </h3>
                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <User className="w-4 h-4" /> {customerName} (Gold Üye)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-indigo-600">{order.subtotal} ₺</div>
                  <div className="text-xs text-gray-500">Liste Fiyatı</div>
                </div>
              </div>

              {showActions && (
                <div className="mt-4 pt-4 border-t bg-blue-50/30 -mx-6 -mb-6 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full shadow-sm text-blue-600 animate-pulse">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-900 font-bold">Özel Fiyat İsteği</p>
                      <p className="text-xs text-blue-700">Müşteri bu ürün için "Bana kaça olur?" diye soruyor.</p>
                    </div>
                  </div>
                  
                  {}
                  <button 
                    onClick={() => setOfferModal({ orderId: order.id, subtotal: order.subtotal })}
                    className="py-2.5 px-6 bg-white border border-slate-300 text-black rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-bold shadow-sm"
                  >
                    <Handshake className="w-4 h-4" /> Teklif Yap
                  </button>
                  
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* --- TEKLİF MODALI --- */}
      {offerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button onClick={() => setOfferModal(null)} className="absolute top-5 right-5 text-gray-400 hover:text-black transition-colors"><X className="w-6 h-6"/></button>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Fiyat Belirle</h3>
              <p className="text-sm text-slate-500">Müşteriye özel son fiyatınızı giriniz.</p>
            </div>
            
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Liste Fiyatı</p>
                  <p className="text-lg font-bold text-slate-400 line-through decoration-red-400">{offerModal.subtotal.toFixed(2)} ₺</p>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 relative overflow-hidden text-center">
                  <div className="absolute top-0 right-0 bg-amber-200 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                    %15 HAKKI
                  </div>
                  <p className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">Mevcut İndirimli</p>
                  <p className="text-2xl font-bold text-amber-700">{(offerModal.subtotal * 0.85).toFixed(2)} ₺</p>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start text-xs text-blue-800 border border-blue-100">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p><strong>İpucu:</strong> Müşteriyi memnun etmek için <strong>{(offerModal.subtotal * 0.85).toFixed(0)} ₺</strong>'nin altında bir teklif vermeniz önerilir.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Sizin Teklifiniz (TL)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={offerPrice} 
                      onChange={(e) => setOfferPrice(e.target.value)} 
                      className="w-full border-2 border-slate-200 p-4 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none text-2xl font-bold text-slate-900 placeholder:text-slate-300" 
                      placeholder={(offerModal.subtotal * 0.80).toFixed(0)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₺</span>
                  </div>
                  
                  {offerPrice && (
                    <div className="mt-2 flex items-center justify-between text-xs font-medium px-1">
                      <span className={Number(offerPrice) < (offerModal.subtotal * 0.85) ? "text-green-600 flex items-center gap-1" : "text-orange-600 flex items-center gap-1"}>
                        {Number(offerPrice) < (offerModal.subtotal * 0.85) 
                          ? "✅ Gold fiyatından uygun" 
                          : "⚠️ Gold fiyatından yüksek"}
                      </span>
                      <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        Toplam İndirim: <strong>%{(((offerModal.subtotal - Number(offerPrice)) / offerModal.subtotal) * 100).toFixed(1)}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Notunuz (Müşteriye Görünür)</label>
                  <textarea 
                    value={offerNote} 
                    onChange={(e) => setOfferNote(e.target.value)} 
                    className="w-full border border-slate-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none text-sm min-h-[80px]" 
                    placeholder="Örn: Ahmet Bey, sadakatiniz için size özel bu fiyatı sunuyoruz..." 
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setOfferModal(null)} className="flex-1 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl hover:bg-slate-50 font-bold transition-colors">Vazgeç</button>
                <button 
                  onClick={handleMakeOffer} 
                  className="flex-[2] bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!offerPrice || isSubmitting}
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Teklifi Gönder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}