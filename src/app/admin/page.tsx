"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/Footer";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("payments");
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === "ADMIN") {
        setIsAdmin(true);
      }
    }

    setPaymentRequests(JSON.parse(localStorage.getItem("paymentRequests") || "[]"));
    setPlans(JSON.parse(localStorage.getItem("sitePlans") || "[]"));
    // Загружаем всех пользователей
    let allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    if (allUsers.length === 0) {
      allUsers = [
        { username: "zavuch", password: "password", phone: "+7 (777) 111-22-33", role: "SCHOOL_ADMIN", subscription: { status: "ACTIVE", plan: "Мектеп", endDate: "01.06.2026" } },
        { username: "teacher", password: "password", phone: "+7 (777) 444-55-66", role: "CLIENT", subscription: { status: "EXPIRED", plan: "Базалық", endDate: "01.05.2026" } },
        { username: "avtor", password: "password", phone: "+7 (777) 888-99-00", role: "SELLER" }
      ];
      localStorage.setItem("registeredUsers", JSON.stringify(allUsers));
    }
    setRegisteredUsers(allUsers);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Проверка секретного мастер-пароля
    if (login === "admin" && password === "Temir173173") {
      const adminUser = { username: "admin", role: "ADMIN" };
      localStorage.setItem("user", JSON.stringify(adminUser));
      setIsAdmin(true);
      window.location.reload();
      return;
    }

    // 2. Проверка через общую базу пользователей (если у юзера роль ADMIN)
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const foundUser = allUsers.find((u: any) => (u.username === login || u.phone === login) && u.password === password);

    if (foundUser && foundUser.role === "ADMIN") {
      localStorage.setItem("user", JSON.stringify(foundUser));
      setIsAdmin(true);
      window.location.reload();
    } else {
      setError("Логин, құпия сөз қате немесе сізде админ рұқсаты жоқ");
    }
  };

  const grantProAccess = (username: string, planName: string = "Pro Мұғалім") => {
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const userIdx = allUsers.findIndex((u: any) => u.username === username || u.phone === username);
    
    if (userIdx !== -1) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      allUsers[userIdx].subscription = {
        plan: planName,
        endDate: endDate.toLocaleDateString(),
        status: 'ACTIVE'
      };
      
      localStorage.setItem("registeredUsers", JSON.stringify(allUsers));
      setRegisteredUsers(allUsers);

      const current = JSON.parse(localStorage.getItem("user") || "{}");
      if (current.username === allUsers[userIdx].username) {
        localStorage.setItem("user", JSON.stringify(allUsers[userIdx]));
      }
    }
  };

  const handleApprovePayment = (id: number) => {
    const updated = paymentRequests.map(req => {
      if (req.id === id) {
        grantProAccess(req.username, req.plan);
        return { ...req, status: 'APPROVED' };
      }
      return req;
    });
    setPaymentRequests(updated);
    localStorage.setItem("paymentRequests", JSON.stringify(updated));
    alert("Төлем сәтті расталды!");
  };

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-color)" }}>
        <div style={{ background: "var(--card-bg)", padding: "40px", borderRadius: "32px", width: "100%", maxWidth: "420px", textAlign: "center", border: "1px solid var(--box-border)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🔐</div>
          <h2 style={{ marginBottom: "20px", fontWeight: "800" }}>Админ кіру</h2>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input 
              type="text" 
              placeholder="Логин немесе Телефон" 
              value={login} 
              onChange={(e) => setLogin(e.target.value)} 
              style={{ width: "100%", padding: "16px", borderRadius: "16px", border: "1px solid var(--box-border)", background: "var(--input-bg)", color: "var(--text-main)" }} 
            />
            <div style={{ position: "relative" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Құпия сөз" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ width: "100%", padding: "16px", borderRadius: "16px", border: "1px solid var(--box-border)", background: "var(--input-bg)", color: "var(--text-main)" }} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", opacity: 0.5 }}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
            {error && <p style={{ color: "#dc3545", fontSize: "0.85rem" }}>{error}</p>}
            <button type="submit" style={{ padding: "18px", background: "var(--primary-blue)", color: "white", border: "none", borderRadius: "16px", fontWeight: "800", cursor: "pointer" }}>Кіру</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      <aside style={{ width: "280px", background: "var(--card-bg)", borderRight: "1px solid var(--box-border)", padding: "30px 20px", position: "fixed", height: "100vh" }}>
        <h2 style={{ marginBottom: "30px" }}>Админ Панель</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={() => setActiveTab("payments")} style={{ padding: "12px 15px", borderRadius: "12px", border: "none", background: activeTab === "payments" ? "var(--box-tint)" : "transparent", textAlign: "left", cursor: "pointer", fontWeight: "600" }}>💳 Төлемдер</button>
          <button onClick={() => setActiveTab("users")} style={{ padding: "12px 15px", borderRadius: "12px", border: "none", background: activeTab === "users" ? "var(--box-tint)" : "transparent", textAlign: "left", cursor: "pointer", fontWeight: "600" }}>👥 Мұғалімдер</button>
          <button onClick={() => setActiveTab("tariffs")} style={{ padding: "12px 15px", borderRadius: "12px", border: "none", background: activeTab === "tariffs" ? "var(--box-tint)" : "transparent", textAlign: "left", cursor: "pointer", fontWeight: "600" }}>🏷️ Тарифтер</button>
          <button onClick={() => setActiveTab("moderation")} style={{ padding: "12px 15px", borderRadius: "12px", border: "none", background: activeTab === "moderation" ? "var(--box-tint)" : "transparent", textAlign: "left", cursor: "pointer", fontWeight: "600" }}>📂 Модерация</button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: "280px", padding: "40px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          {activeTab === "payments" && (
            <>
              <h1>Төлемдерді растау</h1>
              <div style={{ background: "var(--card-bg)", borderRadius: "24px", border: "1px solid var(--box-border)", overflow: "hidden", marginTop: "30px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--box-tint)", textAlign: "left" }}>
                      <th style={{ padding: "15px 20px", fontSize: "0.8rem", color: "#888" }}>МҰҒАЛІМ</th>
                      <th style={{ padding: "15px 20px", fontSize: "0.8rem", color: "#888" }}>ТАРИФ</th>
                      <th style={{ padding: "15px 20px", fontSize: "0.8rem", color: "#888" }}>ӘРЕКЕТ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentRequests.filter(r => r.status === 'PENDING').length === 0 ? (
                      <tr><td colSpan={3} style={{ padding: "40px", textAlign: "center", color: "#888" }}>Жаңа төлемдер жоқ</td></tr>
                    ) : (
                      paymentRequests.filter(r => r.status === 'PENDING').map(req => (
                        <tr key={req.id} style={{ borderBottom: "1px solid var(--box-border)" }}>
                          <td style={{ padding: "15px 20px" }}><b>{req.username}</b><br/><small>{req.phone}</small></td>
                          <td style={{ padding: "15px 20px" }}>{req.plan}<br/><b>{req.price}</b></td>
                          <td style={{ padding: "15px 20px" }}>
                            <button onClick={() => handleApprovePayment(req.id)} style={{ padding: "8px 16px", background: "var(--primary-blue)", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>Растау</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "users" && (
            <>
              <h1>Мұғалімдерді басқару</h1>
              <div style={{ marginTop: "30px", marginBottom: "20px" }}>
                <input 
                  type="text" 
                  placeholder="Телефон немесе аты бойынша іздеу..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "100%", padding: "15px", borderRadius: "15px", border: "1px solid var(--box-border)", background: "var(--card-bg)" }}
                />
              </div>

              <div style={{ background: "var(--card-bg)", borderRadius: "24px", border: "1px solid var(--box-border)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--box-tint)", textAlign: "left" }}>
                      <th style={{ padding: "15px 20px", fontSize: "0.8rem", color: "#888" }}>АТЫ-ЖӨНІ / ТЕЛЕФОН</th>
                      <th style={{ padding: "15px 20px", fontSize: "0.8rem", color: "#888" }}>ТАРИФ КҮЙІ</th>
                      <th style={{ padding: "15px 20px", fontSize: "0.8rem", color: "#888" }}>ӘРЕКЕТ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredUsers.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone?.includes(searchQuery)).length === 0 ? (
                      <tr><td colSpan={3} style={{ padding: "40px", textAlign: "center", color: "#888" }}>Мұғалімдер табылмады</td></tr>
                    ) : (
                      registeredUsers.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone?.includes(searchQuery)).map((u, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--box-border)" }}>
                          <td style={{ padding: "15px 20px" }}>
                            <b>{u.username}</b><br/><small>{u.phone}</small>
                          </td>
                          <td style={{ padding: "15px 20px" }}>
                            {u.subscription?.status === 'ACTIVE' ? (
                              <span style={{ color: "#34C759", fontWeight: "700" }}>PRO ({u.subscription.endDate})</span>
                            ) : (
                              <span style={{ color: "#888" }}>Стандарт</span>
                            )}
                          </td>
                          <td style={{ padding: "15px 20px" }}>
                            <button 
                              onClick={() => { grantProAccess(u.username); alert("PRO қосылды!"); }} 
                              style={{ padding: "8px 16px", background: u.subscription?.status === 'ACTIVE' ? "#eee" : "var(--primary-blue)", color: u.subscription?.status === 'ACTIVE' ? "#888" : "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}
                            >
                              PRO қосу
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "tariffs" && (
            <>
              <h1>Тарифтерді өңдеу</h1>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginTop: "30px" }}>
                {plans.map((plan, idx) => (
                  <div key={idx} style={{ background: "var(--card-bg)", padding: "25px", borderRadius: "24px", border: "1px solid var(--box-border)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
                      <div><label style={{ fontSize: "0.8rem", display: "block" }}>Тариф атауы</label><input type="text" value={plan.title} onChange={(e) => { const p = [...plans]; p[idx].title = e.target.value; setPlans(p); localStorage.setItem("sitePlans", JSON.stringify(p)); }} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid var(--box-border)" }} /></div>
                      <div><label style={{ fontSize: "0.8rem", display: "block" }}>Бағасы</label><input type="text" value={plan.price} onChange={(e) => { const p = [...plans]; p[idx].price = e.target.value; setPlans(p); localStorage.setItem("sitePlans", JSON.stringify(p)); }} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid var(--box-border)" }} /></div>
                    </div>
                    <label style={{ fontSize: "0.8rem", display: "block" }}>Мүмкіндіктер</label>
                    <textarea value={plan.features.join("\n")} onChange={(e) => { const p = [...plans]; p[idx].features = e.target.value.split("\n"); setPlans(p); localStorage.setItem("sitePlans", JSON.stringify(p)); }} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid var(--box-border)", height: "80px" }} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
