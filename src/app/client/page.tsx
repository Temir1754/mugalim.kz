"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

export default function Profile() {
  const router = useRouter();
  const [role, setRole] = useState("CLIENT");

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="mobile-container" style={{ maxWidth: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <main className="content" style={{ padding: "40px 0", flex: 1 }}>
        <div className="inner-container">
          <div className="title-row">
            <h1>Басқару панелі</h1>
          </div>
          <div className="form-card" style={{ padding: "40px", textAlign: "center", marginBottom: "30px" }}>
            <div className="avatar" style={{ width: "100px", height: "100px", margin: "0 auto 20px auto" }}></div>
            <h1 style={{ fontSize: "2rem", marginBottom: "5px" }}>Айнұр Кәрімова</h1>
            <p style={{ color: "var(--text-secondary)" }}>Математика пәнінің мұғалімі • Алматы қ.</p>
            
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
                <span className="badge" style={{ background: "var(--box-tint)", color: "var(--primary-blue)" }}>PRO Аккаунт</span>
                <span className="badge" style={{ background: "rgba(255,149,0,0.1)", color: "#ff9500" }}>54 материал сатып алынды</span>
            </div>
          </div>

          <div className="grid-form">
            <div className="form-card" style={{ padding: "20px" }}>
              <h4 style={{ margin: "0 0 15px 0" }}>Менің сатып алуларым</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                 <div style={{ padding: "10px", background: "var(--input-bg)", borderRadius: "8px", fontSize: "0.9rem" }}>📁 КТЖ 5 сынып (Биология)</div>
                 <div style={{ padding: "10px", background: "var(--input-bg)", borderRadius: "8px", fontSize: "0.9rem" }}>📁 ҚМЖ №12 сабақ (Геометрия)</div>
              </div>
            </div>

            <div className="form-card" style={{ padding: "20px" }}>
              <h4 style={{ margin: "0 0 15px 0" }}>Рөлдерді реттеу</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "15px" }}>Тестілеу үшін кабинеттер арасында ауысыңыз:</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button className="day-btn" onClick={() => router.push("/generator")} style={{ padding: "8px 12px", fontSize: "0.8rem" }}>Генератор (Клиент)</button>
                <button className="day-btn" onClick={() => router.push("/seller")} style={{ padding: "8px 12px", fontSize: "0.8rem", background: "#34C759", borderColor: "#34C759", color: "white" }}>Автор кабинеті</button>
                <button className="day-btn" onClick={() => router.push("/admin")} style={{ padding: "8px 12px", fontSize: "0.8rem", background: "#1a1a24", borderColor: "#1a1a24", color: "white" }}>Админ панелі</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
