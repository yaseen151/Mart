const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config(); // Load your DB credentials

const seedDatabase = async () => {
    try {
        // 1. Connect to Database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log("✅ Connected to Database");

        // 2. Read the JSON file
        const dataPath = path.join(__dirname, 'products.json');
        const jsonData = fs.readFileSync(dataPath, 'utf8');
        const products = JSON.parse(jsonData);

        console.log(`📦 Found ${products.length} products to insert...`);

        // 3. Insert Loop
        for (const p of products) {
            const sql = `INSERT INTO products (title, description, price, stock, category, image) VALUES (?, ?, ?, ?, ?, ?)`;
            const values = [p.title, p.description, p.price, p.stock, p.category, p.image];
            
            await connection.execute(sql, values);
        }

        console.log("🎉 SUCCESS! All products added.");
        await connection.end();

    } catch (error) {
        console.error("❌ Error seeding database:", error);
    }
};

seedDatabase();