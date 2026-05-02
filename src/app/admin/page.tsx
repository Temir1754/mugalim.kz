"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/Footer";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === "ADMIN") {
        setIsAdmin(true);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Keep local check as fallback for the secret admin/Temir password
    if (login === "admin" && password === "Temir173173") {
      const adminUser = { username: "admin", role: "ADMIN" };
      localStorage.setItem("user", JSON.stringify(adminUser));
      setIsAdmin(true);
      setError("");
      window.location.reload(); // Refresh to update Navbar
    } else {
      setError("Неверный логин или пароль администратора");
    }
  };

  const pendingFiles = [
    { author: "Айбек К.", title: "КТП Информатика", class: "7 класс", date: "Сегодня, 14:00" },
    { author: "Светлана И.", title: "КСП Литература", class: "10 класс", date: "Вчера, 18:30" },
    { author: "Марат О.", title: "КТП География", class: "8 класс", date: "Вчера, 16:15" }
  ];

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-color)" }}>
        <div style={{ background: "var(--card-bg)", padding: "40px", borderRadius: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.12)", width: "100%", maxWidth: "420px", textAlign: "center", border: "1px solid var(--box-border)" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔐</div>
          <h2 style={{ marginBottom: "12px", fontWeight: "900", color: "var(--text-main)", fontSize: "1.8rem" }}>Рұқсат шектелген</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "32px", lineHeight: "1.5", fontSize: "1rem" }}>Басқару панеліне кіру үшін әкімші мәліметтерін енгізіңіз.</p>
          
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#888", marginLeft: "10px", marginBottom: "5px", display: "block" }}>ЛОГИН</label>
              <input 
                type="text" 
                placeholder="Мысалы: admin" 
                value={login} 
                onChange={(e) => setLogin(e.target.value)}
                style={{ width: "100%", padding: "16px", borderRadius: "16px", border: "2px solid var(--box-border)", background: "var(--input-bg)", fontSize: "1rem", outline: "none", transition: "border-color 0.2s", color: "var(--text-main)" }}
              />
            </div>
            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", marginLeft: "10px", marginBottom: "5px", display: "block" }}>ҚҰПИЯ СӨЗ</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "16px", borderRadius: "16px", border: "2px solid var(--box-border)", background: "var(--input-bg)", fontSize: "1rem", outline: "none", transition: "border-color 0.2s", color: "var(--text-main)" }}
              />
            </div>
            {error && <p style={{ color: "#dc3545", fontSize: "0.9rem", fontWeight: "600" }}>{error}</p>}
            <button type="submit" style={{ padding: "18px", background: "var(--primary-blue)", color: "white", border: "none", borderRadius: "16px", fontWeight: "800", fontSize: "1.1rem", cursor: "pointer", marginTop: "15px", boxShadow: "0 10px 20px rgba(10, 102, 240, 0.2)" }}>
              Жүйеге кіру
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container" style={{ maxWidth: "100%", backgroundColor: "var(--bg-color)" }}>
      <main className="content" style={{ padding: "40px 0", flex: 1 }}>
        <div className="inner-container">
          <div className="title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>Басқару панелі</h1>
          </div>
          <p className="subtitle">Материалдарды модерациялау және платформа аналитикасы</p>

          <div className="grid-form" style={{ marginBottom: "40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              <div className="form-card" style={{ padding: "25px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card-bg)", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid var(--box-border)" }}>
                  <div>
                    <h4 style={{ margin: "0", color: "var(--text-muted)", fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "700" }}>КЛИЕНТТЕР</h4>
                    <div style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--text-main)" }}>1,245</div>
                  </div>
                  <div style={{ fontSize: "2.5rem", opacity: 0.8 }}>👥</div>
              </div>
              <div className="form-card" style={{ padding: "25px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card-bg)", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid var(--box-border)" }}>
                  <div>
                    <h4 style={{ margin: "0", color: "var(--text-muted)", fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "700" }}>АЙЛЫҚ САУДА</h4>
                    <div style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--text-main)" }}>₸ 840,000</div>
                  </div>
                  <div style={{ fontSize: "2.5rem", opacity: 0.8 }}>💰</div>
              </div>
              <div className="form-card" style={{ padding: "25px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card-bg)", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid var(--box-border)" }}>
                  <div>
                    <h4 style={{ margin: "0", color: "var(--text-muted)", fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "700" }}>ТЕКСЕРУДЕ</h4>
                    <div style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--text-main)" }}>{pendingFiles.length}</div>
                  </div>
                  <div style={{ fontSize: "2.5rem", opacity: 0.8 }}>⏳</div>
              </div>
          </div>

          <h3 style={{ marginBottom: "25px", fontWeight: "800", color: "var(--text-main)" }}>Модерацияға жаңа материалдар</h3>
          <div className="grid-catalog" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" }}>
            {pendingFiles.map((file, idx) => (
              <div key={idx} className="form-card" style={{ padding: "30px", borderTop: "6px solid #FF9500", height: "100%", display: "flex", flexDirection: "column", background: "var(--card-bg)", borderRadius: "20px", boxShadow: "0 15px 35px rgba(0,0,0,0.07)", border: "1px solid var(--box-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "flex-start" }}>
                  <strong style={{ fontSize: "1.3rem", color: "var(--text-main)", lineHeight: "1.2" }}>{file.title}</strong>
                  <span style={{ background: "var(--box-tint)", color: "var(--text-muted)", padding: "6px 12px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700", border: "1px solid var(--box-border)" }}>{file.class}</span>
                </div>
                
                <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "25px", flex: 1, lineHeight: "1.6" }}>
                  Авторы: <b style={{color: "var(--text-main)"}}>{file.author}</b> <br/> 
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Жүктелді: {file.date}</span>
                </div>
                
                <div style={{ display: "flex", gap: "10px" }}>
                  <button style={{ flex: 1, padding: "12px", background: "#D4EDDA", color: "#155724", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer" }}>
                    Мақұлдау
                  </button>
                  <button style={{ flex: 1, padding: "12px", background: "#F8D7DA", color: "#721C24", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer" }}>
                    Қабылдамау
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
