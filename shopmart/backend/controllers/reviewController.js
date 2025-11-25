const db = require('../config/db');

// 1. Add a Review
exports.addReview = async (req, res) => {
    const { product_id, rating, comment } = req.body;
    const user_id = req.userId;

    try {
        await db.execute(
            'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
            [user_id, product_id, rating, comment]
        );
        res.status(201).json({ message: 'Review added successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding review' });
    }
};

// 2. Get Reviews for a Product
exports.getProductReviews = async (req, res) => {
    try {
        const sql = `
            SELECT reviews.*, users.name as user_name 
            FROM reviews 
            JOIN users ON reviews.user_id = users.id 
            WHERE product_id = ? 
            ORDER BY created_at DESC
        `;
        const [reviews] = await db.execute(sql, [req.params.id]);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
};