const db = require('../config/db');

// 1. Save a Coupon (Called when user wins Spin)
exports.saveCoupon = async (req, res) => {
    const { code, description } = req.body;
    const userId = req.userId;

    try {
        // Optional: Check if user already has this specific coupon active
        const [existing] = await db.execute(
            'SELECT * FROM user_coupons WHERE user_id = ? AND code = ? AND is_used = 0', 
            [userId, code]
        );

        if (existing.length > 0) {
            return res.status(200).json({ message: 'You already have this coupon!' });
        }

        await db.execute(
            'INSERT INTO user_coupons (user_id, code, discount_desc) VALUES (?, ?, ?)',
            [userId, code, description]
        );

        res.status(201).json({ message: 'Coupon saved to your Profile!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error saving coupon' });
    }
};

// 2. Get My Coupons (For Profile Page)
exports.getMyCoupons = async (req, res) => {
    try {
        const [coupons] = await db.execute(
            'SELECT * FROM user_coupons WHERE user_id = ? AND is_used = 0 ORDER BY created_at DESC', 
            [req.userId]
        );
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching coupons' });
    }
};

// 3. Validate Coupon (Used at Checkout)
exports.validateCoupon = async (req, res) => {
    const { code } = req.body;
    
    // Define valid codes and their discount %
    const validCoupons = {
        'VINTAGE20': 20, // 20% Off
        'SAVE10': 10,    // 10% Off
        'HELLO5': 5,     // 5% Off
        'FREESHIP': 0    // (Logic for free ship handled on frontend if needed)
    };

    if (validCoupons.hasOwnProperty(code)) {
        res.json({ 
            success: true, 
            discountPercent: validCoupons[code], 
            message: `Coupon Applied! ${validCoupons[code]}% Off` 
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid Coupon Code' });
    }
};