const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModels() {
    console.log("Checking available AI models for your key...");
    
    const candidates = [
        "gemini-1.5-flash", 
        "gemini-1.5-pro", 
        "gemini-1.0-pro", 
        "gemini-pro"
    ];

    for (const modelName of candidates) {
        try {
            console.log(`Testing: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ SUCCESS! The working model name is: "${modelName}"`);
            return; // Stop as soon as we find one
        } catch (error) {
            console.log(`❌ Failed: ${modelName} (${error.statusText || error.message})`);
        }
    }
    console.log("⚠️ No models worked. Check your API Key permissions.");
}

checkModels();