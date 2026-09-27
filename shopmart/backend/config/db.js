const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// ---------------------------------------------------------
// Debugging: Let's see what the server sees
// ---------------------------------------------------------
console.log("-------------------------------------");
console.log("🔌 Connecting to Local DB...");
console.log("Host:", process.env.DB_HOST || 'localhost');
console.log("User:", process.env.DB_USER || 'root');
console.log("DB Name:", process.env.DB_NAME || 'mart');
console.log("Port:", process.env.DB_PORT || 3306);
console.log("Password Exists?", process.env.DB_PASSWORD ? "Yes" : "No (CHECK .ENV!)"); 
console.log("-------------------------------------");

// Create the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    // 👇 Ensure this matches your .env variable exactly
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME || 'mart',
    // Best Practice: Parse the port as an integer just in case
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection immediately on start
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ DB Connection Failed:", err.code);
        console.error("Reason:", err.message);
    } else {
        console.log("✅ Local Database Connected Successfully!");
        connection.release(); // Release the connection back to the pool
    }
});

// Export the pool with promise support for async/await
module.exports = pool.promise();