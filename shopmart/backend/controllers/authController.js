const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// FIX: Imported 'sendLoginOTP' correctly (matching mailer.js)
const { sendLoginOTP, sendOtpEmail } = require('../config/mailer');

// 1. Signup
exports.signup = async (req, res) => {
    const { name, email, password, mobile } = req.body;
    try {
        const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'Email already used.' });

        const hashedPassword = await bcrypt.hash(password, 8);
        await db.execute(
            'INSERT INTO users (name, email, password, mobile, isBanned, last_login) VALUES (?, ?, ?, ?, 0, NOW())', 
            [name, email, hashedPassword, mobile]
        );
        res.status(201).json({ message: 'Account created! Please Login.' });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Error creating account' }); 
    }
};

// 2. Login (Password)
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        if (user.isBanned) return res.status(403).json({ message: '🚫 Account suspended.' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Invalid Password' });

        await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
        
        const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, isAdmin: user.isAdmin, dp: user.dp } });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Login error' }); 
    }
};

// --- OTP LOGIN LOGIC ---

// 3. Request Login OTP
exports.requestLoginOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found. Please Signup.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60000); // 10 mins

        await db.execute('UPDATE users SET otp_code = ?, otp_expires = ? WHERE email = ?', [otp, expires, email]);
        
        // FIX: Calling the correct function name 'sendLoginOTP'
        await sendLoginOTP(email, otp); 

        res.json({ message: 'OTP sent to your email!' });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Error sending OTP' }); 
    }
};

// 4. Verify Login OTP
exports.verifyLoginOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        if (user.isBanned) return res.status(403).json({ message: '🚫 Account suspended.' });

        if (user.otp_code !== otp) return res.status(400).json({ message: 'Invalid OTP' });
        if (new Date() > new Date(user.otp_expires)) return res.status(400).json({ message: 'OTP Expired' });

        await db.execute('UPDATE users SET otp_code = NULL, otp_expires = NULL, last_login = NOW() WHERE id = ?', [user.id]);

        const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, isAdmin: user.isAdmin, dp: user.dp } });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Error verifying OTP' }); 
    }
};

// --- PROFILE & ADMIN FUNCTIONS ---

exports.getProfile = async (req, res) => { 
    try { 
        const [u] = await db.execute('SELECT id, name, email, mobile, dp, isAdmin FROM users WHERE id = ?', [req.user.id]); 
        if (u.length === 0) return res.status(404).json({ message: "User not found" });
        res.json(u[0]); 
    } catch (err) { 
        console.error("Get Profile Error:", err);
        res.status(500).json({ message: 'Error fetching profile' }); 
    } 
};

exports.updateProfile = async (req, res) => { 
    const { name, mobile } = req.body; 
    const dp = req.file ? req.file.filename : null; 
    try { 
        if (dp) {
            await db.execute('UPDATE users SET name=?, mobile=?, dp=? WHERE id=?', [name, mobile, dp, req.user.id]); 
        } else {
            await db.execute('UPDATE users SET name=?, mobile=? WHERE id=?', [name, mobile, req.user.id]); 
        }
        res.json({ message: 'Profile updated' }); 
    } catch (err) { 
        console.error("Update Profile Error:", err);
        res.status(500).json({ message: 'Error updating profile' }); 
    } 
};

// --- FORGOT PASSWORD FLOW (OTP Based) ---

// 5. Request Reset OTP
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await db.execute(
            'UPDATE users SET reset_otp = ?, reset_otp_expiry = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE email = ?',
            [otp, email]
        );

        // FIX: Using sendOtpEmail for password resets
        await sendOtpEmail(email, otp);

        res.json({ message: "OTP sent to your email!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// 6. Reset Password with OTP
exports.resetPasswordWithOtp = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        const [user] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND reset_otp = ? AND reset_otp_expiry > NOW()', 
            [email, otp]
        );

        if (user.length === 0) return res.status(400).json({ message: "Invalid or Expired OTP" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.execute(
            'UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expiry = NULL WHERE email = ?',
            [hashedPassword, email]
        );

        res.json({ message: "Password reset successfully! You can login now." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// 7. Change Password (LoggedIn User)
exports.changePassword = async (req, res) => { 
    const { oldPassword, newPassword } = req.body; 
    try { 
        const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [req.user.id]); 
        const user = users[0]; 
        
        const valid = await bcrypt.compare(oldPassword, user.password); 
        if(!valid) return res.status(401).json({message: 'Wrong password'}); 
        
        const hashed = await bcrypt.hash(newPassword, 8); 
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]); 
        
        res.json({ message: 'Password updated!' }); 
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Error changing password' }); 
    } 
};

// --- ADMIN FUNCTIONS ---

exports.getAllUsers = async (req, res) => { 
    try { 
        const [users] = await db.execute('SELECT id, name, email, mobile, isBanned, last_login FROM users WHERE isAdmin = 0 ORDER BY last_login DESC'); 
        res.json(users); 
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Error fetching users' }); 
    } 
};

exports.toggleBan = async (req, res) => { 
    try { 
        await db.execute('UPDATE users SET isBanned = NOT isBanned WHERE id = ?', [req.params.id]); 
        res.json({ message: 'Status updated' }); 
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Error updating ban status' }); 
    } 
};

exports.deleteUser = async (req, res) => { 
    try { 
        if (req.params.id == req.user.id) return res.status(400).json({ message: "Cannot delete yourself" }); 
        
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]); 
        res.json({ message: 'User deleted' }); 
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Error deleting user' }); 
    } 
};