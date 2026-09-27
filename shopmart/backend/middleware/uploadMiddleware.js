const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Ensure the uploads folder exists before trying to save
const uploadDir = path.join(__dirname, '../uploads'); // Go up one level to 'backend/uploads'

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Use the absolute path we defined above
    },
    filename: (req, file, cb) => {
        // Save with timestamp to prevent duplicate names
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// 3. Filter to accept Images only (Optional but recommended)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter 
});

module.exports = upload;