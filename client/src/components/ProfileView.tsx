import { useState } from 'react'
import { User, Package, MapPin, LogOut, Crown, Star, TrendingUp, MessageCircle, Plus } from 'lucide-react'
import { TierProgressBar } from './TierProgressBar'

interface ProfileViewProps {
  profile: any
  orders: any[]
  onLogout: () => void
}

export function ProfileView({ profile, orders, onLogout }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses'>('overview')

  
  const tier = profile?.tier || 'demir'
  const points = profile?.loyalty_points || 0
  const safeOrders = Array.isArray(orders) ? orders : []
  
  
  const specialOffers = safeOrders.filter(o => 
    (o.counterOffer && o.counterOffer.note) || 
    o.status === 'counter_offer'
  );

  
  const marqueeList = specialOffers.length > 0 
    ? [...specialOffers, ...specialOffers, ...specialOffers, ...specialOffers] 
    : [];

  return (
    <div className="max-w-3xl mx-auto min-h-[400px] p-4">
      
      <h2 className="text-lg font-serif text-slate-800 mb-4 px-1">Hesabım</h2>

      <div className="flex flex-col md:flex-row gap-4">
        
        {/* --- SOL taraf --- */}
        <div className="md:w-1/4 min-w-[160px]">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 text-center">
              <div className="w-10 h-10 bg-white rounded-full mx-auto mb-1.5 flex items-center justify-center text-base shadow-sm ring-1 ring-slate-200">
  {tier === 'altin' ? '👑' : tier === 'gumus' ? '🥈' : tier === 'bronz' ? '🥉' : '👤'}
</div>
              <h3 className="font-bold text-slate-800 text-xs truncate">{profile?.name || 'Müşteri'}</h3>
              <p className="text-[9px] text-slate-500 mb-1 truncate">{profile?.email}</p>
              <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-slate-900 text-white uppercase tracking-widest">
                {tier}
              </div>
            </div>
            <nav className="p-1 space-y-0.5">
              <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><User className="w-3 h-3" /> Genel Bakış</button>
              <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all ${activeTab === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><Package className="w-3 h-3" /> Siparişlerim</button>
              <button onClick={() => setActiveTab('addresses')} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all ${activeTab === 'addresses' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><MapPin className="w-3 h-3" /> Adreslerim</button>
              <div className="my-1 border-t border-slate-100"></div>
              <button onClick={onLogout} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium text-red-600 hover:bg-red-50 transition-colors"><LogOut className="w-3 h-3" /> Çıkış</button>
            </nav>
          </div>
        </div>

        {/* --- SAĞ taraf --- */}
        <div className="md:w-3/4 space-y-3 min-w-0 overflow-hidden">

          
          {activeTab === 'overview' && (
            <div className="space-y-3 animate-in fade-in duration-300">
              
              
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                   <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sadakat Puanı</h3>
                   <span className="text-[9px] font-mono font-bold text-slate-900">{points} P</span>
                </div>
                <div className="origin-left scale-y-90">
                   <TierProgressBar totalPoints={points} currentTier={tier} />
                </div>
              </div>

              
              <div className="grid grid-cols-3 gap-2">
                
                <div className="h-14 bg-blue-50 px-2 rounded-lg border border-blue-100 flex flex-col justify-center items-center text-center shadow-sm">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Star className="w-3 h-3 text-blue-600" />
                    <p className="text-[8px] text-blue-500 uppercase font-bold">Puan</p>
                  </div>
                  <p className="text-xs font-bold text-blue-900 leading-none mt-0.5">{points}</p>
                </div>

                <div className="h-14 bg-purple-50 px-2 rounded-lg border border-purple-100 flex flex-col justify-center items-center text-center shadow-sm">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Package className="w-3 h-3 text-purple-600" />
                    <p className="text-[8px] text-purple-500 uppercase font-bold">Sipariş</p>
                  </div>
                  <p className="text-xs font-bold text-purple-900 leading-none mt-0.5">{safeOrders.length}</p>
                </div>

                <div className="h-14 bg-emerald-50 px-2 rounded-lg border border-emerald-100 flex flex-col justify-center items-center text-center shadow-sm">
                  <div className="flex items-center gap-1 mb-0.5">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <p className="text-[8px] text-emerald-500 uppercase font-bold">Harcama</p>
                  </div>
                  <p className="text-xs font-bold text-emerald-900 leading-none mt-0.5">{(profile?.totalSpent || 0).toFixed(0)}₺</p>
                </div>

              </div>

              
              {tier === 'altin' && (
                <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 overflow-hidden group/marquee">
                  <div className="flex items-center gap-1.5 mb-2 relative z-10 px-1">
                    <Crown className="w-3 h-3 text-yellow-600" />
                    <h3 className="text-[10px] font-bold text-yellow-900 uppercase">VIP Mesajlar</h3>
                  </div>

                  {specialOffers.length > 0 ? (
                    <div className="relative w-full overflow-hidden mask-linear-gradient">
                      <div className="animate-marquee flex gap-2 py-0.5">
                        {marqueeList.map((order, index) => (
                          <div key={`${order.id}-${index}`} className="w-[160px] shrink-0 bg-white/90 backdrop-blur-sm p-2 rounded-md border border-yellow-100 shadow-sm flex flex-col gap-1">
                            <div className="flex items-center gap-1 mb-0.5 border-b border-yellow-50 pb-0.5">
                               <MessageCircle className="w-3 h-3 text-yellow-600 shrink-0" />
                               <span className="text-[8px] font-bold text-slate-400 truncate">#{order.id.slice(0,4)}</span>
                            </div>
                            <p className="text-[9px] text-slate-800 italic truncate leading-tight">
                              "{order.counterOffer?.note || order.admin_note || '...'}"
                            </p>
                            {order.counterOffer && (
                              <p className="text-[8px] text-green-600 font-bold mt-0.5 border-t border-yellow-200/50 pt-0.5">
                                Teklif: {(order.counterOffer?.newTotal || order.counterOfferAmount)?.toFixed(0)}₺
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[9px] text-center text-yellow-800/60 py-1 italic">Henüz özel mesajınız yok.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. SİPARİŞLER TABI */}
          {activeTab === 'orders' && (
            <div className="space-y-2 h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {safeOrders.length === 0 ? <p className="text-[10px] text-slate-400 text-center py-4">Sipariş yok.</p> : 
                safeOrders.map(order => (
                  <div key={order.id} className="bg-white p-2 rounded border border-slate-100 flex justify-between items-center hover:border-slate-300 transition-colors">
                     <div>
                       <span className="font-bold text-[10px] text-slate-700 block">#{order.id.slice(0,6)}</span>
                       <span className="text-[9px] text-slate-400">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                     </div>
                     <div className="text-right">
                        <span className="font-bold text-xs text-slate-900 block">{order.total.toFixed(0)} ₺</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100">{order.items.length} Ürün</span>
                     </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* 3. ADRESLER TABI */}
          {activeTab === 'addresses' && (
            <div className="space-y-3 animate-in fade-in duration-300">
               <div className="flex justify-between items-center"><h3 className="text-[10px] font-bold text-slate-800 uppercase">Adresler</h3><button className="text-[9px] bg-black text-white px-2 py-1 rounded hover:bg-slate-800">EKLE</button></div>
               <div className="grid grid-cols-2 gap-2">
                 <div className="border border-slate-200 rounded p-2 bg-white relative hover:border-black cursor-pointer">
                    <span className="absolute top-2 right-2 bg-slate-100 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded">EV</span>
                    <p className="font-bold text-[10px] text-slate-900 mb-0.5">{profile?.name}</p>
                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5 line-clamp-2">Atatürk Mah. No:123 Kadıköy</p>
                 </div>
                 <div className="border border-dashed border-slate-300 rounded p-2 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer min-h-[60px]">
                    <Plus className="w-4 h-4 mb-0.5 opacity-50" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Yeni Ekle</span>
                 </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}