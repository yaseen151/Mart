const db = require('../config/db');
const { sendInvoice } = require('../config/mailer');

// 1. Create Order & Send Detailed Invoice
exports.createOrder = async (req, res) => {
    // FIX: Using req.user.id (from the verified token)
    const userId = req.user.id;
    const { total_price, address, items } = req.body;

    try {
        // A. Get User Email & Name for the invoice
        const [userResult] = await db.execute('SELECT email, name FROM users WHERE id = ?', [userId]);
        if (userResult.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const userEmail = userResult[0].email;
        const userName = userResult[0].name;

        // B. Save Order to DB (Storing items as JSON string)
        const itemsJson = JSON.stringify(items);
        const [result] = await db.execute(
            'INSERT INTO orders (user_id, total_price, address, items, status, created_at) VALUES (?, ?, ?, ?, "Processing", NOW())',
            [userId, total_price, address, itemsJson]
        );

        // C. SEND DETAILED EMAIL 📧
        // Passing userName and address to the mailer function
        if (typeof sendInvoice === 'function') {
             await sendInvoice(userEmail, userName, result.insertId, total_price, items, address);
        }

        res.status(201).json({ message: 'Order placed successfully! Check your email.' });

    } catch (err) {
        console.error("Create Order Error:", err);
        res.status(500).json({ message: 'Error placing order' });
    }
};

// 2. Get My Orders (User)
exports.getMyOrders = async (req, res) => {
    try {
        // FIX: Using req.user.id
        const [orders] = await db.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(orders);
    } catch (err) { 
        console.error("Get My Orders Error:", err);
        res.status(500).json({ message: 'Error loading orders' }); 
    }
};

// 3. Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const sql = `SELECT orders.*, users.name as user_name, users.email 
                     FROM orders 
                     JOIN users ON orders.user_id = users.id 
                     ORDER BY orders.created_at DESC`;
        const [orders] = await db.execute(sql);
        res.json(orders);
    } catch (err) { 
        console.error("Get All Orders Error:", err);
        res.status(500).json({ message: 'Error fetching orders' }); 
    }
};

// 4. Update Order Status (Admin)
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    try {
        await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
        res.json({ message: `Order status updated to ${status}` });
    } catch (err) {
        console.error("Update Status Error:", err);
        res.status(500).json({ message: 'Error updating status' });
    }
};

// 5. Cancel Order (User Action)
exports.cancelOrder = async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id; // FIX: Using req.user.id

    try {
        // Check current status first
        const [order] = await db.execute('SELECT status FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
        
        if (order.length === 0) return res.status(404).json({ message: "Order not found" });
        
        // Only allow cancellation if it's still processing
        if (order[0].status !== 'Processing') {
            return res.status(400).json({ message: "Cannot cancel order. It is already shipped or delivered." });
        }

        // Update status
        await db.execute('UPDATE orders SET status = "Cancelled" WHERE id = ?', [orderId]);
        res.json({ message: "Order Cancelled Successfully" });

    } catch (err) {
        console.error("Cancel Order Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// 6. Return Order (User Action)
exports.returnOrder = async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id; // FIX: Using req.user.id

    try {
        const [order] = await db.execute('SELECT status FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);

        if (order.length === 0) return res.status(404).json({ message: "Order not found" });
        
        // Only allow return if it was delivered
        if (order[0].status !== 'Delivered') {
            return res.status(400).json({ message: "You can only return delivered items." });
        }

        // Update status to 'Return Requested'
        await db.execute('UPDATE orders SET status = "Return Requested" WHERE id = ?', [orderId]);
        res.json({ message: "Return Request Submitted. Admin will review." });

    } catch (err) {
        console.error("Return Order Error:", err);
        res.status(500).json({ error: err.message });
    }
};