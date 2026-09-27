const db = require('../config/db');

exports.handleChat = async (req, res) => {
    const { message } = req.body;
    const userId = req.user ? req.user.id : null;
    const msg = message.toLowerCase();
    
    // 1. SIMULATE AI THINKING (Makes it look real)
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        let reply = "";

        // 2. ORDER TRACKING LOGIC (Real Database Connection)
        if (msg.includes('order') || msg.includes('track') || msg.includes('status') || msg.includes('where')) {
            if (!userId) {
                reply = "I can't check your orders because you aren't logged in! 🔒 Please login first.";
            } else {
                // Queries your MySQL database
                const [orders] = await db.execute(
                    'SELECT id, status, total_price FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1', 
                    [userId]
                );
                
                if (orders.length > 0) {
                    const o = orders[0];
                    // "AI-style" response variations
                    const responses = [
                        `📦 I checked our records. Order #${o.id} is currently **${o.status}**.`,
                        `Hey Junaid! Your latest order (#${o.id}) is marked as **${o.status}**.`,
                        `Update: Order #${o.id} (₹${o.total_price}) is **${o.status}**. It will be with you soon! 🚀`
                    ];
                    reply = responses[Math.floor(Math.random() * responses.length)];
                } else {
                    reply = "I checked the database, but you haven't placed any orders yet. Start shopping! 🛍️";
                }
            }
        }

        // 3. PRICE CHECKING LOGIC (Dynamic Search)
        else if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
            // Extracts product name from sentence
            const search = msg.replace('price', '').replace('cost', '').replace('of', '').replace('is', '').replace('the', '').replace('how much', '').trim();
            
            if (search.length < 2) {
                reply = "I can check prices! Just ask: 'Price of Camera' or 'Cost of Watch'.";
            } else {
                const [products] = await db.execute('SELECT title, price FROM products WHERE title LIKE ? LIMIT 1', [`%${search}%`]);
                
                if (products.length > 0) {
                    reply = `💰 The **${products[0].title}** costs **₹${products[0].price}**. It's a great choice!`;
                } else {
                    reply = `I searched inventory for "${search}" but couldn't find it. Try searching for 'Camera' or 'Watch'.`;
                }
            }
        }

        // 4. CONVERSATIONAL LOGIC (The "AI" Personality)
        else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
            reply = "Hello! 👋 I'm the ShopMart AI Assistant. I can help you track orders or check prices!";
        }
        else if (msg.includes('thank')) {
            reply = "You're very welcome! Happy Shopping! 🥰";
        }
        else if (msg.includes('who are you') || msg.includes('bot')) {
            reply = "I am a custom AI assistant built by **Shaikh Junaid** for his Third year project! 🤖";
        }
        else {
            reply = "I'm trained to assist with Orders and Prices. 🧠\nTry asking: 'Where is my order?'";
        }

        res.json({ reply });

    } catch (err) {
        console.error("Chat Error:", err);
        res.json({ reply: "System is syncing. Please try again! 🤕" });
    }
};