const db = require('../config/db');

// 1. Get Saved Cards for User
exports.getSavedCards = async (req, res) => {
    try {
        const [cards] = await db.execute('SELECT * FROM saved_cards WHERE user_id = ?', [req.user.id]);
        res.json(cards);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching cards' });
    }
};

// 2. Save a New Card
exports.saveCard = async (req, res) => {
    const { cardNumber, cardHolder, expiry, cardType } = req.body;
    const userId = req.user.id;

    try {
        // Simple check to avoid duplicates (optional)
        const [existing] = await db.execute('SELECT * FROM saved_cards WHERE user_id = ? AND card_number = ?', [userId, cardNumber]);
        if (existing.length > 0) return res.json({ message: "Card already saved" });

        await db.execute(
            'INSERT INTO saved_cards (user_id, card_number, card_holder, expiry, card_type) VALUES (?, ?, ?, ?, ?)',
            [userId, cardNumber, cardHolder, expiry, cardType || 'Visa']
        );
        res.status(201).json({ message: 'Card saved securely!' });
    } catch (err) {
        res.status(500).json({ message: 'Error saving card' });
    }
};