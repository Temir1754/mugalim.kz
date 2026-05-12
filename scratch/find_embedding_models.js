async function findEmbeddingModel() {
  const apiKey = "AIzaSyAlDF7kI8ncmz5grF2t94Jsc5RgVSO3_oY";
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();
    const models = listData.models || [];
    
    console.log("Embedding models found:");
    for (const m of models) {
      if (m.supportedGenerationMethods.includes("embedContent")) {
        console.log(`- ${m.name}`);
      }
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}

findEmbeddingModel();
