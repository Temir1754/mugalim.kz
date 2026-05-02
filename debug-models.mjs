// debug-models.mjs
import fs from 'fs';

// Simple .env parser to avoid external dependencies
function getEnvKey() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    return match ? match[1].trim() : null;
  } catch (e) {
    return null;
  }
}

const API_KEY = getEnvKey();

if (!API_KEY) {
  console.error("API KEY not found in .env.local");
  process.exit(1);
}

async function listModels() {
  console.log("Using API Key:", API_KEY.substring(0, 10) + "...");
  
  try {
    console.log("Fetching models list from v1beta...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("Error listing models (v1beta):", data.error);
    } else {
      console.log("Available models (v1beta):", data.models?.map(m => m.name));
    }

    console.log("\nFetching models list from v1...");
    const responseV1 = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
    const dataV1 = await responseV1.json();
    
    if (dataV1.error) {
       console.error("Error listing models (v1):", dataV1.error);
    } else {
       console.log("Available models (v1):", dataV1.models?.map(m => m.name));
    }

  } catch (error) {
    console.error("Fatal error during debug:", error);
  }
}

listModels();
