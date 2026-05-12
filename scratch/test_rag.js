process.env.GEMINI_API_KEY = "AIzaSyAlDF7kI8ncmz5grF2t94Jsc5RgVSO3_oY";
const { generateLessonPlan } = require('../src/lib/gemini');

async function test() {
  console.log("🚀 Тестируем RAG-генерацию...");
  const textbookId = "855a6f11-3920-4398-8377-392166b42ac8";
  
  try {
    const data = await generateLessonPlan(
      "Жаратылыстану", 
      "1 класс", 
      "Тірі табиғат", 
      "kz",
      textbookId
    );
    console.log("✅ Ответ от ИИ с контекстом получен:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
  }
}

test();
