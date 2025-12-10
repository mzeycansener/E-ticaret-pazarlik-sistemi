
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function seedData() {
    console.log("Veriler temizleniyor ve ekleniyor...");

    try {
        
        await supabase.from('bargain_requests').delete().neq('id', 0);
        await supabase.from('cart_items').delete().neq('id', 0);
        await supabase.from('carts').delete().neq('id', 0); 
        // Ürün ve profilleri silmeye gerek yok, varsa kalsın.

        
        const goldUserId = '22222222-2222-2222-2222-222222222222';
        await supabase.from('profiles').upsert({
            id: goldUserId, email: 'altin@musteri.com', role: 'customer', loyalty_points: 6000, tier: 'altin'
        });

        
        
        const { error: cartError } = await supabase.from('carts').insert([
            { id: 1, user_id: goldUserId, is_active: true }
        ]);

        if (cartError) {
            console.log("⚠️ Sepet zaten var veya eklenirken hata oldu (önemsiz):", cartError.message);
        } else {
            console.log("✅ 1 Numaralı Test Sepeti Oluşturuldu!");
        }

        console.log("Veri yükleme tamamlandı.");

    } catch (err) {
        console.error("Hata:", err);
    }
}

seedData();