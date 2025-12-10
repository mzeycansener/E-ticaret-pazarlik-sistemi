// Fronten takliti yaptık
const fetch = require('node-fetch'); 


const API_URL = 'http://localhost:3000/api';

async function runTests() {
    const ironUserId = '11111111-1111-1111-1111-111111111111';
    const goldUserId = '22222222-2222-2222-2222-222222222222';

    console.log("--- TEST 1: DEMİR ÜYE İNDİRİMİ ---");
    const response1 = await fetch(`${API_URL}/cart/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: ironUserId, cartTotal: 2000 }) 
    });
    const data1 = await response1.json();
    console.log("Sonuç:", data1); 
    // Beklenen: %3 indirim yapılmış fiyat.

    console.log("\n--- TEST 2: ALTIN ÜYE PAZARLIĞI ---");
    // 1. Önce fiyatı gör (İndirim olmamalı, pazarlık hakkı olmalı)
    const response2 = await fetch(`${API_URL}/cart/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: goldUserId, cartTotal: 2000 })
    });
    const data2 = await response2.json();
    console.log("Fiyat Sorgusu:", data2);
    
    // 2. Pazarlık Teklifi Gönder
    if (data2.canBargain) {
        console.log(">> Pazarlık teklifi gönderiliyor...");
        const response3 = await fetch(`${API_URL}/bargain/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: goldUserId,
                cartId: 1, 
                originalPrice: 2000,
                offeredPrice: 1750 
            })
        });
        const data3 = await response3.json();
        console.log("Teklif Sonucu:", data3);
    }
}

runTests();