const db = require('../config/db');

// 1. User makes an offer
exports.makeOffer = async (req, res) => {
    const { product_id, offer_price } = req.body;
    const userId = req.userId;

    try {
        await db.execute(
            'INSERT INTO offers (user_id, product_id, offer_price) VALUES (?, ?, ?)', 
            [userId, product_id, offer_price]
        );
        res.status(201).json({ message: 'Offer sent to seller!' });
    } catch (err) {
        res.status(500).json({ message: 'Error sending offer' });
    }
};

// 2. Admin sees all offers
exports.getAllOffers = async (req, res) => {
    try {
        // Detailed join to see User Name and Product Title
        const sql = `
            SELECT offers.id, offers.offer_price, offers.status, 
                   users.name as user_name, 
                   products.title as product_title, products.price as original_price
            FROM offers
            JOIN users ON offers.user_id = users.id
            JOIN products ON offers.product_id = products.id
            WHERE offers.status = 'pending'
            ORDER BY offers.created_at DESC
        `;
        const [offers] = await db.execute(sql);
        res.json(offers);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching offers' });
    }
};

// 3. Admin Responds (Accept/Reject)
exports.respondToOffer = async (req, res) => {
    const { status } = req.body; // 'accepted' or 'rejected'
    const offerId = req.params.id;

    try {
        await db.execute('UPDATE offers SET status = ? WHERE id = ?', [status, offerId]);
        res.json({ message: `Offer ${status}` });
    } catch (err) {
        res.status(500).json({ message: 'Error updating offer' });
    }
};

// 4. User sees their offers
exports.getMyOffers = async (req, res) => {
    try {
        const sql = `
            SELECT offers.*, products.title, products.image 
            FROM offers 
            JOIN products ON offers.product_id = products.id
            WHERE offers.user_id = ?
            ORDER BY offers.created_at DESC
        `;
        const [offers] = await db.execute(sql, [req.userId]);
        res.json(offers);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching your offers' });
    }
};