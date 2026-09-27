const db = require('../config/db');

// 1. Save a Coupon (Called when user wins Spin)
exports.saveCoupon = async (req, res) => {
    const { code, description } = req.body;
    
    // FIX: Using req.user.id (from the verified token)
    const userId = req.user.id; 

    try {
        // A. Check if user already has this specific coupon active
        const [existing] = await db.execute(
            'SELECT * FROM user_coupons WHERE user_id = ? AND code = ? AND is_used = 0', 
            [userId, code]
        );

        if (existing.length > 0) {
            return res.status(200).json({ message: 'You already have this coupon!' });
        }

        // B. Save to Database
        // FIX: Changed column 'discount_desc' to 'description' to match your database table
        await db.execute(
            'INSERT INTO user_coupons (user_id, code, description, is_used, created_at) VALUES (?, ?, ?, 0, NOW())',
            [userId, code, description]
        );

        res.status(201).json({ message: 'Coupon saved to your Profile!' });
        
    } catch (err) {
        console.error("Save Coupon Error:", err);
        res.status(500).json({ message: 'Error saving coupon' });
    }
};

// 2. Get My Coupons (For Profile Page)
exports.getMyCoupons = async (req, res) => {
    try {
        // FIX: Using req.user.id
        const [coupons] = await db.execute(
            'SELECT * FROM user_coupons WHERE user_id = ? AND is_used = 0 ORDER BY created_at DESC', 
            [req.user.id]
        );
        res.json(coupons);
    } catch (err) {
        console.error("Get Coupons Error:", err);
        res.status(500).json({ message: 'Error fetching coupons' });
    }
};

// 3. Validate Coupon (Used at Checkout)
exports.validateCoupon = async (req, res) => {
    const { code } = req.body;
    
    // Define valid codes and their discount %
    // You can add more codes here easily
    const validCoupons = {
        'VINTAGE20': 20, // 20% Off
        'SAVE10': 10,    // 10% Off
        'HELLO5': 5,     // 5% Off
        'FREESHIP': 0,   // Free Shipping
        'MYSTERY': 15    // 15% Off for Mystery win
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