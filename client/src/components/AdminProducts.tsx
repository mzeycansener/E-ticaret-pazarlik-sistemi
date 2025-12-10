import { useState } from 'react'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { createProduct, updateProduct, deleteProduct } from '../utils/api'

interface AdminProductsProps {
  products: any[]
  onRefresh: () => void
}

export function AdminProducts({ products, onRefresh }: AdminProductsProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock: '', image: '',
    category: 'giyim'
  })

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', image: '', category: 'giyim' })
    setEditingProduct(null)
    setShowForm(false)
  }

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock?.toString() || '',
      image: product.image || '',
      category: product.categoryId || product.category || 'giyim'
    })
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const productData = {
      name: formData.name, description: formData.description,
      price: parseFloat(formData.price), stock: parseInt(formData.stock) || 0,
      image: formData.image, category: formData.category
    }

    let result;
    if (editingProduct) result = await updateProduct(editingProduct.id, productData)
    else result = await createProduct(productData)

    if (result && result.success) {
      alert("İşlem Başarılı! ✅"); resetForm(); onRefresh()
    } else {
      alert("HATA: " + (result?.error || "Bilinmeyen hata"));
    }
  }

  const handleDelete = async (productId: string) => {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      const result = await deleteProduct(productId)
      if(result.success) onRefresh()
      else alert("Silme hatası: " + result.error);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-serif text-slate-800">Ürün Yönetimi</h2><p className="text-gray-600">Mağazanızdaki ürünleri yönetin.</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"><Plus className="w-5 h-5" /> Yeni Ürün</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6 border-b pb-4"><h3 className="text-xl font-bold text-slate-800">{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3><button onClick={resetForm} className="text-gray-400 hover:text-black"><X className="w-6 h-6" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1 text-slate-700">Ürün Adı</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-300 p-2.5 rounded-lg" required /></div>
              <div><label className="block text-sm font-medium mb-1 text-slate-700">Açıklama</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border border-slate-300 p-2.5 rounded-lg" rows={2} /></div>
              
              {/*AYAKKABI  */}
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Kategori</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border border-slate-300 p-2.5 rounded-lg bg-white">
                  <option value="giyim">Giyim</option>
                  <option value="aksesuar">Aksesuar</option>
                  <option value="ayakkabi">Ayakkabı</option> {/* YENİ */}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1 text-slate-700">Fiyat (₺)</label><input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full border border-slate-300 p-2.5 rounded-lg" required /></div>
                <div><label className="block text-sm font-medium mb-1 text-slate-700">Stok</label><input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full border border-slate-300 p-2.5 rounded-lg" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1 text-slate-700">Resim URL</label><input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full border border-slate-300 p-2.5 rounded-lg" /></div>
              <div className="flex gap-3 pt-4"><button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-bold">Kaydet</button><button type="button" onClick={resetForm} className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">İptal</button></div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 group">
            <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded shadow-sm text-slate-700">
                {/* ETİKETİ GÖSTERİRKEN DÜZELTME */}
                {product.categoryId === 'ayakkabi' ? 'Ayakkabı' : product.categoryId === 'aksesuar' ? 'Aksesuar' : 'Giyim'}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-900 mb-1 text-lg">{product.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <p className="text-indigo-600 font-bold text-xl">{product.price.toFixed(2)} ₺</p>
                <div className="flex gap-2"><button onClick={() => handleEdit(product)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"><Edit className="w-4 h-4" /></button><button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}