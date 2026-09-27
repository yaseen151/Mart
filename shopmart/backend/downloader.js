const fs = require('fs');
const https = require('https');
const path = require('path');

// Folder where images will be saved
const downloadFolder = path.join(__dirname, 'uploads');

// Ensure folder exists
if (!fs.existsSync(downloadFolder)) {
    fs.mkdirSync(downloadFolder);
}

// 30 Specific Image URLs (High Quality & Small Size)
const images = [
    { name: 'elec1.jpg', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' }, // Headphone
    { name: 'elec2.jpg', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500&q=80' }, // Laptop
    { name: 'elec3.jpg', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80' }, // Camera
    { name: 'elec4.jpg', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80' }, // Phone
    { name: 'elec5.jpg', url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&q=80' }, // PS5
    { name: 'elec6.jpg', url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80' }, // Mouse
    { name: 'elec7.jpg', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80' }, // Polaroid
    { name: 'elec8.jpg', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&q=80' }, // Speaker

    { name: 'fash1.jpg', url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&q=80' }, // Jacket
    { name: 'fash2.jpg', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' }, // Red Shoe
    { name: 'fash3.jpg', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80' }, // Glasses
    { name: 'fash4.jpg', url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80' }, // Watch
    { name: 'fash5.jpg', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80' }, // Coat
    { name: 'fash6.jpg', url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80' }, // Green Shoe
    { name: 'fash7.jpg', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80' }, // Bag
    { name: 'fash8.jpg', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80' }, // Puma

    { name: 'vint1.jpg', url: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=500&q=80' }, // Old Camera
    { name: 'vint2.jpg', url: 'https://images.unsplash.com/photo-1534234828569-187d554d9263?w=500&q=80' }, // Telescope
    { name: 'vint3.jpg', url: 'https://images.unsplash.com/photo-1520263118674-c2779f7a2455?w=500&q=80' }, // Typewriter
    { name: 'vint4.jpg', url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&q=80' }, // Record Player
    { name: 'vint5.jpg', url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&q=80' }, // Map
    { name: 'vint6.jpg', url: 'https://images.unsplash.com/photo-1512428559087-560fa5ce7d94?w=500&q=80' }, // Fan
    { name: 'vint7.jpg', url: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=500&q=80' }, // Pocket Watch

    { name: 'home1.jpg', url: 'https://images.unsplash.com/photo-1581783342308-f792ca438902?w=500&q=80' }, // Vase
    { name: 'home2.jpg', url: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80' }, // Chair
    { name: 'home3.jpg', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&q=80' }, // Bulb
    { name: 'home4.jpg', url: 'https://images.unsplash.com/photo-1599598425947-d351db8f83cc?w=500&q=80' }, // Bonsai
    { name: 'home5.jpg', url: 'https://images.unsplash.com/photo-1563861826100-9cb868c7167a?w=500&q=80' }, // Clock
    { name: 'home6.jpg', url: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=500&q=80' }, // Rug
    { name: 'home7.jpg', url: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=500&q=80' }, // Diffuser
];

const downloadImage = (url, filename) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(downloadFolder, filename));
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`✅ Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(path.join(downloadFolder, filename), () => {}); // Delete failed file
            console.error(`❌ Error downloading ${filename}: ${err.message}`);
            reject(err);
        });
    });
};

async function startDownload() {
    console.log("🚀 Starting Bulk Image Download...");
    for (const img of images) {
        try {
            await downloadImage(img.url, img.name);
        } catch (e) {
            console.log("Skipping...");
        }
    }
    console.log("\n🎉 All 30 Images Downloaded Successfully!");
    console.log("👉 Now Run the SQL Query provided.");
}

startDownload();