async function findWorkingModel() {
  const apiKey = "AIzaSyAlDF7kI8ncmz5grF2t94Jsc5RgVSO3_oY";
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();
    const models = listData.models || [];
    
    for (const m of models) {
      const modelName = m.name.split('/').pop();
      if (!m.supportedGenerationMethods.includes("generateContent")) continue;
      
      try {
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const res = await fetch(testUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
        });
        
        const data = await res.json();
        if (!data.error) {
          console.log(`USE THIS MODEL NAME: "${modelName}"`);
          return;
        }
      } catch (e) {}
    }
    console.log("No working models found among 50!");
  } catch (e) {
    console.log("Error:", e.message);
  }
}

findWorkingModel();
