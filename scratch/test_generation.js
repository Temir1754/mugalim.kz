process.env.GEMINI_API_KEY = "AIzaSyAlDF7kI8ncmz5grF2t94Jsc5RgVSO3_oY";
const { generateAIContent } = require('../src/lib/generator-core');

async function test() {
  console.log("🚀 Тестируем генерацию контента...");
  try {
    const data = await generateAIContent(
      "Жаратылыстану", 
      "1 класс", 
      "Тірі және өлі табиғат", 
      "kz"
    );
    console.log("✅ Ответ от ИИ получен:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Ошибка при генерации:", error.message);
    if (error.response) {
      const errData = await error.response.json();
      console.error(JSON.stringify(errData, null, 2));
    }
  }
}

test();
