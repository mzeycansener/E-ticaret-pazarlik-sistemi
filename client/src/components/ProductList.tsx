import { ShoppingBag, ArrowLeft, Shirt, Watch, Footprints } from 'lucide-react'
import { useState } from 'react'

// GÖRSELLER
const IMAGES = {
  giyim: "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1000&auto=format&fit=crop",
  aksesuar: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1000&auto=format&fit=crop",
  ayakkabi: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1000&auto=format&fit=crop"
}

interface ProductListProps {
  products: any[]
  categories: any[]
  onAddToCart: (product: any) => void
}

export function ProductList({ products, categories, onAddToCart }: ProductListProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'list'>('overview')
  const [activeCategory, setActiveCategory] = useState('giyim')
  
  
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null)

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category)
    setViewMode('list')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredProducts = products.filter(product => {
    const prodCat = (product.categoryId || 'giyim').toLowerCase();
    return prodCat === activeCategory;
  });

  // --- 1. VİTRİN GÖRÜNÜMÜ (PANELLER) ---
  if (viewMode === 'overview') {
    return (
      <div className="w-full py-8 px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-black uppercase tracking-widest">
          Koleksiyonlar
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 w-full min-h-[500px]">
          {/* GİYİM */}
          <div 
            onClick={() => handleCategorySelect('giyim')}
            className="relative flex-1 group cursor-pointer overflow-hidden rounded-2xl shadow-lg bg-gray-800"
            style={{ height: '500px' }}
          >
            <img src={IMAGES.giyim} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="Giyim" onError={(e) => e.currentTarget.style.display='none'} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-black/20 group-hover:bg-black/40 transition-colors">
              <Shirt className="w-12 h-12 mb-4 opacity-90" />
              <h3 className="text-4xl font-black tracking-widest uppercase drop-shadow-lg">GİYİM</h3>
              <span className="mt-2 text-sm border-b border-white pb-1">Keşfet</span>
            </div>
          </div>

          {/* AKSESUAR */}
          <div 
            onClick={() => handleCategorySelect('aksesuar')}
            className="relative flex-1 group cursor-pointer overflow-hidden rounded-2xl shadow-lg bg-gray-700"
            style={{ height: '500px' }}
          >
            <img src={IMAGES.aksesuar} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="Aksesuar" onError={(e) => e.currentTarget.style.display='none'} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-black/20 group-hover:bg-black/40 transition-colors">
              <Watch className="w-12 h-12 mb-4 opacity-90" />
              <h3 className="text-4xl font-black tracking-widest uppercase drop-shadow-lg">AKSESUAR</h3>
              <span className="mt-2 text-sm border-b border-white pb-1">İncele</span>
            </div>
          </div>

          {/* AYAKKABI */}
          <div 
            onClick={() => handleCategorySelect('ayakkabi')}
            className="relative flex-1 group cursor-pointer overflow-hidden rounded-2xl shadow-lg bg-gray-600"
            style={{ height: '500px' }}
          >
            <img src={IMAGES.ayakkabi} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="Ayakkabı" onError={(e) => e.currentTarget.style.display='none'} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-black/20 group-hover:bg-black/40 transition-colors">
              <Footprints className="w-12 h-12 mb-4 opacity-90" />
              <h3 className="text-4xl font-black tracking-widest uppercase drop-shadow-lg">AYAKKABI</h3>
              <span className="mt-2 text-sm border-b border-white pb-1">Göz At</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- 2. LİSTE GÖRÜNÜMÜ ---
  return (
    <div className="py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <button 
          onClick={() => setViewMode('overview')}
          className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          KOLEKSİYONLARA DÖN
        </button>
        <h2 className="text-2xl font-black uppercase tracking-widest text-black">{activeCategory}</h2>
        <div className="w-32"></div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 font-medium">Bu kategoride henüz ürün yok.</p>
          <button onClick={() => setViewMode('overview')} className="text-black underline mt-2 text-sm">Geri Dön</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="relative flex flex-col cursor-pointer"
              
              onMouseEnter={() => setHoveredProductId(product.id)}
              onMouseLeave={() => setHoveredProductId(null)}
            >
              
              {/* Resim Alanı */}
              <div className="relative aspect-[3/4] bg-gray-200 rounded-xl overflow-hidden mb-3 shadow-sm border border-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => { e.currentTarget.style.display='none'; }}
                />
                
                {/* Kategori Etiketi */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                   <span className="bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold uppercase rounded shadow-sm border border-gray-200">
                      {product.categoryId}
                   </span>
                </div>

                
                <div 
                  className={`
                    absolute bottom-0 left-0 w-full p-4 z-30 
                    transition-all duration-300 ease-out
                    ${hoveredProductId === product.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  `}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    className="w-full bg-black text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4 inline mr-2" />
                    Sepete Ekle
                  </button>
                </div>
                
                {/* Karartma Efekti  */}
                <div className={`absolute inset-0 bg-black/5 pointer-events-none transition-opacity duration-300 ${hoveredProductId === product.id ? 'opacity-100' : 'opacity-0'}`}></div>
              </div>
              
              {/* Bilgiler */}
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-1 leading-tight">{product.name}</h3>
                <p className="text-sm text-gray-600 font-medium">
                  {product.price.toFixed(2)} ₺
                </p>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}