const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs'); 

// Load environment variables
dotenv.config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added for form data parsing

// --- AUTOMATIC FOLDER CREATION (For Images) ---
// 1. Define where we want to save images
const uploadsPath = path.join(__dirname, 'uploads');

// 2. Check if this folder exists. If not, create it instantly.
if (!fs.existsSync(uploadsPath)) {
    console.log("⚠️ Uploads folder was missing. Creating it now...");
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log("✅ Created folder:", uploadsPath);
}

// 3. IMPORTANT: Serve the uploads folder statically
app.use('/uploads', express.static(uploadsPath));
console.log("📂 Serving images from:", uploadsPath);

// 4. Serve Frontend Files
app.use(express.static(path.join(__dirname, '../frontend')));

// --- IMPORT CONTROLLERS ---
// Ensure these files exist in your 'controllers' folder!
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const orderController = require('./controllers/orderController');
const offerController = require('./controllers/offerController');
const statsController = require('./controllers/statsController');
const wishlistController = require('./controllers/wishlistController');
const reviewController = require('./controllers/reviewController');
const couponController = require('./controllers/couponController');
const paymentController = require('./controllers/paymentController'); 
const chatbotController = require('./controllers/chatbotController');

// --- IMPORT MIDDLEWARE ---
// Ensure these files exist in your 'middleware' folder!
const { verifyToken, verifyAdmin } = require('./middleware/authMiddleware');
const upload = require('./middleware/uploadMiddleware'); // Required for Image Uploads

// --- ROUTES SETUP ---
const router = express.Router();

// 1. Auth Routes
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/otp/request', authController.requestLoginOtp);
router.post('/auth/otp/verify', authController.verifyLoginOtp);
router.get('/auth/profile', verifyToken, authController.getProfile);
router.put('/auth/profile', verifyToken, upload.single('dp'), authController.updateProfile);
router.post('/auth/forgot-password', authController.forgotPassword);
router.put('/auth/change-password', verifyToken, authController.changePassword);
router.post('/auth/reset-password', authController.resetPasswordWithOtp);

// 1.1 User Management (Admin)
router.get('/auth/users', verifyToken, verifyAdmin, authController.getAllUsers);
router.put('/auth/ban/:id', verifyToken, verifyAdmin, authController.toggleBan);
router.delete('/auth/users/:id', verifyToken, verifyAdmin, authController.deleteUser);

// 2. Chatbot Route
router.post('/chat', verifyToken, chatbotController.handleChat);

// 3. Coupon Routes
router.post('/coupons/save', verifyToken, couponController.saveCoupon);
router.get('/coupons/my', verifyToken, couponController.getMyCoupons);
router.post('/coupons/validate', verifyToken, couponController.validateCoupon);

// 4. Payment Routes (Saved Cards)
router.get('/payment/cards', verifyToken, paymentController.getSavedCards);
router.post('/payment/cards', verifyToken, paymentController.saveCard);

// 5. Product Routes
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', verifyToken, verifyAdmin, upload.single('image'), productController.addProduct);
router.put('/products/:id', verifyToken, verifyAdmin, upload.single('image'), productController.updateProduct);
router.delete('/products/:id', verifyToken, verifyAdmin, productController.deleteProduct);

// 6. Order Routes
router.post('/orders', verifyToken, orderController.createOrder);
router.get('/orders', verifyToken, orderController.getMyOrders); 
router.get('/orders/admin', verifyToken, verifyAdmin, orderController.getAllOrders); 
router.put('/orders/:id/status', verifyToken, verifyAdmin, orderController.updateOrderStatus); 
router.put('/orders/:id/cancel', verifyToken, orderController.cancelOrder); 
router.put('/orders/:id/return', verifyToken, orderController.returnOrder); 

// 7. Offer Routes
router.post('/offers', verifyToken, offerController.makeOffer);
router.get('/offers/admin', verifyToken, verifyAdmin, offerController.getAllOffers);
router.put('/offers/:id', verifyToken, verifyAdmin, offerController.respondToOffer);
router.get('/offers/my', verifyToken, offerController.getMyOffers);

// 8. Stats Routes (Admin Dashboard)
router.get('/stats', verifyToken, verifyAdmin, statsController.getDashboardStats);

// 9. Wishlist Routes
router.post('/wishlist', verifyToken, wishlistController.toggleWishlist);
router.get('/wishlist', verifyToken, wishlistController.getMyWishlist);
router.get('/wishlist/ids', verifyToken, wishlistController.getWishlistIds);

// 10. Review Routes
router.post('/reviews', verifyToken, reviewController.addReview);
router.get('/reviews/:id', reviewController.getProductReviews);

// --- REGISTER API ROUTER ---
app.use('/api', router);

// ==============================================
// 📩 CONTACT FORM API
// ==============================================
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    console.log(`📩 Contact Request from: ${name}`);

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("❌ Missing EMAIL_USER or EMAIL_PASS in .env file");
            return res.status(500).json({ success: false, message: "Server configuration error." });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `📢 ShopMart Enquiry: ${name}`,
            text: `Message from ${name} (${email}):\n\n${message}`
        });

        console.log("✅ Email Sent Successfully!");
        res.json({ success: true, message: "Email sent successfully!" });

    } catch (err) {
        console.error("❌ EMAIL ERROR:", err.message);
        res.status(500).json({ success: false, message: "Failed to send email." });
    }
});

// --- FRONTEND FALLBACK (Must be last) ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));