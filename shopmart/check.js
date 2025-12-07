const fs = require('fs');
const currentDir = process.cwd();

console.log("------------------------------------------------");
console.log("📍 Current Terminal Location:", currentDir);
console.log("📂 Files found here:");
console.log("------------------------------------------------");

const items = fs.readdirSync(currentDir);
items.forEach(item => console.log(" - " + item));

console.log("------------------------------------------------");
console.log("⚠️  If you don't see 'server.js' or 'index.html' in the list above,");
console.log("    you are running this in the wrong folder!"); 
console.log("------------------------------------------------");