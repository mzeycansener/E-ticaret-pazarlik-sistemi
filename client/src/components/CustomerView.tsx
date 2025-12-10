import { useState, useEffect } from 'react'
import { ShoppingBag, User, Menu, X, LogIn } from 'lucide-react'
import { getProfile, getProducts, getCart, updateCart, createOrder, getOrders, logout, getCategories } from '../utils/api'
import { ProductList } from './ProductList'
import { Cart } from './Cart'
import { OrderHistory } from './OrderHistory'
import { TierProgressBar } from './TierProgressBar'
import { TierUpgradePopup } from './TierUpgradePopup'
import { ProfileView } from './ProfileView'
import { PaymentModal } from './PaymentModal'
import { toast } from 'sonner'

interface CustomerViewProps {
  isAuthenticated: boolean
  onLogout: () => void
  onShowAuth: () => void
}

export function CustomerView({ isAuthenticated, onLogout, onShowAuth }: CustomerViewProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'cart' | 'orders' | 'profile'>('products')
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [showTierUpgrade, setShowTierUpgrade] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Ödeme Modalı için State'ler
  const [showPayment, setShowPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [pendingOrderType, setPendingOrderType] = useState('normal')

  useEffect(() => {
    if (profile?.tier) {
      const lastTier = localStorage.getItem('lastKnownTier')
      const currentTier = profile.tier.toLowerCase()
      if (lastTier && lastTier !== currentTier) {
        if (currentTier === 'bronz' && lastTier === 'demir') setShowTierUpgrade('bronz')
        else if (currentTier === 'altin' && (lastTier === 'bronz' || lastTier === 'demir')) setShowTierUpgrade('altin')
      }
      localStorage.setItem('lastKnownTier', currentTier)
    }
  }, [profile?.tier])

  useEffect(() => { loadData() }, [isAuthenticated])

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([getProducts(), getCategories()])
      setProducts(productsData); setCategories(categoriesData)
      if (isAuthenticated) {
        const [cartData, ordersData, profileData] = await Promise.all([getCart(), getOrders(), getProfile()])
        setCart(cartData.items || []); setOrders(ordersData); setProfile(profileData)
      } else { setCart([]); setOrders([]); setProfile(null) }
    } catch (error) { console.error(error) }
  }

  const handleAddToCart = async (product: any) => {
    if (!isAuthenticated) { onShowAuth(); return }
    const existing = cart.find(i => i.productId === product.id)
    const newCart = existing ? cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i) : [...cart, { productId: product.id, quantity: 1 }]
    setCart(newCart); await updateCart(newCart); toast.success('Ürün Sepete Eklendi')
  }

  const handleUpdateCart = async (items: any[]) => { setCart(items); await updateCart(items) }
  
  const handleCheckoutClick = async (requestType: any) => {
    if (requestType === 'inquiry') {
      const result = await createOrder(cart, requestType)
      if (result.success) { toast.success("Talebiniz İletildi! 📨"); setCart([]); await updateCart([]); await loadData(); setActiveTab('orders') } 
      else { toast.error("Hata: " + result.error) }
    } else {
      const total = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
      setPaymentAmount(total); setPendingOrderType(requestType); setShowPayment(true)
    }
  }

  const handlePaymentSuccess = async () => {
    setShowPayment(false)
    const result = await createOrder(cart, pendingOrderType)
    if (result.success) { toast.success("Siparişiniz Alındı! 🎉"); setCart([]); await updateCart([]); await loadData(); setActiveTab('orders') } 
    else { toast.error("Sipariş hatası: " + result.error) }
  }

  const handleLogout = async () => { await logout(); onLogout() }
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)
    const price = item.finalPrice > 0 ? item.finalPrice : (product?.price || 0);
    return sum + (price * item.quantity)
  }, 0)

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}</button>
            
            {/* LOGO KISMI (Masaüstü) - GÜNCELLENDİ */}
            <div className="flex-1 md:flex-none flex justify-center md:justify-start">
              <img 
                src="/logo.png" 
                alt="HAN BUTİK" 
                className="h-12 w-auto object-contain cursor-pointer" 
                onClick={() => setActiveTab('products')}
              />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {isAuthenticated ? <button onClick={() => {setActiveTab('profile');setMobileMenuOpen(false)}} className="p-2 hover:bg-gray-100 rounded-full"><User className="w-5 h-5"/></button> : <button onClick={onShowAuth} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs uppercase font-medium rounded-full"><LogIn className="w-3 h-3"/><span className="hidden md:inline">Giriş Yap</span></button>}
              <button onClick={() => {if(!isAuthenticated){onShowAuth()}else{setActiveTab('cart');setMobileMenuOpen(false)}}} className="relative p-2 hover:bg-gray-100 rounded-full"><ShoppingBag className="w-5 h-5"/>{cartCount>0&&<span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center rounded-full">{cartCount}</span>}</button>
            </div>
          </div>
          <nav className={`${mobileMenuOpen?'block':'hidden'} md:block`}>
            <ul className="flex flex-col md:flex-row md:items-center md:justify-center gap-1 md:gap-8 pb-4 md:pb-0 md:h-12">
              <li><button onClick={() => {setActiveTab('products');setMobileMenuOpen(false)}} className={`block w-full md:w-auto px-4 md:px-0 py-2 md:py-0 text-lg uppercase tracking-wider font-extrabold transition-colors ${activeTab==='products'?'text-black':'text-gray-500 hover:text-black'}`}>Koleksiyon</button></li>
              {isAuthenticated && <><li><button onClick={() => {setActiveTab('orders');setMobileMenuOpen(false)}} className={`block w-full md:w-auto px-4 md:px-0 py-2 md:py-0 text-lg uppercase tracking-wider font-extrabold transition-colors ${activeTab==='orders'?'text-black':'text-gray-500 hover:text-black'}`}>Siparişlerim</button></li><li><button onClick={() => {setActiveTab('profile');setMobileMenuOpen(false)}} className={`block w-full md:w-auto px-4 md:px-0 py-2 md:py-0 text-lg uppercase tracking-wider font-extrabold transition-colors ${activeTab==='profile'?'text-black':'text-gray-500 hover:text-black'}`}>Hesabım</button></li></>}
            </ul>
          </nav>
        </div>
        {isAuthenticated && (
          <div className="border-t border-gray-100 bg-gray-50/50">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-2">
              <TierProgressBar 
                totalPoints={profile?.totalSpent || 0} 
                currentTier={profile?.tier || 'standart'} 
              />
            </div>
          </div>
        )}
      </header>
      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        {activeTab === 'products' && <ProductList products={products} categories={categories} onAddToCart={handleAddToCart} />}
        {activeTab === 'cart' && <Cart items={cart} products={products} tier={profile?.tier} onUpdateCart={handleUpdateCart} onCheckout={handleCheckoutClick} />}
        {activeTab === 'orders' && <OrderHistory orders={orders} products={products} onRefresh={loadData} onOpenPayment={(amount) => { setPaymentAmount(amount); setShowPayment(true); setPendingOrderType('normal'); }} />}
        {activeTab === 'profile' && <ProfileView profile={profile} orders={orders} onLogout={handleLogout} />}
      </main>
      {showTierUpgrade && <TierUpgradePopup newTier={showTierUpgrade} onClose={() => setShowTierUpgrade(null)} />}
      {showPayment && <PaymentModal totalAmount={cartTotal} onClose={() => setShowPayment(false)} onSuccess={handlePaymentSuccess} />}
    </div>
  )
}