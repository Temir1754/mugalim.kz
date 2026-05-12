process.env.GEMINI_API_KEY = "AIzaSyAlDF7kI8ncmz5grF2t94Jsc5RgVSO3_oY";

async function testEmbedding() {
  console.log("🚀 Тестируем эмбеддинги...");
  const text = "Сәлем, бұл тексеру мәтіні.";
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/gemini-embedding-2",
          content: { parts: [{ text }] },
        }),
      }
    );

    const data = await response.json();
    if (data.embedding) {
      console.log("✅ Эмбеддинг алынды! Өлшемі:", data.embedding.values.length);
    } else {
      console.error("❌ Ошибка:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Фатальная ошибка:", error.message);
  }
}

testEmbedding();
