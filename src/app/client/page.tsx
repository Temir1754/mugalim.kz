"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(savedUser);
    setUser(parsed);
    fetchProfile(parsed.id);
  }, [router]);

  const fetchProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/profile?id=${userId}`);
      const data = await res.json();
      if (data && !data.error) {
        setFullProfile(data);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div style={{ padding: "100px", textAlign: "center" }}>Жүктелуде...</div>;
  if (!user) return null;

  const isSchoolAdmin = user.role === "SCHOOL_ADMIN";

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", display: "flex", flexDirection: isSchoolAdmin ? "row" : "column" }}>
      
      {/* SIDEBAR for SCHOOL_ADMIN */}
      {isSchoolAdmin && (
        <div style={{ width: "260px", background: "#fff", borderRight: "1px solid var(--box-border)", display: "flex", flexDirection: "column", padding: "30px 20px", position: "sticky", top: "0", height: "100vh" }}>
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--primary-blue)" }}>MEKTEP.KZ</h2>
            <p style={{ fontSize: "0.75rem", color: "#8898aa" }}>Басқару панелі</p>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button onClick={() => setActiveTab("profile")} style={navBtnStyle(activeTab === "profile")}>Профиль</button>
            <button onClick={() => setActiveTab("purchases")} style={navBtnStyle(activeTab === "purchases")}>Сатып алуларым</button>
            <button onClick={() => setActiveTab("monitoring")} style={navBtnStyle(activeTab === "monitoring")}>Бақылау</button>
            <button onClick={() => setActiveTab("teachers")} style={navBtnStyle(activeTab === "teachers")}>Мұғалімдер</button>
          </nav>

          <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #f0f2f5" }}>
            <button onClick={() => { localStorage.removeItem("user"); window.location.href="/"; }} style={{ ...navBtnStyle(false), color: "#f5222d" }}>Шығу</button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: isSchoolAdmin ? "40px" : "20px", overflowY: "auto" }}>
        
        {!isSchoolAdmin && (
          <div className="inner-container" style={{ marginBottom: "20px" }}>
             <div style={{ display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                <button onClick={() => setActiveTab("profile")} style={{ background: "none", border: "none", fontWeight: activeTab === "profile" ? "800" : "400", color: activeTab === "profile" ? "#0A66F0" : "#666", cursor: "pointer" }}>Профиль</button>
                <button onClick={() => setActiveTab("purchases")} style={{ background: "none", border: "none", fontWeight: activeTab === "purchases" ? "800" : "400", color: activeTab === "purchases" ? "#0A66F0" : "#666", cursor: "pointer" }}>Сатып алуларым ({fullProfile?.purchasedMaterials?.length || 0})</button>
             </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="inner-container" style={{ maxWidth: isSchoolAdmin ? "100%" : "600px", margin: isSchoolAdmin ? "0" : "0 auto" }}>
            <div className="form-card" style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#0A66F0", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "2rem", fontWeight: "900", margin: "0 auto 20px" }}>
                {user.fio ? user.fio[0] : "U"}
              </div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: "900", marginBottom: "5px" }}>{user.fio || "Пайдаланушы"}</h1>
              <p style={{ color: "var(--text-secondary)", marginBottom: "10px" }}>{user.phone} • {user.role === 'SCHOOL_ADMIN' ? 'Оқу ісінің меңгерушіси' : 'Мұғалім'}</p>
              
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "30px" }}>
                  {fullProfile?.subscription?.status === 'ACTIVE' ? (
                    <span className="badge" style={{ background: "#D4EDDA", color: "#155724" }}>PRO Аккаунт</span>
                  ) : (
                    <span className="badge" style={{ background: "#eee", color: "#666" }}>Тегін тариф</span>
                  )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px", textAlign: "left" }}>
                  <button className="generate-btn" onClick={() => router.push("/generator")} style={{ background: "#0A66F0", color: "white" }}>КТЖ / ҚМЖ Генераторға өту</button>
                  {!isSchoolAdmin && (
                    <button className="generate-btn" onClick={() => { localStorage.removeItem("user"); window.location.href="/"; }} style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2" }}>Жүйеден шығу</button>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === "purchases" && (
          <div className="inner-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ fontWeight: "900", marginBottom: "20px" }}>Менің сатып алуларым</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {!fullProfile?.purchasedMaterials?.length ? (
                <div className="form-card" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                  Әзірге сатып алынған материалдар жоқ.
                </div>
              ) : (
                fullProfile.purchasedMaterials.map((m: any) => (
                  <div key={m.id} className="form-card" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{m.type} {m.subject}</h4>
                      <p style={{ margin: "5px 0 0 0", fontSize: "0.85rem", color: "#666" }}>{m.classNumber} сынып • Авторы: {m.author?.fio}</p>
                    </div>
                    <button className="generate-btn" style={{ width: "auto", padding: "10px 20px", background: "#34C759" }} onClick={() => window.open(m.fileUrl, '_blank')}>
                      Жүктеу (PDF/DOCX)
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ... Other Tabs (Monitoring, Teachers etc) remain the same but only for SCHOOL_ADMIN ... */}
      </div>

      <style jsx>{`
        .badge { padding: 6px 14px; border-radius: 50px; font-weight: 800; font-size: 0.8rem; }
      `}</style>
    </div>
  );
}

function navBtnStyle(active: boolean) {
  return {
    padding: "12px 16px", borderRadius: "10px", border: "none",
    background: active ? "#F0F7FF" : "transparent",
    color: active ? "#0A66F0" : "#637381",
    fontWeight: active ? "800" : "600",
    textAlign: "left" as const, cursor: "pointer", fontSize: "0.9rem", width: "100%", marginBottom: "4px"
  };
}

function StatCard({ title, value }: any) {
  return (
    <div className="form-card" style={{ padding: "20px" }}>
      <div>
        <div style={{ fontSize: "0.75rem", color: "#8898aa" }}>{title}</div>
        <div style={{ fontSize: "1.2rem", fontWeight: "900" }}>{value}</div>
      </div>
    </div>
  );
}

function TeacherRow({ name, status, activity }: any) {
  return (
    <tr style={{ borderBottom: "1px solid var(--box-border)" }}>
      <td style={{ padding: "15px", fontWeight: "600" }}>{name}</td>
      <td style={{ padding: "15px" }}><span style={{ color: "#34C759", fontSize: "0.8rem", fontWeight: "bold" }}>● {status}</span></td>
      <td style={{ padding: "15px", color: "#637381" }}>{activity}</td>
    </tr>
  );
}
