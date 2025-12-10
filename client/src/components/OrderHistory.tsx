import { Clock, CheckCircle, XCircle, Package, Handshake, Check, X } from 'lucide-react'
import { respondToCounterOffer } from '../utils/api'

interface OrderHistoryProps {
  orders: any[]
  products: any[]
  onRefresh?: () => void
  onOpenPayment?: (amount: number) => void
}

export function OrderHistory({ orders, products, onRefresh, onOpenPayment }: OrderHistoryProps) {
  
  const handleCounterOfferResponse = async (orderId: string, accepted: boolean, newPrice: number) => {
    const result = await respondToCounterOffer(orderId, accepted)
    
    if (result.success) {
      if (accepted) {
        alert("Teklif kabul edildi! Ödeme ekranına geçiliyor... 💸");
        if (onRefresh) await onRefresh();
        if (onOpenPayment) {
            const finalPrice = newPrice > 0 ? newPrice : 0; 
            onOpenPayment(finalPrice);
        }
      } else {
        alert("Teklifi reddettiniz.");
        if (onRefresh) onRefresh();
      }
    } else {
      alert("Bir hata oluştu.");
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed': return { icon: CheckCircle, text: 'Tamamlandı', color: 'text-green-600', bgColor: 'bg-green-50' }
      case 'pending_approval': return { icon: Clock, text: 'Onay Bekliyor', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
      case 'counter_offer': return { icon: Handshake, text: 'Karşı Teklif Aldınız', color: 'text-orange-600', bgColor: 'bg-orange-50' }
      case 'onaylandi': return { icon: CheckCircle, text: 'Ödeme Bekliyor', color: 'text-blue-600', bgColor: 'bg-blue-50' }
      case 'rejected': return { icon: XCircle, text: 'Reddedildi', color: 'text-red-600', bgColor: 'bg-red-50' }
      default: return { icon: Package, text: status, color: 'text-gray-600', bgColor: 'bg-gray-50' }
    }
  }

  if (orders.length === 0) {
    return <div className="py-24 text-center text-gray-400">Henüz siparişiniz yok.</div>
  }

  return (
    <div>
      <h2 className="text-xl font-serif text-slate-800 mb-6 px-1">Siparişlerim</h2>
      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = getStatusInfo(order.status)
          const StatusIcon = statusInfo.icon

          return (
            <div key={order.id} className="border border-gray-200 p-5 rounded-xl shadow-sm bg-white">
              <div className="flex justify-between mb-4 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">#{order.id.slice(0, 8)}</p>
                  <p className="text-[10px] text-gray-500">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold uppercase">{statusInfo.text}</span>
                </div>
              </div>

              <div className="space-y-4 mb-4">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                     
                     {/* ÜRÜN GÖRSELİ  */}
                     <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-full w-full object-cover"
                          onError={(e) => {e.currentTarget.style.display='none'}}
                        />
                     </div>
                     {/* --------------------------------------------- */}

                     <div className="flex-1 flex justify-between items-center text-sm w-full">
                        <div className="flex flex-col gap-1">
                           <span className="font-bold text-slate-800 text-base">{item.name}</span>
                           <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 w-fit">Adet: {item.quantity}</span>
                        </div>
                        <span className="font-bold text-lg text-slate-900">{item.price.toFixed(2)} ₺</span>
                     </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                 <span className="text-xs text-slate-500 font-bold uppercase">Toplam</span>
                 <span className="text-xl font-black text-slate-900">{order.total.toFixed(2)} ₺</span>
              </div>

              {/* --- TEKLİF ALANI */}
              {order.status === 'counter_offer' && order.counterOffer && (
                <div className="mt-4 p-4 border border-orange-200 bg-orange-50/60 rounded-lg">
                  <h4 className="text-xs font-bold text-orange-900 mb-2 uppercase flex items-center gap-2">
                    <Handshake className="w-4 h-4"/> Özel Teklif
                  </h4>
                  
                  <div className="flex justify-between items-center bg-white p-3 rounded border border-orange-100 mb-3">
                     <div className="text-xs text-gray-400 line-through">{order.total.toFixed(2)} ₺</div>
                     <div className="text-lg font-bold text-green-600">
                        {(order.counterOffer.newTotal || order.total).toFixed(2)} ₺
                     </div>
                  </div>
                  
                  <p className="text-xs text-orange-800 mb-3 italic">"{order.counterOffer.note || 'Özel fiyatınız.'}"</p>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCounterOfferResponse(order.id, true, order.counterOffer.newTotal)} 
                      className="flex-1 py-2 bg-black text-white rounded-md text-xs font-bold uppercase hover:bg-gray-800"
                    >
                      Kabul Et & Öde
                    </button>
                    <button onClick={() => handleCounterOfferResponse(order.id, false, 0)} className="flex-1 py-2 bg-white border border-gray-300 rounded-md text-xs font-bold uppercase hover:bg-gray-50">
                      Reddet
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}