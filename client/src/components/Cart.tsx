import { useState } from 'react'
import { Trash2, Minus, Plus, HelpCircle } from 'lucide-react'

interface CartProps {
  items: any[]
  products: any[]
  tier: string
  onUpdateCart: (items: any[]) => void
  onCheckout: (requestType: string) => void // Değişti
}

export function Cart({ items, products, tier, onUpdateCart, onCheckout }: CartProps) {
  
  const getProductById = (id: string) => products.find(p => p.id === id)

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(productId); return; }
    onUpdateCart(items.map(item => item.productId === productId ? { ...item, quantity } : item))
  }

  const removeItem = (productId: string) => {
    onUpdateCart(items.filter(item => item.productId !== productId))
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (getProductById(item.productId)?.price || 0) * item.quantity, 0)
  }

  
  const getTierDiscountPercent = () => {
    switch (tier) {
      case 'standart': return 0 // Yeni
      case 'bronz': return 5
      case 'gumus': return 10
      case 'altin': return 15
      default: return 0
    }
  }

// aşşadki yeri

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm uppercase tracking-wide text-gray-500 mb-4">Sepetiniz boş</p>
      </div>
    )
  }

  const subtotal = calculateSubtotal()
  const tierDiscount = subtotal * (getTierDiscountPercent() / 100)
  const total = subtotal - tierDiscount

  return (
    <div>
      <h2 className="text-2xl uppercase tracking-wide mb-8">Sepetim ({items.length})</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => {
            const product = getProductById(item.productId)
            if (!product) return null
            return (
              <div key={item.productId} className="flex gap-4 pb-6 border-b border-gray-200">
                <div className="w-24 h-32 bg-gray-100 flex-shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm uppercase tracking-wide mb-1">{product.name}</h3>
                    <p className="text-sm">{product.price.toFixed(2)} ₺</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-gray-400 hover:text-black"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="border border-gray-200 p-6 sticky top-24">
            <h3 className="text-sm uppercase tracking-wide mb-6">Sipariş Özeti</h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Ara Toplam</span>
                <span>{subtotal.toFixed(2)} ₺</span>
              </div>
              {tierDiscount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Üyelik İndirimi ({getTierDiscountPercent()}%)</span>
                  <span>-{tierDiscount.toFixed(2)} ₺</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold">
                <span>Toplam</span>
                <span>{total.toFixed(2)} ₺</span>
              </div>
            </div>

            {/* GOLD TIER ÖZEL ALAN */}
            {tier === 'altin' ? (
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-xs text-yellow-800 flex items-center gap-2 mb-3">
                    <span className="text-lg">👑</span> Altın Üye Ayrıcalığı
                  </p>
                  <button
                    onClick={() => onCheckout('inquiry')} // Özel İstek
                    className="w-full py-3 bg-black text-white text-xs uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Bana Kaça Olur?
                  </button>
                  <p className="text-[10px] text-gray-500 mt-2 text-center">
                    Mağaza sahibinden özel fiyat isteyin. Cevap siparişlerime düşecektir.
                  </p>
                </div>
                <button
                  onClick={() => onCheckout('normal')}
                  className="w-full py-3 border border-black text-black text-xs uppercase tracking-wide hover:bg-gray-50 transition-colors"
                >
                  Normal Satın Al
                </button>
              </div>
            ) : (
              <button
                onClick={() => onCheckout('normal')}
                className="w-full bg-black text-white py-4 text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors"
              >
                Siparişi Tamamla
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}