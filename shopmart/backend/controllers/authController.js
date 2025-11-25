const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// Import the new mailer function at the top
const { sendOTP, sendResetEmail } = require('../config/mailer'); 

// ... (Keep existing signup/login functions)

// 4. Forgot Password (NEW)
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        // 1. Check if user exists
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found.' });

        // 2. Generate Temporary Password (e.g., "pass-8392")
        const tempPassword = 'pass-' + Math.floor(1000 + Math.random() * 9000);
        
        // 3. Encrypt it (Hash)
        const hashedPassword = await bcrypt.hash(tempPassword, 8);

        // 4. Update Database
        await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        // 5. Send Email (Send the CLEAN password, not the hashed one)
        await sendResetEmail(email, tempPassword);

        res.json({ message: 'Temporary password sent to your email!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error resetting password' });
    }
};
// 1. Signup (With Password Hashing)
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if user exists
        const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'Email already used.' });

        // Encrypt Password
        const hashedPassword = await bcrypt.hash(password, 8);

        // Save User
        await db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
            [name, email, hashedPassword]);
        
        res.status(201).json({ message: 'Account created! Please Login.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating account' });
    }
};

// 2. Login (Check Email & Password)
// 2. Login (Updated with Online Status Tracking)
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        if (user.isBanned) {
            return res.status(403).json({ message: '🚫 Your account has been suspended.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Invalid Password' });

        // --- NEW: UPDATE LAST LOGIN TIME ---
        await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
        // -----------------------------------

        const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ 
            token, 
            user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin, dp: user.dp } 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Login error' });
    }
};
// 3. Profile Functions (Keep these)
exports.getProfile = async (req, res) => { 
    try { 
        const [u] = await db.execute('SELECT id, name, email, dp, isAdmin FROM users WHERE id = ?', [req.userId]); 
        res.json(u[0]); 
    } catch (err) { res.status(500).json({ message: 'Error' }); } 
};

exports.updateProfile = async (req, res) => { 
    const { name } = req.body; // Removed email update to prevent conflicts
    const dp = req.file ? req.file.filename : null; 
    const userId = req.userId;
    try { 
        if (dp) await db.execute('UPDATE users SET name=?, dp=? WHERE id=?', [name, dp, userId]); 
        else await db.execute('UPDATE users SET name=? WHERE id=?', [name, userId]); 
        res.json({ message: 'Profile updated' }); 
    } catch (err) { res.status(500).json({ message: 'Error' }); } 
};

// ... (Keep existing functions)

// 6. Change Password (Logged In User)
exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;

    try {
        // 1. Get User
        const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
        const user = users[0];

        // 2. Verify Old Password
        const validPassword = await bcrypt.compare(oldPassword, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Current password is incorrect.' });

        // 3. Hash New Password
        const hashedNewPassword = await bcrypt.hash(newPassword, 8);

        // 4. Update DB
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

        res.json({ message: 'Password changed successfully!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error changing password' });
    }
};


// 6. Get All Users (Include Last Login)
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, name, email, created_at, isBanned, last_login FROM users WHERE isAdmin = 0 ORDER BY last_login DESC'
        );
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};