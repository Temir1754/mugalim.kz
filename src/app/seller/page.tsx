"use client";

import { useState } from "react";
import Footer from "@/components/Footer";

export default function SellerDashboard() {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const materials = [
    { title: "КТП Қазақ тілі", class: "3-сынып", status: "PENDING", date: "04.04.26 - сегодня" },
    { title: "КСП Математика", class: "5-сынып", status: "APPROVED", date: "04.04.26 - сегодня" }
  ];

  return (
    <div className="mobile-container" style={{ maxWidth: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <main className="content" style={{ padding: "40px 0", flex: 1 }}>
        <div className="inner-container">
          <div className="title-row">
            <h1>Басқару панелі</h1>
          </div>
          <p className="subtitle">Материалдарды және табысты басқарыңыз</p>

          <div className="grid-form" style={{ marginBottom: "40px" }}>
            {/* Кошелек Продавца */}
            <div className="form-card" style={{ padding: "30px", background: "linear-gradient(135deg, #34C759, #28A745)", color: "white", gridColumn: "span 2" }}>
              <h3 style={{ margin: "0 0 10px 0", opacity: 0.9, fontSize: "1rem", fontWeight: "normal" }}>СІЗДІҢ АҒЫМДАҒЫ БАЛАНСЫҢЫЗ (84%)</h3>
              <div style={{ fontSize: "3rem", fontWeight: "800" }}>145 000 ₸</div>
              <p style={{ margin: "10px 0 0 0", opacity: 0.8, fontSize: "0.9rem" }}>Қаражат Kaspi арқылы шығаруға қолжетімді</p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}>
               <button className="generate-btn" style={{ background: "#34C759", border: "none" }} onClick={() => setShowUploadModal(!showUploadModal)}>
                 {showUploadModal ? "Жүктеу терезесін жабу" : "+ Жаңа КТП / КСП жүктеу"}
               </button>
            </div>
          </div>

          {showUploadModal && (
            <div className="form-card" style={{ padding: "30px", marginBottom: "40px", border: "2px dashed #34C759", background: "var(--box-tint)" }}>
                <h2 style={{ marginBottom: "20px" }}>Жаңа материал</h2>
                <div className="grid-form">
                    <div className="input-group">
                        <span className="label">Файл түрі</span>
                        <select className="input" style={{ background: "var(--input-bg)" }}>
                            <option>КТП</option>
                            <option>КСП</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <span className="label">Пән</span>
                        <input className="input" placeholder="Мысалы: Физика" style={{ background: "var(--input-bg)" }} />
                    </div>
                    <div className="input-group">
                        <span className="label">Сынып</span>
                        <input className="input" placeholder="7 сынып" style={{ background: "var(--input-bg)" }} />
                    </div>
                    <div className="input-group">
                        <span className="label">Бағасы (₸)</span>
                        <input className="input" type="number" placeholder="2500" style={{ background: "var(--input-bg)" }} />
                    </div>
                </div>
                <div className="input-group" style={{ marginTop: "20px" }}>
                    <span className="label">Мұғалімдерге арналған сипаттама</span>
                    <textarea className="input" rows={4} placeholder="Бұл жоспар басқа мұғалімдерге қалай көмектеседі?" style={{ background: "var(--input-bg)" }} />
                </div>
                <button className="generate-btn" style={{ background: "#34C759", marginTop: "20px" }} onClick={() => alert("Материал жіберілді!")}>
                    Маркетте жариялау
                </button>
            </div>
          )}

          <h3 style={{ marginBottom: "20px" }}>Менің белсенді материалдарым</h3>
          <div className="grid-catalog">
            {materials.map((item, idx) => (
              <div key={idx} className="form-card" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "1.1rem" }}>{item.title} ({item.class})</strong>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "5px" }}>{item.date} - бүгін</div>
                </div>
                <div>
                  <span style={{ 
                    padding: "6px 12px", 
                    borderRadius: "20px", 
                    fontSize: "0.75rem", 
                    fontWeight: "bold",
                    background: item.status === "PENDING" ? "#FFF3CD" : "#D4EDDA",
                    color: item.status === "PENDING" ? "#856404" : "#155724"
                  }}>
                    {item.status === "PENDING" ? "Тексеруде" : "Мақұлданды"}
                  </span>
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
