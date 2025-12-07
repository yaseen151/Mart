const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
// Make sure products.json is in the SAME folder as seed.js
const products = require('./products.json'); 

dotenv.config();

const addProductsOnly = async () => {
  
  // --- DEBUG CHECK ---
  console.log("-----------------------------------------");
  console.log("Checking Connection Details:");
  console.log("Host:", process.env.DB_HOST);
  console.log("User:", process.env.DB_USER);
  // If this prints 'undefined', your .env file is not being read!
  console.log("Password Length:", process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : "Undefined (Missing!)"); 
  console.log("-----------------------------------------");
  // -------------------

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: 'Junnubhai@07', 
      database: process.env.DB_NAME
    });

    console.log('Connected to MySQL...');

    const insertQuery = `
      INSERT INTO products (title, description, price, category, image, stock)
      VALUES ?
    `;

    const values = products.map(product => [
      product.title,        
      product.description,
      product.price,
      product.category,
      product.image,
      product.stock         
    ]);

    await connection.query(insertQuery, [values]);

    console.log(`Successfully added ${values.length} new products!`);

  } catch (error) {
    console.error('Error adding products:', error.message);
    
    // Suggestion if password fails again
    if(error.message.includes("Access denied")) {
        console.log("\n⚠️ TIP: If the password is in .env but still failing, try typing the password directly in the code for now.");
    }

  } finally {
    if (connection) await connection.end();
    process.exit();
  }
};

addProductsOnly();