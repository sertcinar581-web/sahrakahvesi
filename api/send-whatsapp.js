export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = req.body || {};
        const customerName = body.customerName || 'Test Müşteri';
        const customerPhone = body.customerPhone || '05000000000';
        const customerAddress = body.customerAddress || 'Test Adresi';
        const orderTotal = body.orderTotal || '₺0,00';
        const cartItems = body.cartItems || 'Ürün bulunamadı';

        const messageText = `🔔 *Yeni Sipariş Geldi!* (Sahra Kahvesi)\n\n` +
                            `👤 *Ad Soyad:* ${customerName}\n` +
                            `📞 *Telefon:* ${customerPhone}\n` +
                            `🛍️ *Ürünler:* ${cartItems}\n` +
                            `💰 *Toplam Tutar:* ${orderTotal}\n` +
                            `📍 *Adres:* ${customerAddress}`;

        // Yeni instance ve token bilgileri
        const idInstance = "710722735101"; 
        const apiTokenInstance = "a720c4dd386944f290da5cc47f11635238073d3eafe84550b2";             
        const recipientPhone = "905362475778";

        const url = `https://7107.api.greenapi.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
        
        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatId: `${recipientPhone}@c.us`,
                message: messageText
            })
        });

        const responseText = await apiResponse.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            result = { rawResponse: responseText };
        }

        if (!apiResponse.ok) {
            return res.status(apiResponse.status).json({ success: false, error: result });
        }

        return res.status(200).json({ success: true, result });
    } catch (error) {
        console.error("Vercel Fonksiyon Hatası:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}