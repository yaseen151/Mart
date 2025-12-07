const db = require('../config/db');
const { sendInvoice } = require('../config/mailer'); // <--- Import Mailer

// 1. Create Order
// 1. Create Order & Send Detailed Invoice
exports.createOrder = async (req, res) => {
    const { total_price, address, items } = req.body;
    const userId = req.userId;

    try {
        // A. Get User Email
        const [userResult] = await db.execute('SELECT email, name FROM users WHERE id = ?', [userId]);
        if (userResult.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const userEmail = userResult[0].email;
        const userName = userResult[0].name;

        // B. Save Order to DB
        const itemsJson = JSON.stringify(items);
        const [result] = await db.execute(
            'INSERT INTO orders (user_id, total_price, address, items) VALUES (?, ?, ?, ?)',
            [userId, total_price, address, itemsJson]
        );

        // C. SEND DETAILED EMAIL 📧
        // Note: We are now passing 'userName' and 'address' too!
        sendInvoice(userEmail, userName, result.insertId, total_price, items, address);

        res.status(201).json({ message: 'Order placed successfully! Check your email.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error placing order' });
    }
};
// 2. Get My Orders
exports.getMyOrders = async (req, res) => {
    try {
        const [orders] = await db.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
        res.json(orders);
    } catch (err) { res.status(500).json({ message: 'Error' }); }
};

// 3. Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const sql = `SELECT orders.*, users.name as user_name, users.email FROM orders JOIN users ON orders.user_id = users.id ORDER BY orders.created_at DESC`;
        const [orders] = await db.execute(sql);
        res.json(orders);
    } catch (err) { res.status(500).json({ message: 'Error' }); }
};

// ... existing code ...

// 4. Update Order Status (Admin)
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    try {
        await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
        
        // Optional: Send email here if you want ("Your order has shipped!")
        
        res.json({ message: `Order status updated to ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating status' });
    }
};