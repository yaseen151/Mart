const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs'); // File System module to manage folders

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- AUTOMATIC FOLDER CREATION ---
// 1. Define where we want to save images
const uploadsPath = path.join(__dirname, 'uploads');

// 2. Check if this folder exists. If not, create it instantly.
if (!fs.existsSync(uploadsPath)) {
    console.log("⚠️ Uploads folder was missing. Creating it now...");
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log("✅ Created folder:", uploadsPath);
}

// 3. Tell the server to let the world see files inside this folder
app.use('/uploads', express.static(uploadsPath));
console.log("📂 Serving images from:", uploadsPath);
// --------------------------------------------------

app.use(express.static(path.join(__dirname, '../frontend')));

// --- Routes Setup ---
const router = express.Router();

// Import Controllers
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const orderController = require('./controllers/orderController');
const offerController = require('./controllers/offerController');
const statsController = require('./controllers/statsController');
const wishlistController = require('./controllers/wishlistController');
const reviewController = require('./controllers/reviewController');
const couponController = require('./controllers/couponController');
// Import Middleware
const { verifyToken, verifyAdmin } = require('./middleware/authMiddleware');
const upload = require('./middleware/uploadMiddleware');

// 1. Auth Routes (Standard Password Login)
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/otp/request', authController.requestLoginOtp);
router.post('/auth/otp/verify', authController.verifyLoginOtp);
router.get('/auth/profile', verifyToken, authController.getProfile);
router.put('/auth/profile', verifyToken, upload.single('dp'), authController.updateProfile);
router.post('/auth/forgot-password', authController.forgotPassword);
router.put('/auth/change-password', verifyToken, authController.changePassword);
router.post('/coupons/save', verifyToken, couponController.saveCoupon);
router.get('/coupons/my', verifyToken, couponController.getMyCoupons);
router.get('/auth/users', verifyToken, verifyAdmin, authController.getAllUsers);
router.put('/auth/ban/:id', verifyToken, verifyAdmin, authController.toggleBan);
router.delete('/auth/users/:id', verifyToken, verifyAdmin, authController.deleteUser);
router.post('/coupons/validate', verifyToken, couponController.validateCoupon);
// 2. Product Routes
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', verifyToken, verifyAdmin, upload.single('image'), productController.addProduct);
router.put('/products/:id', verifyToken, verifyAdmin, upload.single('image'), productController.updateProduct);
router.delete('/products/:id', verifyToken, verifyAdmin, productController.deleteProduct);

// 3. Order Routes
router.post('/orders', verifyToken, orderController.createOrder);
router.get('/orders', verifyToken, orderController.getMyOrders);
router.get('/orders/admin', verifyToken, verifyAdmin, orderController.getAllOrders);
// 3. Order Routes
router.post('/orders', verifyToken, orderController.createOrder);
router.get('/orders', verifyToken, orderController.getMyOrders);
router.get('/orders/admin', verifyToken, verifyAdmin, orderController.getAllOrders);

// --- NEW: Update Status Route ---
router.put('/orders/:id/status', verifyToken, verifyAdmin, orderController.updateOrderStatus);

// 4. Offer Routes
router.post('/offers', verifyToken, offerController.makeOffer);
router.get('/offers/admin', verifyToken, verifyAdmin, offerController.getAllOffers);
router.put('/offers/:id', verifyToken, verifyAdmin, offerController.respondToOffer);
router.get('/offers/my', verifyToken, offerController.getMyOffers);

// 5. Stats Routes
router.get('/stats', verifyToken, verifyAdmin, statsController.getDashboardStats);

// 6. Wishlist Routes
router.post('/wishlist', verifyToken, wishlistController.toggleWishlist);
router.get('/wishlist', verifyToken, wishlistController.getMyWishlist);
router.get('/wishlist/ids', verifyToken, wishlistController.getWishlistIds);

// 7. Review Routes
router.post('/reviews', verifyToken, reviewController.addReview);
router.get('/reviews/:id', reviewController.getProductReviews);
// Register API routes with /api prefix
app.use('/api', router);

// --- Frontend Fallback ---
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));