import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'
import * as email from './email.tsx'
import * as payment from './payment.tsx'

const app = new Hono()

app.use('*', cors())
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Helper function to get user from token
async function getUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1]
  if (!accessToken) return null
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) return null
  return user
}

// User signup
app.post('/make-server-ace323ab/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })
    
    if (error) {
      console.log(`Signup error: ${error.message}`)
      return c.json({ error: error.message }, 400)
    }
    
    // Check if this is the admin account
    const isAdmin = email === 'admin@butik.com'
    
    // Initialize user data
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      totalSpent: 0,
      tier: 'demir', // demir, bronz, altin
      points: 0,
      isAdmin
    })
    
    return c.json({ success: true, user: data.user })
  } catch (error) {
    console.log(`Signup error: ${error}`)
    return c.json({ error: 'Signup failed' }, 500)
  }
})

// Get user profile
app.get('/make-server-ace323ab/profile', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const userData = await kv.get(`user:${user.id}`)
  return c.json(userData)
})

// Update user tier for testing (temporary endpoint)
app.post('/make-server-ace323ab/profile/set-tier', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const { tier } = await c.req.json()
  const userData = await kv.get(`user:${user.id}`)
  
  // Set appropriate totalSpent based on tier
  let totalSpent = userData?.totalSpent || 0
  if (tier === 'altin' && totalSpent < 5000) {
    totalSpent = 5000
  } else if (tier === 'bronz' && totalSpent < 2000) {
    totalSpent = 2000
  }
  
  await kv.set(`user:${user.id}`, {
    ...userData,
    tier,
    totalSpent,
    points: Math.floor(totalSpent / 10)
  })
  
  return c.json({ success: true })
})

// Get all products
app.get('/make-server-ace323ab/products', async (c) => {
  const products = await kv.getByPrefix('product:')
  return c.json(products || [])
})

// Get product categories
app.get('/make-server-ace323ab/categories', async (c) => {
  const categories = await kv.getByPrefix('category:')
  return c.json(categories || [])
})

// Create category (admin only)
app.post('/make-server-ace323ab/categories', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const userData = await kv.get(`user:${user.id}`)
  if (!userData?.isAdmin) return c.json({ error: 'Forbidden' }, 403)
  
  const { name, description } = await c.req.json()
  const categoryId = `category:${Date.now()}`
  
  await kv.set(categoryId, {
    id: categoryId,
    name,
    description,
    createdAt: new Date().toISOString()
  })
  
  return c.json({ success: true, categoryId })
})

// Delete category (admin only)
app.delete('/make-server-ace323ab/categories/:id', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const userData = await kv.get(`user:${user.id}`)
  if (!userData?.isAdmin) return c.json({ error: 'Forbidden' }, 403)
  
  const categoryId = c.req.param('id')
  await kv.del(categoryId)
  return c.json({ success: true })
})

// Create product (admin only)
app.post('/make-server-ace323ab/products', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  // Check if admin
  const userData = await kv.get(`user:${user.id}`)
  if (!userData?.isAdmin) return c.json({ error: 'Forbidden' }, 403)
  
  const { name, description, price, image, stock, categoryId, lowStockThreshold } = await c.req.json()
  const productId = `product:${Date.now()}`
  
  await kv.set(productId, {
    id: productId,
    name,
    description,
    price,
    image,
    stock: stock || 0,
    categoryId: categoryId || null,
    lowStockThreshold: lowStockThreshold || 10,
    createdAt: new Date().toISOString()
  })
  
  return c.json({ success: true, productId })
})

// Update product (admin only)
app.put('/make-server-ace323ab/products/:id', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const userData = await kv.get(`user:${user.id}`)
  if (!userData?.isAdmin) return c.json({ error: 'Forbidden' }, 403)
  
  const productId = c.req.param('id')
  const updates = await c.req.json()
  
  const product = await kv.get(productId)
  if (!product) return c.json({ error: 'Product not found' }, 404)
  
  await kv.set(productId, { ...product, ...updates })
  return c.json({ success: true })
})

// Delete product (admin only)
app.delete('/make-server-ace323ab/products/:id', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const userData = await kv.get(`user:${user.id}`)
  if (!userData?.isAdmin) return c.json({ error: 'Forbidden' }, 403)
  
  const productId = c.req.param('id')
  await kv.del(productId)
  return c.json({ success: true })
})

// Get cart
app.get('/make-server-ace323ab/cart', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const cart = await kv.get(`cart:${user.id}`) || { items: [] }
  return c.json(cart)
})

// Update cart
app.post('/make-server-ace323ab/cart', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const { items } = await c.req.json()
  
  await kv.set(`cart:${user.id}`, {
    items,
    updatedAt: new Date().toISOString()
  })
  
  return c.json({ success: true })
})

// Helper function to calculate tier based on total spent
function calculateTier(totalSpent: number): string {
  if (totalSpent >= 5000) return 'altin'
  if (totalSpent >= 2000) return 'bronz'
  return 'demir'
}

// Helper function to get tier discount
function getTierDiscount(tier: string): number {
  switch (tier) {
    case 'demir': return 0 // No discount, but free shipping
    case 'bronz': return 10 // 10% discount + free shipping
    case 'altin': return 15 // 15% base discount + free shipping + can request more
    default: return 0
  }
}

// Helper function to get shipping cost
function getShippingCost(tier: string): number {
  // All tiers get free shipping
  return 0
}

// Constants
const STANDARD_SHIPPING_COST = 50 // Standard shipping for non-members (if needed)

// Create order / discount request
app.post('/make-server-ace323ab/orders', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  try {
    const { items, proposedDiscount } = await c.req.json()
    
    const userData = await kv.get(`user:${user.id}`)
    const tier = userData?.tier || 'demir'
    
    // Calculate subtotal
    let subtotal = 0
    const orderItems = []
    
    for (const item of items) {
      const product = await kv.get(item.productId)
      if (!product) continue
      
      const itemTotal = product.price * item.quantity
      subtotal += itemTotal
      
      orderItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemTotal
      })
    }
    
    // Get shipping cost (free for all tiers)
    const shippingCost = getShippingCost(tier)
    
    // Calculate base discount from tier
    const tierDiscountPercent = getTierDiscount(tier)
    const tierDiscountAmount = subtotal * (tierDiscountPercent / 100)
    
    let additionalDiscount = 0
    let status = 'completed'
    let totalDiscountPercent = tierDiscountPercent
    
    if (tier === 'altin' && proposedDiscount && proposedDiscount > 0) {
      // Gold tier can propose additional discount - needs approval
      // Base 15% + additional up to 10% (max 25% total)
      const maxAdditionalPercent = 10
      const proposedAdditionalPercent = Math.min(proposedDiscount, maxAdditionalPercent)
      additionalDiscount = subtotal * (proposedAdditionalPercent / 100)
      totalDiscountPercent = tierDiscountPercent + proposedAdditionalPercent
      status = 'pending_approval'
    }
    
    const totalDiscount = tierDiscountAmount + additionalDiscount
    const total = subtotal + shippingCost - totalDiscount
    
    const orderId = `order:${Date.now()}`
    const order = {
      id: orderId,
      userId: user.id,
      items: orderItems,
      subtotal,
      shippingCost,
      tierDiscount: tierDiscountAmount,
      tierDiscountPercent,
      additionalDiscount,
      additionalDiscountPercent: tier === 'altin' && proposedDiscount ? Math.min(proposedDiscount, 10) : 0,
      discount: totalDiscount,
      discountPercent: totalDiscountPercent,
      proposedDiscount: tier === 'altin' ? proposedDiscount : 0,
      total,
      tier,
      status, // pending_approval, completed, rejected
      createdAt: new Date().toISOString()
    }
    
    await kv.set(orderId, order)
    
    // If completed automatically (iron or bronze), update user stats and reduce stock
    if (status === 'completed') {
      const newTotalSpent = (userData?.totalSpent || 0) + total
      const newTier = calculateTier(newTotalSpent)
      
      await kv.set(`user:${user.id}`, {
        ...userData,
        totalSpent: newTotalSpent,
        tier: newTier,
        points: Math.floor(newTotalSpent / 10)
      })
      
      // Reduce stock
      for (const item of orderItems) {
        const product = await kv.get(item.productId)
        if (product) {
          product.stock = Math.max(0, (product.stock || 0) - item.quantity)
          await kv.set(item.productId, product)
        }
      }
      
      // Clear cart
      await kv.del(`cart:${user.id}`)
    }
    
    return c.json({ success: true, order })
  } catch (error) {
    console.log(`Order creation error: ${error}`)
    return c.json({ error: 'Order creation failed' }, 500)
  }
})

// Get all orders (admin)
app.get('/make-server-ace323ab/admin/orders', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const userData = await kv.get(`user:${user.id}`)
  if (!userData?.isAdmin) return c.json({ error: 'Forbidden' }, 403)
  
  const orders = await kv.getByPrefix('order:')
  return c.json(orders || [])
})

// Get user's orders
app.get('/make-server-ace323ab/orders', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const allOrders = await kv.getByPrefix('order:')
  const userOrders = (allOrders || []).filter((order: any) => order.userId === user.id)
  return c.json(userOrders)
})

// Approve/reject discount request (admin)
app.post('/make-server-ace323ab/admin/orders/:id/approve', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const userData = await kv.get(`user:${user.id}`)
  if (!userData?.isAdmin) return c.json({ error: 'Forbidden' }, 403)
  
  const orderId = c.req.param('id')
  const { approved, rejectionReason, counterOffer, counterOfferNote } = await c.req.json()
  
  const order = await kv.get(orderId)
  if (!order) return c.json({ error: 'Order not found' }, 404)
  
  // Get user info for email
  const orderUser = await kv.get(`user:${order.userId}`)
  
  // If counter offer is provided
  if (counterOffer !== undefined && counterOffer !== null) {
    // Store counter offer details
    order.status = 'counter_offer'
    order.requestedDiscount = order.proposedDiscount || 0
    order.counterOffer = Number(counterOffer)
    order.counterOfferNote = counterOfferNote || ''
    
    const counterOfferAmount = order.subtotal * (order.counterOffer / 100)
    const counterOfferTotal = order.subtotal - counterOfferAmount
    
    order.counterOfferAmount = counterOfferAmount
    order.counterOfferTotal = counterOfferTotal
    
    await kv.set(orderId, order)
    
    // Send counter offer email
    const emailHTML = email.getCounterOfferEmailHTML(orderUser.name, {
      requestedDiscount: ((order.requestedDiscount / order.subtotal) * 100).toFixed(0),
      counterOffer: order.counterOffer,
      counterOfferNote: order.counterOfferNote,
      subtotal: order.subtotal,
      counterOfferAmount,
      counterOfferTotal
    })
    
    await email.sendEmail(
      orderUser.email,
      '🤝 Karşı Teklifimiz Var!',
      emailHTML
    )
    
    return c.json({ success: true, order, action: 'counter_offer' })
  }
  
  // Regular approval/rejection flow
  order.status = approved ? 'completed' : 'rejected'
  if (rejectionReason) order.rejectionReason = rejectionReason
  await kv.set(orderId, order)
  
  // Send email notification
  if (approved) {
    // Approved email
    const emailHTML = email.getDiscountApprovalEmailHTML(orderUser.name, {
      discount: ((order.discount / order.subtotal) * 100).toFixed(0),
      subtotal: order.subtotal,
      discountAmount: order.discount,
      total: order.total
    })
    await email.sendEmail(
      orderUser.email,
      '✅ İndirim Talebiniz Onaylandı!',
      emailHTML
    )
    
    // Update user stats
    const newTotalSpent = (orderUser?.totalSpent || 0) + order.total
    const newTier = calculateTier(newTotalSpent)
    
    await kv.set(`user:${order.userId}`, {
      ...orderUser,
      totalSpent: newTotalSpent,
      tier: newTier,
      points: Math.floor(newTotalSpent / 10)
    })
    
    // Clear cart
    await kv.del(`cart:${order.userId}`)
  } else {
    // Rejection email
    const emailHTML = email.getDiscountRejectionEmailHTML(orderUser.name, rejectionReason || '')
    await email.sendEmail(
      orderUser.email,
      'İndirim Talebi Hakkında',
      emailHTML
    )
  }
  
  return c.json({ success: true, order })
})

// Customer accepts or rejects counter offer
app.post('/make-server-ace323ab/orders/:id/counter-offer-response', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const orderId = c.req.param('id')
  const { accepted } = await c.req.json()
  
  const order = await kv.get(orderId)
  if (!order) return c.json({ error: 'Order not found' }, 404)
  if (order.userId !== user.id) return c.json({ error: 'Forbidden' }, 403)
  if (order.status !== 'counter_offer') return c.json({ error: 'No counter offer pending' }, 400)
  
  if (accepted) {
    // Accept counter offer - complete the order with counter offer discount
    order.status = 'completed'
    order.discount = order.counterOfferAmount
    order.total = order.counterOfferTotal
    order.finalDiscountPercentage = order.counterOffer
    
    await kv.set(orderId, order)
    
    // Update user stats
    const userData = await kv.get(`user:${user.id}`)
    const newTotalSpent = (userData?.totalSpent || 0) + order.total
    const newTier = calculateTier(newTotalSpent)
    
    await kv.set(`user:${user.id}`, {
      ...userData,
      totalSpent: newTotalSpent,
      tier: newTier,
      points: Math.floor(newTotalSpent / 10)
    })
    
    // Clear cart
    await kv.del(`cart:${user.id}`)
    
    return c.json({ success: true, order, message: 'Karşı teklif kabul edildi! Siparişiniz tamamlandı.' })
  } else {
    // Reject counter offer - mark as rejected
    order.status = 'counter_offer_rejected'
    await kv.set(orderId, order)
    
    return c.json({ success: true, order, message: 'Karşı teklif reddedildi.' })
  }
})

// Check abandoned carts and send notifications
app.post('/make-server-ace323ab/admin/check-abandoned-carts', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const userData = await kv.get(`user:${user.id}`)
  if (!userData?.isAdmin) return c.json({ error: 'Forbidden' }, 403)
  
  try {
    const allCarts = await kv.getByPrefix('cart:')
    const allProducts = await kv.getByPrefix('product:')
    const now = new Date()
    const abandonedCarts = []
    
    for (const cartData of (allCarts || [])) {
      if (!cartData.items || cartData.items.length === 0) continue
      
      const updatedAt = new Date(cartData.updatedAt)
      const hoursSince = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60)
      
      // If cart not updated in 24 hours
      if (hoursSince >= 24) {
        // Extract userId from key format
        const cartKey = Object.keys(allCarts).find(k => allCarts[k] === cartData)
        const userId = cartKey?.replace('cart:', '')
        const userInfo = await kv.get(`user:${userId}`)
        
        if (userInfo?.email) {
          // Send email
          const emailHTML = email.getAbandonedCartEmailHTML(
            userInfo.name,
            cartData.items,
            allProducts
          )
          
          const emailResult = await email.sendEmail(
            userInfo.email,
            '🛒 Sepetinizdeki Ürünler Sizi Bekliyor!',
            emailHTML
          )
          
          abandonedCarts.push({
            userId,
            email: userInfo?.email,
            cartItems: cartData.items.length,
            hoursSince: Math.floor(hoursSince),
            emailSent: emailResult.success,
            emailError: emailResult.success ? null : emailResult.error
          })
        }
      }
    }
    
    return c.json({ 
      success: true, 
      abandonedCarts,
      totalEmailsSent: abandonedCarts.length
    })
  } catch (error) {
    console.log(`Abandoned cart check error: ${error}`)
    return c.json({ error: 'Failed to check abandoned carts' }, 500)
  }
})

// Get dashboard statistics (admin)
app.get('/make-server-ace323ab/admin/stats', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const userData = await kv.get(`user:${user.id}`)
  if (!userData?.isAdmin) return c.json({ error: 'Forbidden' }, 403)
  
  const orders = await kv.getByPrefix('order:')
  const products = await kv.getByPrefix('product:')
  const users = await kv.getByPrefix('user:')
  
  const completedOrders = (orders || []).filter((o: any) => o.status === 'completed')
  const pendingOrders = (orders || []).filter((o: any) => o.status === 'pending_approval')
  
  const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
  
  // Check for low stock products
  const lowStockProducts = (products || []).filter((p: any) => 
    p.stock <= (p.lowStockThreshold || 10)
  )
  
  return c.json({
    totalOrders: orders?.length || 0,
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
    totalRevenue,
    totalProducts: products?.length || 0,
    totalUsers: users?.length || 0,
    lowStockProducts: lowStockProducts.length,
    lowStockItems: lowStockProducts
  })
})

// Get low stock alert (admin)
app.get('/make-server-ace323ab/admin/low-stock', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const userData = await kv.get(`user:${user.id}`)
  if (!userData?.isAdmin) return c.json({ error: 'Forbidden' }, 403)
  
  const products = await kv.getByPrefix('product:')
  const lowStockProducts = (products || []).filter((p: any) => 
    p.stock <= (p.lowStockThreshold || 10)
  )
  
  return c.json(lowStockProducts)
})

// Initialize payment
app.post('/make-server-ace323ab/payment/initialize', async (c) => {
  const user = await getUser(c.req.raw)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  try {
    const { orderId, shippingAddress, billingAddress } = await c.req.json()
    
    const order = await kv.get(orderId)
    if (!order) return c.json({ error: 'Order not found' }, 404)
    if (order.userId !== user.id) return c.json({ error: 'Forbidden' }, 403)
    
    const userData = await kv.get(`user:${user.id}`)
    
    // Prepare payment data
    const basketItems = order.items.map((item: any) => ({
      id: item.productId,
      name: item.name,
      category: 'Genel',
      price: item.subtotal
    }))
    
    const paymentResult = await payment.initializePayment({
      orderId: order.id,
      price: order.total,
      basketItems,
      buyer: {
        id: user.id,
        name: userData.name.split(' ')[0] || 'Ad',
        surname: userData.name.split(' ')[1] || 'Soyad',
        email: userData.email,
        identityNumber: '11111111111', // Test identity number
        registrationAddress: shippingAddress.address,
        city: shippingAddress.city,
        country: shippingAddress.country
      },
      shippingAddress,
      billingAddress
    })
    
    if (!paymentResult.success) {
      return c.json({ error: paymentResult.error }, 400)
    }
    
    // Store payment token with order
    order.paymentToken = paymentResult.token
    order.paymentStatus = 'pending'
    await kv.set(orderId, order)
    
    return c.json({
      success: true,
      paymentPageUrl: paymentResult.paymentPageUrl,
      token: paymentResult.token
    })
  } catch (error) {
    console.log(`Payment initialization error: ${error}`)
    return c.json({ error: 'Payment initialization failed' }, 500)
  }
})

// Payment callback
app.post('/make-server-ace323ab/payment/callback', async (c) => {
  try {
    const { token } = await c.req.json()
    
    const verificationResult = await payment.verifyPayment(token)
    
    if (!verificationResult.success) {
      return c.json({ error: verificationResult.error }, 400)
    }
    
    // Find order by payment token
    const allOrders = await kv.getByPrefix('order:')
    const order = (allOrders || []).find((o: any) => o.paymentToken === token)
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404)
    }
    
    // Update order status
    order.paymentStatus = verificationResult.paymentStatus
    order.paidAt = new Date().toISOString()
    await kv.set(order.id, order)
    
    // Reduce stock for each product
    for (const item of order.items) {
      const product = await kv.get(item.productId)
      if (product) {
        product.stock = Math.max(0, (product.stock || 0) - item.quantity)
        await kv.set(item.productId, product)
      }
    }
    
    return c.json({ success: true, order })
  } catch (error) {
    console.log(`Payment callback error: ${error}`)
    return c.json({ error: 'Payment callback failed' }, 500)
  }
})

Deno.serve(app.fetch)