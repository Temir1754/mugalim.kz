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
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

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
    
    let allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    if (allUsers.length === 0) {
      allUsers = [
        { username: "zavuch", fio: "Завуч Тест", password: "password", phone: "+7 (777) 111-22-33", role: "SCHOOL_ADMIN", schoolName: "№1 мектеп-лицей", subscription: { status: "ACTIVE", plan: "Мектеп", endDate: "01.06.2026" } },
        { username: "teacher", fio: "Мұғалім Тест", password: "password", phone: "+7 (777) 444-55-66", role: "CLIENT", schoolName: "№159 гимназия", subscription: { status: "EXPIRED", plan: "Базалық", endDate: "01.05.2026" } },
        { username: "avtor", fio: "Автор Тест", password: "password", phone: "+7 (777) 888-99-00", role: "SELLER", schoolName: "TAMOS Education" }
      ];
      localStorage.setItem("registeredUsers", JSON.stringify(allUsers));
    }
    setRegisteredUsers(allUsers);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === "admin" && password === "Temir173173") {
      const adminUser = { username: "admin", role: "ADMIN" };
      localStorage.setItem("user", JSON.stringify(adminUser));
      setIsAdmin(true);
      window.location.reload();
      return;
    }

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

  const grantProAccess = (username: string, planName: string = "PRO Мұғалім") => {
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
      
      saveUsers(allUsers);
    }
  };

  const deactivateSubscription = (username: string) => {
    if (!confirm(`${username} жазылымын өшіруді растайсыз ба?`)) return;

    const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const userIdx = allUsers.findIndex((u: any) => u.username === username);

    if (userIdx !== -1) {
      allUsers[userIdx].subscription = {
        ...allUsers[userIdx].subscription,
        status: 'EXPIRED'
      };
      saveUsers(allUsers);
      alert("Жазылым сәтті өшірілді.");
    }
  };

  const saveUsers = (allUsers: any[]) => {
    localStorage.setItem("registeredUsers", JSON.stringify(allUsers));
    setRegisteredUsers(allUsers);

    const current = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedMe = allUsers.find(u => u.username === current.username);
    if (updatedMe) {
      localStorage.setItem("user", JSON.stringify(updatedMe));
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

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...registeredUsers].sort((a, b) => {
    if (!sortConfig) return 0;
    
    let aVal: any = a[sortConfig.key];
    let bVal: any = b[sortConfig.key];

    // Special cases
    if (sortConfig.key === 'plan') {
      aVal = a.subscription?.plan || 'Тегін';
      bVal = b.subscription?.plan || 'Тегін';
    } else if (sortConfig.key === 'expiry') {
      aVal = a.subscription?.endDate || '00.00.0000';
      bVal = b.subscription?.endDate || '00.00.0000';
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredUsers = sortedUsers.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.fio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.includes(searchQuery) ||
    u.schoolName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-color)" }}>
        <div style={{ background: "var(--card-bg)", padding: "40px", borderRadius: "32px", width: "100%", maxWidth: "420px", textAlign: "center", border: "1px solid var(--box-border)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🔐</div>
          <h2 style={{ marginBottom: "20px", fontWeight: "800" }}>Админ кіру</h2>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input type="text" placeholder="Логин немесе Телефон" value={login} onChange={(e) => setLogin(e.target.value)} style={{ width: "100%", padding: "16px", borderRadius: "16px", border: "1px solid var(--box-border)", background: "var(--input-bg)", color: "var(--text-main)" }} />
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} placeholder="Құпия сөз" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "16px", borderRadius: "16px", border: "1px solid var(--box-border)", background: "var(--input-bg)", color: "var(--text-main)" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", opacity: 0.5 }}>{showPassword ? "👁️" : "🙈"}</button>
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
      <aside style={{ width: "260px", background: "var(--card-bg)", borderRight: "1px solid var(--box-border)", padding: "30px 20px", position: "fixed", height: "100vh" }}>
        <h2 style={{ marginBottom: "30px", fontWeight: "900" }}>Админ Панель</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={() => setActiveTab("payments")} style={navBtnStyle(activeTab === "payments")}>Төлемдер</button>
          <button onClick={() => setActiveTab("users")} style={navBtnStyle(activeTab === "users")}>Мұғалімдер</button>
          <button onClick={() => setActiveTab("tariffs")} style={navBtnStyle(activeTab === "tariffs")}>Тарифтер</button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          {activeTab === "payments" && (
            <>
              <h1 style={{ fontWeight: "900", marginBottom: "30px" }}>Төлемдерді растау</h1>
              <div style={{ background: "var(--card-bg)", borderRadius: "24px", border: "1px solid var(--box-border)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--box-tint)", textAlign: "left" }}>
                      <th style={thStyle}>МҰҒАЛІМ</th>
                      <th style={thStyle}>ТАРИФ</th>
                      <th style={thStyle}>ӘРЕКЕТ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentRequests.filter(r => r.status === 'PENDING').length === 0 ? (
                      <tr><td colSpan={3} style={{ padding: "40px", textAlign: "center", color: "#888" }}>Жаңа төлемдер жоқ</td></tr>
                    ) : (
                      paymentRequests.filter(r => r.status === 'PENDING').map(req => (
                        <tr key={req.id} style={{ borderBottom: "1px solid var(--box-border)" }}>
                          <td style={tdStyle}><b>{req.username}</b><br/><small>{req.phone}</small></td>
                          <td style={tdStyle}>{req.plan}<br/><b>{req.price}</b></td>
                          <td style={tdStyle}>
                            <button onClick={() => handleApprovePayment(req.id)} style={btnStyle(true)}>Растау</button>
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
              <h1 style={{ fontWeight: "900", marginBottom: "30px" }}>Мұғалімдерді басқару</h1>
              <div style={{ marginBottom: "20px" }}>
                <input 
                  type="text" 
                  placeholder="Ник, аты, мектеп немесе телефон бойынша іздеу..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "100%", padding: "15px", borderRadius: "15px", border: "1px solid var(--box-border)", background: "var(--card-bg)" }}
                />
              </div>

              <div style={{ background: "var(--card-bg)", borderRadius: "24px", border: "1px solid var(--box-border)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--box-tint)", textAlign: "left" }}>
                      <th style={thSortStyle} onClick={() => requestSort('fio')}>АТЫ-ЖӨНІ / НИК {sortIcon('fio', sortConfig)}</th>
                      <th style={thSortStyle} onClick={() => requestSort('schoolName')}>МЕКТЕП {sortIcon('schoolName', sortConfig)}</th>
                      <th style={thSortStyle} onClick={() => requestSort('plan')}>ТАРИФ ПЕН МЕРЗІМІ {sortIcon('plan', sortConfig)}</th>
                      <th style={thStyle}>ӘРЕКЕТ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#888" }}>Мұғалімдер табылмады</td></tr>
                    ) : (
                      filteredUsers.map((u, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--box-border)" }}>
                          <td style={tdStyle}>
                            <b>{u.fio || u.username}</b><br/>
                            <small style={{ color: "#888" }}>@{u.username} • {u.phone}</small>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ fontSize: "0.85rem", color: "#666" }}>{u.schoolName || "Көрсетілмеген"}</div>
                          </td>
                          <td style={tdStyle}>
                            {u.subscription?.status === 'ACTIVE' ? (
                              <div>
                                <span style={{ color: "#34C759", fontWeight: "700", display: "block" }}>{u.subscription.plan}</span>
                                <small style={{ color: "#ff4d4f", fontWeight: "600" }}>{u.subscription.endDate} дейін</small>
                              </div>
                            ) : (
                              <span style={{ color: "#888" }}>Тегін тариф</span>
                            )}
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => grantProAccess(u.username)} style={btnStyle(u.subscription?.status !== 'ACTIVE', "var(--primary-blue)")}>PRO</button>
                              {u.subscription?.status === 'ACTIVE' && (
                                <button onClick={() => deactivateSubscription(u.username)} style={btnStyle(true, "#ff4d4f")}>Өшіру</button>
                              )}
                            </div>
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
              <h1 style={{ fontWeight: "900", marginBottom: "30px" }}>Тарифтерді өңдеу</h1>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                {plans.map((plan, idx) => (
                  <div key={idx} style={{ background: "var(--card-bg)", padding: "25px", borderRadius: "24px", border: "1px solid var(--box-border)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
                      <div><label style={{ fontSize: "0.8rem", display: "block", marginBottom: "5px" }}>Тариф атауы</label><input type="text" value={plan.title} onChange={(e) => { const p = [...plans]; p[idx].title = e.target.value; setPlans(p); localStorage.setItem("sitePlans", JSON.stringify(p)); }} style={inputStyle} /></div>
                      <div><label style={{ fontSize: "0.8rem", display: "block", marginBottom: "5px" }}>Бағасы</label><input type="text" value={plan.price} onChange={(e) => { const p = [...plans]; p[idx].price = e.target.value; setPlans(p); localStorage.setItem("sitePlans", JSON.stringify(p)); }} style={inputStyle} /></div>
                    </div>
                    <label style={{ fontSize: "0.8rem", display: "block", marginBottom: "5px" }}>Мүмкіндіктер</label>
                    <textarea value={plan.features.join("\n")} onChange={(e) => { const p = [...plans]; p[idx].features = e.target.value.split("\n"); setPlans(p); localStorage.setItem("sitePlans", JSON.stringify(p)); }} style={{ ...inputStyle, height: "80px", resize: "none" }} />
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

const sortIcon = (key: string, config: any) => {
  if (!config || config.key !== key) return "↕️";
  return config.direction === 'asc' ? "🔼" : "🔽";
};

const navBtnStyle = (active: boolean) => ({
  padding: "12px 15px",
  borderRadius: "12px",
  border: "none",
  background: active ? "var(--box-tint)" : "transparent",
  color: active ? "var(--primary-blue)" : "inherit",
  textAlign: "left" as const,
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "0.95rem"
});

const thStyle = { padding: "15px 20px", fontSize: "0.7rem", color: "#888", fontWeight: "900", letterSpacing: "0.5px" };
const thSortStyle = { ...thStyle, cursor: "pointer", userSelect: "none" as const };
const tdStyle = { padding: "15px 20px", fontSize: "0.95rem" };

const btnStyle = (active: boolean, color: string = "var(--primary-blue)") => ({
  padding: "8px 12px",
  background: active ? color : "#f0f2f5",
  color: active ? "white" : "#888",
  border: "none",
  borderRadius: "10px",
  cursor: active ? "pointer" : "default",
  fontWeight: "700",
  fontSize: "0.8rem",
  transition: "all 0.2s"
});

const inputStyle = { width: "100%" as const, padding: "12px", borderRadius: "10px", border: "1px solid var(--box-border)", background: "var(--input-bg)", fontSize: "0.95rem" };
