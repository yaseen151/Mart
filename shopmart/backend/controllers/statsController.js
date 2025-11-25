const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Revenue & Orders
        const [orderData] = await db.execute('SELECT SUM(total_price) as revenue, COUNT(*) as total_orders FROM orders');

        // 2. Total Registered Users
        const [userData] = await db.execute('SELECT COUNT(*) as total_users FROM users WHERE isAdmin = 0');

        // 3. NEW: Count Active Users (Logged in within last 10 mins)
        const [activeData] = await db.execute(
            'SELECT COUNT(*) as active_users FROM users WHERE isAdmin = 0 AND last_login > (NOW() - INTERVAL 10 MINUTE)'
        );

        // 4. Offer Stats
        const [offerData] = await db.execute('SELECT status, COUNT(*) as count FROM offers GROUP BY status');

        res.json({
            revenue: orderData[0].revenue || 0,
            total_orders: orderData[0].total_orders,
            total_users: userData[0].total_users,
            active_now: activeData[0].active_users, // <--- Sending this new number
            offer_stats: offerData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};