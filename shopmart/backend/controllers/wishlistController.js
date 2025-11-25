const db = require('../config/db');

// 1. Toggle Wishlist (Add/Remove)
exports.toggleWishlist = async (req, res) => {
    const { product_id } = req.body;
    const user_id = req.userId;

    try {
        // Check if already exists
        const [existing] = await db.execute(
            'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?', 
            [user_id, product_id]
        );

        if (existing.length > 0) {
            // Remove
            await db.execute('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [user_id, product_id]);
            res.json({ message: 'Removed from Wishlist', action: 'removed' });
        } else {
            // Add
            await db.execute('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [user_id, product_id]);
            res.json({ message: 'Added to Wishlist', action: 'added' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error updating wishlist' });
    }
};

// 2. Get My Wishlist (With Product Details)
exports.getMyWishlist = async (req, res) => {
    const user_id = req.userId;
    try {
        const sql = `
            SELECT products.* FROM wishlist 
            JOIN products ON wishlist.product_id = products.id 
            WHERE wishlist.user_id = ?
            ORDER BY wishlist.created_at DESC
        `;
        const [items] = await db.execute(sql, [user_id]);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching wishlist' });
    }
};

// 3. Get Array of Wishlisted IDs (To color hearts red on load)
exports.getWishlistIds = async (req, res) => {
    const user_id = req.userId;
    try {
        const [rows] = await db.execute('SELECT product_id FROM wishlist WHERE user_id = ?', [user_id]);
        const ids = rows.map(row => row.product_id);
        res.json(ids);
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
};