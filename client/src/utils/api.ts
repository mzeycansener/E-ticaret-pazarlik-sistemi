import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './supabase/info'

// MERKEZİ API ADRESİ
const API_URL = 'http://localhost:3000/api';

export const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey)

// --- YARDIMCI FETCH FONKSİYONU ---
async function apiRequest(endpoint: string, body: any) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Sunucu Hatası: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error(`API HATASI (${endpoint}):`, error);
        return { success: false, error: "Sunucuyla bağlantı kurulamadı. 'node server.js' açık mı?" };
    }
}

// --- KULLANICI ---
export async function getSession() { const { data } = await supabase.auth.getSession(); return data.session }
export async function getProfile() { const session = await getSession(); if (!session) return null; const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single(); return data ? { ...data, isAdmin: data.role === 'admin', totalSpent: data.loyalty_points || 0 } : null; }
export async function login(email, password) { return await supabase.auth.signInWithPassword({ email, password }) }
export async function logout() { return await supabase.auth.signOut() }
export async function signup(email, password, name) { const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } }); if (data.user) { await supabase.from('profiles').insert({ id: data.user.id, email, role: 'customer', tier: 'demir', loyalty_points: 0 }); } return { success: !error, data, error: error?.message }; }

// --- ÜRÜN & SEPET ---
export async function getProducts() { const { data } = await supabase.from('products').select('*').order('id'); return data?.map(p => ({ ...p, image: p.image_url, categoryId: p.category ? p.category.toLowerCase() : 'giyim' })) || []; }
export async function createProduct(p) { const { error } = await supabase.from('products').insert({ name: p.name, price: p.price, stock: p.stock, image_url: p.image, category: p.category, cost_price: p.price * 0.6 }); return { success: !error, error: error?.message }; }
export async function updateProduct(id, p) { const up = {...p}; if(p.image) { up.image_url = p.image; delete up.image; } if(p.categoryId) { up.category = p.categoryId; delete p.categoryId; } const { error } = await supabase.from('products').update(up).eq('id', id); return { success: !error, error: error?.message }; }
export async function deleteProduct(id) { await supabase.from('cart_items').delete().eq('product_id', id); await supabase.from('bargain_requests').delete().eq('product_id', id); const { error } = await supabase.from('products').delete().eq('id', id); return { success: !error, error: error?.message }; }
export async function getLowStockProducts() { const { data } = await supabase.from('products').select('*').lt('stock', 5); return data?.map(p => ({ ...p, image: p.image_url })) || []; }
export async function getCategories() { return [{ id: 'giyim', name: 'Giyim' }, { id: 'aksesuar', name: 'Aksesuar' }, { id: 'ayakkabi', name: 'Ayakkabı' }]; }

export async function getCart() { const s = await getSession(); if (!s) return { items: [] }; const { data: c } = await supabase.from('carts').select('id').eq('user_id', s.user.id).eq('is_active', true).maybeSingle(); if (!c) return { items: [] }; const { data: i } = await supabase.from('cart_items').select('*, products(*)').eq('cart_id', c.id); return { items: i?.map(x => ({ productId: x.product_id, quantity: x.quantity, product: x.products })) || [] }; }
export async function updateCart(items: any[]) {
  const session = await getSession();
  if (!session) return { success: false, error: "Oturum yok" };
  try {
    let { data: cart } = await supabase.from('carts').select('id').eq('user_id', session.user.id).eq('is_active', true).maybeSingle();
    if (!cart) { const { data: newCart, error } = await supabase.from('carts').insert({ user_id: session.user.id, is_active: true }).select().single(); if(error) throw error; cart = newCart; }
    await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    if (items.length > 0) { const { error } = await supabase.from('cart_items').insert(items.map(i => ({ cart_id: cart.id, product_id: i.productId, quantity: i.quantity }))); if(error) throw error; }
    await supabase.from('carts').update({ updated_at: new Date(), email_sent: false }).eq('id', cart.id);
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

// --- SİPARİŞ OLUŞTURMA 
export async function createOrder(items, requestType = 'normal', offeredPrice = 0) { 
  const session = await getSession(); 
  if (!session) return { success: false }; 

  // 1. ÖNCE TOPLAM TUTARI HESAPLA 
  let total = 0;
  for (const item of items) {
    const { data: p } = await supabase.from('products').select('price').eq('id', item.productId).single();
    if (p) total += p.price * item.quantity;
  }

  if (requestType === 'normal') return { success: true, status: 'completed' };

  const productId = items[0].productId; 
  const { data: cart } = await supabase.from('carts').select('id').eq('user_id', session.user.id).eq('is_active', true).single();
  
  
  return await apiRequest('/bargain/request', { 
    userId: session.user.id, 
    cartId: cart?.id, 
    productId, 
    originalPrice: total, // <-- BURASI ARTIK 0 DEĞİL, GERÇEK TUTAR
    offeredPrice, 
    requestType 
  });
}

export async function makeCounterOffer(orderId, percent, note) { 
  return await apiRequest('/admin/bargain/approve', { 
    requestId: orderId, 
    status: 'counter_offer', 
    counterOfferPercent: percent, 
    adminNote: note 
  });
}

export async function approveOrder(orderId, approved) { 
  return await apiRequest('/admin/bargain/approve', { 
    requestId: orderId, 
    status: approved ? 'onaylandi' : 'reddedildi' 
  });
}

export async function respondToCounterOffer(orderId, accepted) { 
  return await apiRequest('/bargain/respond', { requestId: orderId, accepted });
}

export async function processPayment(paymentData: any) { 
  return await apiRequest('/payment/process', paymentData);
}


export async function getOrders() { const session = await getSession(); if (!session) return []; const { data } = await supabase.from('bargain_requests').select('*, products(*)').eq('user_id', session.user.id).order('created_at', { ascending: false }); return data?.map(req => ({ id: req.id.toString(), createdAt: req.created_at, status: req.status, total: req.original_price, subtotal: req.original_price, discount: req.original_price - req.offered_price, counterOffer: req.counter_offer_percent ? { discount: req.counter_offer_percent, newTotal: req.original_price * (1 - req.counter_offer_percent / 100), note: req.admin_note } : null, tier: 'altin', items: [{ productId: req.product_id, name: req.products?.name, price: req.original_price, quantity: 1, image: req.products?.image_url }] })) || []; }
export async function getAdminOrders() { const { data } = await supabase.from('bargain_requests').select('*, profiles(email, name, loyalty_points), products(*)').order('created_at', { ascending: false }); return data?.map(req => ({ id: req.id.toString(), userId: req.user_id, createdAt: req.created_at, status: req.status, total: req.original_price, subtotal: req.original_price, requestedDiscount: req.original_price - req.offered_price, offeredPrice: req.offered_price, counterOffer: req.counter_offer_percent, counterOfferAmount: req.original_price * (req.counter_offer_percent / 100 || 0), counterOfferNote: req.admin_note, items: [{ name: req.products?.name, quantity: 1, subtotal: req.original_price }], profiles: req.profiles })) || []; }



// --- İSTATİSTİKLERİ SUNUCUDAN ÇEK ---
export async function getAdminStats() { 
  return await apiRequest('/admin/stats', {}); // GET isteği atar
}


export async function checkAbandonedCarts() { return { success: true, abandonedCarts: [] }; }
export async function setTier(tier) { return { success: true }; }