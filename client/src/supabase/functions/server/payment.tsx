import * as crypto from "node:crypto"

const IYZICO_API_KEY = Deno.env.get('IYZICO_API_KEY')
const IYZICO_SECRET_KEY = Deno.env.get('IYZICO_SECRET_KEY')
const IYZICO_BASE_URL = 'https://sandbox-api.iyzipay.com' // Use production URL in production

// Generate authorization header for iyzico
function generateAuthHeader(url: string, body: any): string {
  const randomString = crypto.randomBytes(16).toString('hex')
  const bodyString = JSON.stringify(body)
  
  const dataToSign = randomString + url + bodyString
  const signature = crypto
    .createHmac('sha256', IYZICO_SECRET_KEY!)
    .update(dataToSign)
    .digest('base64')
  
  const authString = `apiKey:${IYZICO_API_KEY}&randomKey:${randomString}&signature:${signature}`
  return `IYZWS ${authString}`
}

export async function initializePayment(orderData: {
  orderId: string
  price: number
  basketItems: Array<{
    id: string
    name: string
    category: string
    price: number
  }>
  buyer: {
    id: string
    name: string
    surname: string
    email: string
    identityNumber: string
    registrationAddress: string
    city: string
    country: string
  }
  shippingAddress: {
    address: string
    city: string
    country: string
  }
  billingAddress: {
    address: string
    city: string
    country: string
  }
}) {
  try {
    const url = '/payment/auth'
    const body = {
      locale: 'tr',
      conversationId: orderData.orderId,
      price: orderData.price.toFixed(2),
      paidPrice: orderData.price.toFixed(2),
      currency: 'TRY',
      basketId: orderData.orderId,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-ace323ab/payment/callback`,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: orderData.buyer.id,
        name: orderData.buyer.name,
        surname: orderData.buyer.surname,
        gsmNumber: '+905350000000',
        email: orderData.buyer.email,
        identityNumber: orderData.buyer.identityNumber,
        lastLoginDate: new Date().toISOString(),
        registrationDate: new Date().toISOString(),
        registrationAddress: orderData.buyer.registrationAddress,
        ip: '85.34.78.112',
        city: orderData.buyer.city,
        country: orderData.buyer.country,
        zipCode: '34732'
      },
      shippingAddress: {
        contactName: `${orderData.buyer.name} ${orderData.buyer.surname}`,
        city: orderData.shippingAddress.city,
        country: orderData.shippingAddress.country,
        address: orderData.shippingAddress.address,
        zipCode: '34732'
      },
      billingAddress: {
        contactName: `${orderData.buyer.name} ${orderData.buyer.surname}`,
        city: orderData.billingAddress.city,
        country: orderData.billingAddress.country,
        address: orderData.billingAddress.address,
        zipCode: '34732'
      },
      basketItems: orderData.basketItems.map(item => ({
        id: item.id,
        name: item.name,
        category1: item.category,
        itemType: 'PHYSICAL',
        price: item.price.toFixed(2)
      }))
    }
    
    const authHeader = generateAuthHeader(url, body)
    
    const response = await fetch(`${IYZICO_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    
    if (data.status !== 'success') {
      console.error('iyzico payment initialization error:', data)
      return { success: false, error: data.errorMessage || 'Payment initialization failed' }
    }
    
    return {
      success: true,
      paymentPageUrl: data.paymentPageUrl,
      token: data.token
    }
  } catch (error) {
    console.error('iyzico payment exception:', error)
    return { success: false, error: 'Payment initialization failed' }
  }
}

export async function verifyPayment(token: string) {
  try {
    const url = '/payment/detail'
    const body = {
      locale: 'tr',
      conversationId: token,
      token
    }
    
    const authHeader = generateAuthHeader(url, body)
    
    const response = await fetch(`${IYZICO_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    
    if (data.status !== 'success') {
      console.error('iyzico payment verification error:', data)
      return { success: false, error: data.errorMessage || 'Payment verification failed' }
    }
    
    return {
      success: true,
      paymentStatus: data.paymentStatus,
      fraudStatus: data.fraudStatus,
      conversationId: data.conversationId
    }
  } catch (error) {
    console.error('iyzico payment verification exception:', error)
    return { success: false, error: 'Payment verification failed' }
  }
}
