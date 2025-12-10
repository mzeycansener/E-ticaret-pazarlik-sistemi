const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'onboarding@resend.dev' // Resend test email
const ENABLE_EMAIL = Deno.env.get('ENABLE_EMAIL') !== 'false' // Set to 'false' to disable emails

export async function sendEmail(to: string, subject: string, html: string) {
  // Check if email is disabled (for development)
  if (!ENABLE_EMAIL) {
    console.log('📧 Email sending is disabled (development mode)')
    console.log('To:', to)
    console.log('Subject:', subject)
    return { success: true, data: { message: 'Email disabled in development' } }
  }

  // Check if API key exists
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in environment variables')
    console.error('Please add your Resend API key to environment variables')
    console.error('Get your API key from: https://resend.com/api-keys')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ Email send error:', {
        statusCode: response.status,
        error: data,
        to,
        subject,
        hint: response.status === 401 
          ? 'Invalid API key. Please check your RESEND_API_KEY environment variable' 
          : 'Check Resend API documentation for more details'
      })
      return { success: false, error: data }
    }

    console.log('✅ Email sent successfully to:', to)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Email send exception:', error)
    return { success: false, error }
  }
}

export function getAbandonedCartEmailHTML(userName: string, cartItems: any[], products: any[]) {
  const itemsHTML = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId)
    if (!product) return ''
    
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <img src="${product.image}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${product.name}</strong><br>
          <span style="color: #6b7280;">${item.quantity} adet</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ${(product.price * item.quantity).toFixed(2)} ₺
        </td>
      </tr>
    `
  }).join('')

  const total = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)
    return sum + (product ? product.price * item.quantity : 0)
  }, 0)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">✨ Sepetiniz Sizi Bekliyor!</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Merhaba ${userName},</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <p style="color: #374151; line-height: 1.6; margin-top: 0;">
            Sepetinizde unuttuğunuz ürünler var! Size özel fırsatları kaçırmayın ve alışverişinizi tamamlayın.
          </p>

          <!-- Cart Items -->
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            ${itemsHTML}
            <tr>
              <td colspan="2" style="padding: 16px 12px; text-align: right; font-weight: bold;">Toplam:</td>
              <td style="padding: 16px 12px; text-align: right; font-weight: bold; color: #667eea; font-size: 18px;">${total.toFixed(2)} ₺</td>
            </tr>
          </table>

          <!-- Special Offer -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 8px;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">
              🎁 <strong>Özel Teklif:</strong> Kademenize göre özel indirimlerden yararlanın!
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://yourstore.com" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Sepetime Dön
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
            Bu ürünler sınırlı stokta! Hemen alışverişinizi tamamlayarak kaçırmayın.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2024 Butik Mağaza. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getDiscountApprovalEmailHTML(userName: string, orderDetails: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">✅ İndirim Talebiniz Onaylandı!</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Merhaba ${userName},</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <p style="color: #374151; line-height: 1.6; margin-top: 0;">
            Harika haberlerimiz var! İndirim teklifiniz onaylandı. Siparişiniz başarıyla oluşturuldu.
          </p>

          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 8px;">
            <p style="margin: 0; color: #065f46;">
              🎉 <strong>%${orderDetails.discount} İndirim</strong> kazandınız!
            </p>
          </div>

          <table style="width: 100%; margin: 24px 0;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Sipariş Tutarı:</td>
              <td style="padding: 8px 0; text-align: right;">${orderDetails.subtotal?.toFixed(2)} ₺</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #10b981; font-weight: 600;">İndirim:</td>
              <td style="padding: 8px 0; text-align: right; color: #10b981; font-weight: 600;">-${orderDetails.discountAmount?.toFixed(2)} ₺</td>
            </tr>
            <tr style="border-top: 2px solid #e5e7eb;">
              <td style="padding: 16px 0; font-weight: bold; font-size: 18px;">Ödenecek Tutar:</td>
              <td style="padding: 16px 0; text-align: right; font-weight: bold; font-size: 18px; color: #667eea;">${orderDetails.total?.toFixed(2)} ₺</td>
            </tr>
          </table>

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://yourstore.com/orders" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Siparişimi Görüntüle
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2024 Butik Mağaza. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getDiscountRejectionEmailHTML(userName: string, reason: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0;">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">İndirim Talebi Hakkında</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Merhaba ${userName},</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <p style="color: #374151; line-height: 1.6; margin-top: 0;">
            Maalesef indirim teklifiniz bu sefer onaylanamadı.
          </p>

          ${reason ? `
            <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 8px;">
              <p style="margin: 0; color: #991b1b;">
                <strong>Neden:</strong> ${reason}
              </p>
            </div>
          ` : ''}

          <p style="color: #374151; line-height: 1.6;">
            Farklı bir indirim oranı ile tekrar deneyebilir veya mevcut kademe indiriminizden yararlanabilirsiniz.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://yourstore.com/cart" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Sepetime Dön
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2024 Butik Mağaza. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getCounterOfferEmailHTML(userName: string, orderDetails: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🤝 Karşı Teklifimiz Var!</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Merhaba ${userName},</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <p style="color: #374151; line-height: 1.6; margin-top: 0;">
            İndirim teklifinizi değerlendirdik. Size özel bir karşı teklifimiz var!
          </p>

          <!-- Original vs Counter Offer Comparison -->
          <div style="background-color: #fef3c7; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <div style="margin-bottom: 16px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">Sizin Teklifiniz:</p>
              <p style="color: #78350f; margin: 4px 0 0; font-size: 24px; text-decoration: line-through; opacity: 0.6;">
                %${orderDetails.requestedDiscount}
              </p>
            </div>
            <div style="border-top: 2px dashed #fbbf24; margin: 16px 0;"></div>
            <div>
              <p style="color: #92400e; margin: 0; font-size: 14px;">Karşı Teklifimiz:</p>
              <p style="color: #78350f; margin: 4px 0 0; font-size: 32px; font-weight: bold;">
                %${orderDetails.counterOffer} 🎁
              </p>
            </div>
          </div>

          ${orderDetails.counterOfferNote ? `
            <div style="background-color: #e0e7ff; border-left: 4px solid #6366f1; padding: 16px; margin: 24px 0; border-radius: 8px;">
              <p style="margin: 0; color: #3730a3;">
                <strong>Not:</strong> ${orderDetails.counterOfferNote}
              </p>
            </div>
          ` : ''}

          <!-- Order Details -->
          <table style="width: 100%; margin: 24px 0; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; color: #6b7280;">Sepet Tutarı:</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600;">${orderDetails.subtotal?.toFixed(2)} ₺</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; color: #f59e0b; font-weight: 600;">Karşı Teklif İndirimi (%${orderDetails.counterOffer}):</td>
              <td style="padding: 12px 0; text-align: right; color: #f59e0b; font-weight: 600;">-${orderDetails.counterOfferAmount?.toFixed(2)} ₺</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 16px 0; font-weight: bold; font-size: 18px;">Ödenecek Tutar:</td>
              <td style="padding: 16px 0; text-align: right; font-weight: bold; font-size: 20px; color: #667eea;">${orderDetails.counterOfferTotal?.toFixed(2)} ₺</td>
            </tr>
          </table>

          <p style="color: #374151; line-height: 1.6; text-align: center; margin: 32px 0;">
            Bu teklifi kabul ediyor musunuz?
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://yourstore.com/orders" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 8px;">
              ✅ Kabul Et
            </a>
            <a href="https://yourstore.com/orders" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              ❌ Reddet
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center; margin-top: 32px;">
            Siparişlerim sayfanızdan teklife cevap verebilirsiniz.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2024 Butik Mağaza. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}