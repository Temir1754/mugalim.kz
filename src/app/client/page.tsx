"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [schoolName, setSchoolName] = useState("№1 жалпы білім беретін мектеп");
  const [teachers] = useState([
    { id: 1, name: "Марат Асқаров", activity: "12 ҚМЖ" },
    { id: 2, name: "Айнұр Сапарова", activity: "8 ҚМЖ" },
    { id: 3, name: "Сәуле Мұратқызы", activity: "15 ҚМЖ" }
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(savedUser);
    setUser(parsed);
    if (parsed.schoolName) setSchoolName(parsed.schoolName);
  }, []);

  const handleSaveSchoolName = () => {
    const newName = prompt("Мектеп атын енгізіңіз:", schoolName);
    if (newName) {
      setSchoolName(newName);
      const updatedUser = { ...user, schoolName: newName };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  if (!user) return <div style={{ padding: "50px", textAlign: "center" }}>Жүктелуде...</div>;

  const isSchoolAdmin = user.role === "SCHOOL_ADMIN";

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", display: "flex" }}>
      
      {/* SIDEBAR for SCHOOL_ADMIN */}
      {isSchoolAdmin && (
        <div style={{ width: "260px", background: "#fff", borderRight: "1px solid var(--box-border)", display: "flex", flexDirection: "column", padding: "30px 20px", position: "sticky", top: "0", height: "100vh" }}>
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--primary-blue)" }}>MEKTEP.KZ</h2>
            <p style={{ fontSize: "0.75rem", color: "#8898aa" }}>Басқару панелі</p>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button onClick={() => setActiveTab("profile")} style={navBtnStyle(activeTab === "profile")}>Профиль</button>
            <button onClick={() => setActiveTab("monitoring")} style={navBtnStyle(activeTab === "monitoring")}>Бақылау</button>
            <button onClick={() => setActiveTab("teachers")} style={navBtnStyle(activeTab === "teachers")}>Мұғалімдер</button>
            <button onClick={() => setActiveTab("templates")} style={navBtnStyle(activeTab === "templates")}>Ортақ үлгілер</button>
          </nav>

          <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #f0f2f5" }}>
            <button onClick={() => { localStorage.removeItem("user"); window.location.href="/"; }} style={{ ...navBtnStyle(false), color: "#f5222d" }}>Шығу</button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: isSchoolAdmin ? "40px" : "0", overflowY: "auto" }}>
        
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="inner-container" style={{ maxWidth: isSchoolAdmin ? "100%" : "600px", margin: isSchoolAdmin ? "0" : "40px auto" }}>
            <div className="form-card" style={{ textAlign: "center", padding: "40px", position: "relative" }}>
              
              <h1 style={{ fontSize: "1.8rem", fontWeight: "900", marginBottom: "5px" }}>{user.fio || user.username}</h1>
              <p style={{ color: "var(--text-secondary)", marginBottom: "10px" }}>{user.phone} • {user.role === 'SCHOOL_ADMIN' ? 'Оқу ісінің меңгерушісі' : 'Мұғалім'}</p>
              
              {isSchoolAdmin && (
                <div style={{ marginBottom: "20px" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--primary-blue)", fontWeight: "bold", cursor: "pointer" }} onClick={handleSaveSchoolName}>
                    {schoolName} (өзгерту)
                  </span>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "30px" }}>
                  {user.subscription?.status === 'ACTIVE' ? (
                    <span className="badge" style={{ background: "var(--box-tint)", color: "var(--primary-blue)" }}>PRO Аккаунт (Белсенді)</span>
                  ) : (
                    <span className="badge" style={{ background: "#eee", color: "#666" }}>Тегін тариф</span>
                  )}
                  {user.subscription?.endDate && (
                    <span className="badge" style={{ background: "rgba(255,149,0,0.1)", color: "#ff9500" }}>{user.subscription.endDate} дейін</span>
                  )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isSchoolAdmin ? "1fr 1fr" : "1fr", gap: "15px", textAlign: "left" }}>
                <div style={{ background: "var(--bg-main)", padding: "20px", borderRadius: "16px" }}>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9rem" }}>Қызметтер</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button className="day-btn" onClick={() => router.push("/generator")} style={{ width: "100%", padding: "10px" }}>КТЖ / ҚМЖ Генератор</button>
                    <button className="day-btn" onClick={() => router.push("/catalog")} style={{ width: "100%", padding: "10px" }}>Дайын материалдар</button>
                  </div>
                </div>

                {!isSchoolAdmin && (
                  <div style={{ background: "var(--bg-main)", padding: "20px", borderRadius: "16px" }}>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9rem" }}>Баптаулар</h4>
                    <button className="day-btn" onClick={() => { localStorage.removeItem("user"); window.location.href="/"; }} style={{ width: "100%", padding: "10px", color: "#f5222d", borderColor: "#ffa39e" }}>Жүйеден шығу</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === "monitoring" && (
          <div className="fade">
            <h2 style={{ fontWeight: "900", marginBottom: "20px" }}>Мектеп мониторингі</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "30px" }}>
              <StatCard title="Жалпы мұғалімдер" value={teachers.length.toString()} />
              <StatCard title="Осы айда жасалды" value="45 ҚМЖ" />
              <StatCard title="Белсенділік" value="85%" />
            </div>
            <div className="form-card" style={{ padding: "20px" }}>
              <h3>Соңғы белсенділік</h3>
              <p style={{ color: "#8898aa" }}>Мұғалімдеріңіздің материал жасау барысы осында көрінеді.</p>
            </div>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === "teachers" && (
          <div className="fade">
            <h2 style={{ fontWeight: "900", marginBottom: "20px" }}>Мұғалімдер тізімі</h2>
            <div className="form-card" style={{ padding: "0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", background: "#f9fafb" }}>
                    <th style={{ padding: "15px", fontSize: "0.8rem", color: "#8898aa" }}>АТЫ-ЖӨНІ</th>
                    <th style={{ padding: "15px", fontSize: "0.8rem", color: "#8898aa" }}>СТАТУС</th>
                    <th style={{ padding: "15px", fontSize: "0.8rem", color: "#8898aa" }}>БЕЛСЕНДІЛІК</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <TeacherRow 
                      key={t.id} 
                      name={t.name} 
                      status="Белсенді" 
                      activity={t.activity} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="fade">
            <h2 style={{ fontWeight: "900", marginBottom: "20px" }}>Ортақ үлгілер</h2>
            <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#856404" }}>Осында сіз бүкіл мектеп үшін ортақ ҚМЖ үлгілерін жүктей аласыз.</p>
            </div>
            <div className="grid-catalog" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="form-card"><h4>Мектеп Бұйрығы (Үлгі)</h4><button className="badge">Көру</button></div>
              <div className="form-card"><h4>Сабақ жоспары (Стандарт)</h4><button className="badge">Көру</button></div>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        .fade { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function navBtnStyle(active: boolean) {
  return {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: active ? "var(--box-tint)" : "transparent",
    color: active ? "var(--primary-blue)" : "#637381",
    fontWeight: active ? "800" : "600",
    textAlign: "left" as const,
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.2s",
    width: "100%",
    marginBottom: "4px"
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
