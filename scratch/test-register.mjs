
async function testRegistration() {
  const testUser = {
    username: "test_teacher_" + Math.floor(Math.random() * 1000),
    password: "password123",
    fio: "Тестовый Учитель",
    phone: "+7 (777) 777-77-77",
    region: "Алматы",
    schoolType: "Мемлекеттік",
    schoolName: "№1 мектеп-гимназия",
    specialty: "Математика",
    role: "CLIENT"
  };

  console.log("Testing registration with:", testUser.username);

  try {
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    if (response.ok) {
      console.log("✅ Registration Successful!", data);
    } else {
      console.error("❌ Registration Failed:", data);
    }
  } catch (err) {
    console.error("❌ Request Error:", err.message);
  }
}

testRegistration();
