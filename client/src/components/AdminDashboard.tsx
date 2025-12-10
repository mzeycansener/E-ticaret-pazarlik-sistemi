import { TrendingUp, Package, ShoppingBag, Users, AlertTriangle, ArrowRight } from 'lucide-react'

interface AdminDashboardProps {
  stats: any
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  // Kart Verileri
  const statCards = [
    {
      title: 'Toplam Gelir',
      value: `${(stats?.totalRevenue || 0).toFixed(2)} ₺`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Toplam Sipariş',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Bekleyen Onaylar',
      value: stats?.pendingOrders || 0,
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Toplam Ürün',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  // Kritik Stok Listesi (Backend'den gelen veri)
  const lowStockItems = stats?.lowStockItems || []

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Genel Bakış</h2>
        <p className="text-gray-600">Mağazanızın performans özeti</p>
      </div>

      {/* İSTATİSTİK paneli */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
            <h2 className={`text-2xl font-bold ${card.color}`}>{card.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/*  SİPARİŞ DURUMU */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-500" />
            Sipariş Durumu
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
              <span className="text-green-900 font-medium">Tamamlanan</span>
              <span className="text-lg font-bold text-green-600">{stats?.completedOrders || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <span className="text-yellow-900 font-medium">Bekleyen</span>
              <span className="text-lg font-bold text-yellow-600">{stats?.pendingOrders || 0}</span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-500">
              <span>Toplam Kullanıcı</span>
              <span className="font-medium text-gray-900">{stats?.totalUsers || 0}</span>
            </div>
          </div>
        </div>

        {/* SAĞ: KRİTİK STOK DURUMU (YENİ EKLENEN PANEL) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Kritik Stok Takibi
            </h3>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">
              {lowStockItems.length} Ürün Kritik
            </span>
          </div>

          <div className="flex-1 overflow-auto p-0">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-gray-900 font-medium">Stoklar Güvende!</p>
                <p className="text-sm text-gray-500">Kritik seviyede ürününüz bulunmuyor.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Ürün Adı</th>
                    <th className="px-6 py-3 text-center">Stok</th>
                    <th className="px-6 py-3 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lowStockItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${item.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.stock === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Tükendi
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Az Kaldı
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl text-center">
             <p className="text-xs text-gray-500">Stok seviyesi 10'un altına düşen ürünler burada listelenir.</p>
          </div>
        </div>

      </div>
    </div>
  )
}