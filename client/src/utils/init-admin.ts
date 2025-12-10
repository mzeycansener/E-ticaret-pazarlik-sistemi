// Burayı yönetici hesabı oluşturmak için kullancaz
// Kayıt olduktan sonra backend'de manuel olarak isAdmin: true yapcaz

export const ADMIN_INSTRUCTIONS = `
YÖNETICI HESABI OLUŞTURMA:

1. Önce normal bir hesap oluşturun (kayıt olun)
2. E-posta: admin@butik.com
3. Şifre: Admin123!
4. Ad: Yönetici

Not: Sistem ilk başlatıldığında otomatik olarak admin@butik.com hesabına
yönetici yetkisi verilecektir. Diğer kullanıcılar müşteri olarak kaydolacaktır.

TEST HESAPLARI:
- Yönetici: admin@butik.com / Admin123!
- Müşteri: musteri@test.com / Test123!
`

console.log(ADMIN_INSTRUCTIONS)
