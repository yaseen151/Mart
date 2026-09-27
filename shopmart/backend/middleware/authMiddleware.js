const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    console.log("1. Checking Auth Header..."); // Debug Log
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log("2. No Token Found!"); // Debug Log
        return res.status(401).json({ message: "Access Denied: No Token" });
    }

    // CHECK IF SECRET EXISTS
    if (!process.env.JWT_SECRET) {
        console.error("CRITICAL ERROR: JWT_SECRET is missing in .env file!");
        return res.status(500).json({ message: "Server Configuration Error" });
    }

    console.log("3. Verifying Token..."); // Debug Log
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("4. Token Verification Failed:", err.message); // Debug Log
            return res.status(403).json({ message: "Invalid Token" });
        }

        console.log("5. Token Valid! User ID:", decoded.id); // Debug Log
        req.user = decoded; 
        next();
    });
};
exports.verifyAdmin = (req, res, next) => {
    if (!req.user || (!req.user.is_admin && req.user.isAdmin !== 1)) {
        return res.status(403).json({ message: "Access Denied: Admins Only" });
    }
    next();
};