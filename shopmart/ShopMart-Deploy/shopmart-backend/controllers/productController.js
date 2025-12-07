const db = require('../config/db');

// 1. Get Products (With optional Category Filter)
exports.getAllProducts = async (req, res) => {
    const category = req.query.category; // Get ?category=Fashion from URL
    try {
        let sql = 'SELECT * FROM products';
        let params = [];

        if (category && category !== 'All') {
            sql += ' WHERE category = ?';
            params.push(category);
        }
        
        // Show newest first
        sql += ' ORDER BY id DESC';

        const [products] = await db.execute(sql, params);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products' });
    }
};

// 2. Get Single Product
exports.getProductById = async (req, res) => {
    try {
        const [product] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if(product.length === 0) return res.status(404).json({message: 'Product not found'});
        res.json(product[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product' });
    }
};

// 3. Add Product (Now saves Category)
exports.addProduct = async (req, res) => {
    const { title, description, price, stock, category } = req.body;
    const image = req.file ? req.file.filename : 'default-product.png';
    try {
        await db.execute(
            'INSERT INTO products (title, description, price, stock, category, image) VALUES (?, ?, ?, ?, ?, ?)', 
            [title, description, price, stock, category, image]
        );
        res.status(201).json({ message: 'Product added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding product' });
    }
};

// 4. Update Product (Now updates Category)
exports.updateProduct = async (req, res) => {
    const { title, description, price, stock, category } = req.body;
    const id = req.params.id;
    
    try {
        if (req.file) {
            await db.execute(
                'UPDATE products SET title=?, description=?, price=?, stock=?, category=?, image=? WHERE id=?', 
                [title, description, price, stock, category, req.file.filename, id]
            );
        } else {
            await db.execute(
                'UPDATE products SET title=?, description=?, price=?, stock=?, category=? WHERE id=?', 
                [title, description, price, stock, category, id]
            );
        }
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating product' });
    }
};

// 5. Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product' });
    }
};