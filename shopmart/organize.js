const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const currentDir = process.cwd();
const deployDirName = 'ShopMart-Deploy';
const deployPath = path.join(currentDir, deployDirName);

// Your CURRENT existing folders
const sourceBackend = path.join(currentDir, 'backend');
const sourceFrontend = path.join(currentDir, 'frontend');

// The NEW folders we want to create
const targetBackend = path.join(deployPath, 'shopmart-backend');
const targetFrontend = path.join(deployPath, 'shopmart-frontend');

// Helper function to copy folder but SKIP node_modules
function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) fs.mkdirSync(to);
    
    fs.readdirSync(from).forEach(element => {
        if (element === 'node_modules' || element === '.git' || element === '.DS_Store') {
            return; // SKIP these
        }

        const src = path.join(from, element);
        const dest = path.join(to, element);
        const stat = fs.lstatSync(src);

        if (stat.isFile()) {
            fs.copyFileSync(src, dest);
        } else if (stat.isDirectory()) {
            copyFolderSync(src, dest);
        }
    });
}

async function organize() {
    console.log('📦 Starting Organization for existing folders...');

    // 1. Create the main Deploy folder
    if (!fs.existsSync(deployPath)) fs.mkdirSync(deployPath);

    // 2. Process Backend
    if (fs.existsSync(sourceBackend)) {
        console.log('🔄 Copying Backend...');
        copyFolderSync(sourceBackend, targetBackend);
        console.log('✅ Backend copied (node_modules skipped).');
    } else {
        console.log('❌ Error: Could not find a "backend" folder.');
    }

    // 3. Process Frontend
    if (fs.existsSync(sourceFrontend)) {
        console.log('🔄 Copying Frontend...');
        copyFolderSync(sourceFrontend, targetFrontend);
        console.log('✅ Frontend copied.');
    } else {
        console.log('❌ Error: Could not find a "frontend" folder.');
    }

    console.log('\n✨ Organization Complete! ✨');
    console.log(`Open the "${deployDirName}" folder to see your clean repos.`);
}

organize();