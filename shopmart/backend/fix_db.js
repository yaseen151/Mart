const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const fixDatabase = async () => {
    console.log("🔧 Starting Database Repair...");

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        // 1. Add 'last_login' column if missing
        try {
            await connection.execute("ALTER TABLE users ADD COLUMN last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
            console.log("✅ Added 'last_login' column.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("ℹ️ 'last_login' column already exists.");
            else console.log("⚠️ Error adding last_login:", e.message);
        }

        // 2. Add 'isBanned' column if missing
        try {
            await connection.execute("ALTER TABLE users ADD COLUMN isBanned TINYINT(1) DEFAULT 0");
            console.log("✅ Added 'isBanned' column.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("ℹ️ 'isBanned' column already exists.");
            else console.log("⚠️ Error adding isBanned:", e.message);
        }

        // 3. Fix NULL values (The logic that causes the loading stuck issue)
        console.log("🧹 Cleaning up empty data...");
        
        // Using a safer update approach
        await connection.query("UPDATE users SET last_login = NOW() WHERE last_login IS NULL");
        await connection.query("UPDATE users SET isBanned = 0 WHERE isBanned IS NULL");
        
        console.log("✅ Data cleaned successfully!");
        console.log("🎉 DATABASE IS FIXED. PLEASE RESTART SERVER.");

    } catch (err) {
        console.error("❌ Critical Database Error:", err);
    } finally {
        await connection.end();
    }
};

fixDatabase();