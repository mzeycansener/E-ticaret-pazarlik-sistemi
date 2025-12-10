import { useState, useEffect } from 'react'
import { LayoutDashboard, Package, ShoppingBag, AlertCircle, LogOut, ShoppingCart } from 'lucide-react'
import { getAdminStats, getAdminOrders, getProducts, checkAbandonedCarts, logout } from '../utils/api'
import { AdminDashboard } from './AdminDashboard'
import { AdminProducts } from './AdminProducts'
import { AdminOrders } from './AdminOrders'

interface AdminViewProps {
  onLogout: () => void
}

export function AdminView({ onLogout }: AdminViewProps) {
  const [view, setView] = useState<'dashboard' | 'products' | 'orders' | 'abandoned'>('dashboard')
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, ordersData, productsData] = await Promise.all([
        getAdminStats(),
        getAdminOrders(),
        getProducts()
      ])
      setStats(statsData)
      setOrders(ordersData)
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckAbandonedCarts = async () => {
    try {
      const result = await checkAbandonedCarts()
      if (result.success) {
        setAbandonedCarts(result.abandonedCarts || [])
      }
    } catch (error) {
      console.error('Error checking abandoned carts:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    onLogout()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const pendingOrdersCount = orders.filter(o => o.status === 'pending_approval').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-indigo-600">🛠️ Yönetici Paneli</h1>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => setView('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    view === 'dashboard'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setView('products')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    view === 'products'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span>Ürünler</span>
                </button>

                <button
                  onClick={() => setView('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                    view === 'orders'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Siparişler</span>
                  {pendingOrdersCount > 0 && (
                    <span className="absolute right-3 top-3 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setView('abandoned')
                    handleCheckAbandonedCarts()
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    view === 'abandoned'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Terk Edilen Sepetler</span>
                </button>
              </nav>
            </div>
          </div>

          {/* asıl yerrrr */}
          <div className="flex-1">
            {view === 'dashboard' && <AdminDashboard stats={stats} />}

            {view === 'products' && (
              <AdminProducts
                products={products}
                onRefresh={loadData}
              />
            )}

            {view === 'orders' && (
              <AdminOrders
                orders={orders}
                onRefresh={loadData}
              />
            )}

            {view === 'abandoned' && (
              <div>
                <div className="mb-6">
                  <h2>Terk Edilen Sepetler</h2>
                  <p className="text-gray-600">
                    24 saatten uzun süredir güncellenmemiş sepetler
                  </p>
                </div>

                {abandonedCarts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-gray-900 mb-2">Terk Edilmiş Sepet Yok</h3>
                    <p className="text-gray-500">
                      Harika! Şu anda terk edilmiş sepet bulunmuyor.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-900 mb-1">
                          Otomatik E-posta Bildirimi
                        </p>
                        <p className="text-sm text-yellow-700">
                          Üretim ortamında, bu kullanıcılara otomatik olarak özel teklif e-postaları gönderilecektir.
                        </p>
                      </div>
                    </div>

                    {abandonedCarts.map((cart, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="mb-2">{cart.email}</h3>
                            <p className="text-sm text-gray-600">
                              {cart.cartItems} ürün • {cart.hoursSince} saat önce
                            </p>
                          </div>

                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            E-posta Gönder
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
