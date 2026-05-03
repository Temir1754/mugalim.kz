"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Helper for date calculations
const getDaysDiff = (dateStr: string) => {
  if (!dateStr) return -999;
  try {
    const [d, m, y] = dateStr.split('.').map(Number);
    const end = new Date(y, m - 1, d);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch (e) {
    return -999;
  }
};

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChip, setFilterChip] = useState("all"); 
  const [isSmartSort, setIsSmartSort] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === "ADMIN") setIsAdmin(true);
    }

    let allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    allUsers = allUsers.map((u: any) => ({
      ...u,
      metrics: u.metrics || {
        lastLogin: "Бүгін, 12:45",
        docsCreated: Math.floor(Math.random() * 50) + 5,
        activityScore: Math.floor(Math.random() * 100)
      }
    }));
    setRegisteredUsers(allUsers);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === "admin" && password === "Temir173173") {
      localStorage.setItem("user", JSON.stringify({ username: "admin", role: "ADMIN" }));
      setIsAdmin(true);
    } else {
      setError("Қате логин немесе құпия сөз");
    }
  };

  const saveUsers = (users: any[]) => {
    localStorage.setItem("registeredUsers", JSON.stringify(users));
    setRegisteredUsers(users);
  };

  const togglePro = (username: string) => {
    const users = [...registeredUsers];
    const idx = users.findIndex(u => u.username === username);
    if (idx !== -1) {
      if (users[idx].subscription?.status === 'ACTIVE') {
        users[idx].subscription.status = 'EXPIRED';
      } else {
        const end = new Date();
        end.setDate(end.getDate() + 30);
        users[idx].subscription = {
          status: 'ACTIVE',
          plan: 'PRO Мұғалім',
          endDate: end.toLocaleDateString('ru-RU')
        };
      }
      saveUsers(users);
    }
  };

  const deleteUser = (username: string) => {
    if (!confirm("Қолданушыны өшіруді растайсыз ба?")) return;
    const users = registeredUsers.filter(u => u.username !== username);
    saveUsers(users);
  };

  const processedUsers = useMemo(() => {
    let filtered = registeredUsers.filter(u => 
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.fio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery) ||
      u.schoolName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterChip === "pro") filtered = filtered.filter(u => u.subscription?.status === 'ACTIVE');
    if (filterChip === "expiring") filtered = filtered.filter(u => getDaysDiff(u.subscription?.endDate) < 7 && u.subscription?.status === 'ACTIVE');
    if (filterChip === "active") filtered = filtered.filter(u => u.subscription?.status === 'ACTIVE' && getDaysDiff(u.subscription?.endDate) >= 7);
    if (filterChip === "problematic") filtered = filtered.filter(u => !u.subscription || u.subscription.status !== 'ACTIVE' || getDaysDiff(u.subscription?.endDate) < 3);
    if (filterChip === "noschool") filtered = filtered.filter(u => !u.schoolName);

    if (isSmartSort) {
      filtered.sort((a, b) => {
        const d1 = getDaysDiff(a.subscription?.endDate);
        const d2 = getDaysDiff(b.subscription?.endDate);
        const p1_a = (a.subscription?.status === 'ACTIVE' && d1 < 3) ? 0 : 1;
        const p1_b = (b.subscription?.status === 'ACTIVE' && d2 < 3) ? 0 : 1;
        if (p1_a !== p1_b) return p1_a - p1_b;
        const p2_a = a.subscription?.status === 'ACTIVE' ? 0 : 1;
        const p2_b = b.subscription?.status === 'ACTIVE' ? 0 : 1;
        if (p2_a !== p2_b) return p2_a - p2_b;
        if (d1 !== d2) return d1 - d2;
        return 0;
      });
    }

    return filtered;
  }, [registeredUsers, searchQuery, filterChip, isSmartSort]);

  if (!isAdmin) {
    return (
      <div className="login-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="login-card">
          <div style={{ marginBottom: "20px", fontWeight: 900, color: "#0f172a", fontSize: "1.2rem" }}>ADMIN</div>
          <h2>Админ Панель</h2>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Логин" value={login} onChange={(e) => setLogin(e.target.value)} />
            <input type="password" placeholder="Құпия сөз" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="error">{error}</p>}
            <button type="submit">Кіру</button>
          </form>
        </motion.div>
        <style jsx>{`
          .login-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 20px; font-family: sans-serif; }
          .login-card { background: white; padding: 40px; border-radius: 32px; width: 100%; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; text-align: center; }
          .icon { font-size: 3rem; margin-bottom: 20px; }
          h2 { font-weight: 900; margin-bottom: 30px; font-size: 1.5rem; }
          input { width: 100%; padding: 16px 20px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 15px; outline: none; box-sizing: border-box; font-size: 1rem; }
          input:focus { border-color: #0A66F0; }
          .error { color: #f43f5e; font-size: 0.85rem; margin-bottom: 15px; font-weight: 600; }
          button { width: 100%; padding: 16px; background: #0f172a; color: white; border: none; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.2s; }
          button:hover { background: black; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="logo-brand">
          <div className="logo-box">M</div>
          <h1>Mugalim.kz</h1>
        </div>
        <nav>
          <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>Мұғалімдер</button>
          <button className={activeTab === "payments" ? "active" : ""} onClick={() => setActiveTab("payments")}>Төлемдер</button>
          <button className={activeTab === "tariffs" ? "active" : ""} onClick={() => setActiveTab("tariffs")}>Тарифтер</button>
        </nav>
        <button className="logout-btn" onClick={() => { localStorage.removeItem("user"); window.location.reload(); }}>Шығу</button>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="top-row">
            <h1>Мұғалімдерді басқару</h1>
            <button className={`smart-sort ${isSmartSort ? 'active' : ''}`} onClick={() => setIsSmartSort(!isSmartSort)}>
              Smart сұрыптау
            </button>
          </div>

          <div className="search-box">
             <input 
               type="text" 
               placeholder="Ник, аты, мектеп немесе телефон бойынша іздеу..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>

          <div className="chips">
            <Chip label="Барлығы" active={filterChip === "all"} onClick={() => setFilterChip("all")} />
            <Chip label="PRO" active={filterChip === "pro"} onClick={() => setFilterChip("pro")} />
            <Chip label="Аяқталуда" active={filterChip === "expiring"} onClick={() => setFilterChip("expiring")} />
            <Chip label="Белсенді" active={filterChip === "active"} onClick={() => setFilterChip("active")} />
            <Chip label="Шұғыл" active={filterChip === "problematic"} onClick={() => setFilterChip("problematic")} />
            <Chip label="Мектепсіз" active={filterChip === "noschool"} onClick={() => setFilterChip("noschool")} />
          </div>
        </header>

        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>МҰҒАЛІМ МЕН НИК</th>
                <th>МЕКТЕБІ</th>
                <th>ТАРИФ ПЕН МЕРЗІМІ</th>
                <th style={{ textAlign: 'right' }}>ӘРЕКЕТТЕР</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {processedUsers.map((u) => (
                  <UserRow key={u.username} user={u} onTogglePro={() => togglePro(u.username)} onDelete={() => deleteUser(u.username)} />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {processedUsers.length === 0 && <div className="empty-state">Мұғалімдер табылмады</div>}
        </div>
      </main>

      <style jsx>{`
        .admin-layout { display: flex; min-height: 100vh; background: #f8fafc; font-family: sans-serif; color: #0f172a; }
        .sidebar { width: 280px; background: white; border-right: 1px solid #e2e8f0; padding: 30px 20px; position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; box-sizing: border-box; }
        .logo-brand { display: flex; items-center; gap: 12px; margin-bottom: 40px; }
        .logo-box { width: 40px; height: 40px; background: #0f172a; color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; }
        .logo-brand h1 { font-size: 1.2rem; font-weight: 900; margin: 0; }
        
        nav { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        nav button { width: 100%; text-align: left; padding: 12px 16px; border-radius: 12px; border: none; background: transparent; font-weight: 700; color: #64748b; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 10px; }
        nav button:hover { background: #f1f5f9; color: #0f172a; }
        nav button.active { background: #0f172a; color: white; }
        
        .logout-btn { padding: 12px 16px; border: none; background: transparent; color: #64748b; font-weight: 700; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 10px; border-radius: 12px; }
        .logout-btn:hover { background: #fff1f2; color: #e11d48; }

        .main-content { flex: 1; padding: 60px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        .main-header { margin-bottom: 40px; }
        .top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .top-row h1 { font-size: 2.2rem; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
        
        .smart-sort { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 16px; border: 1px solid #e2e8f0; background: white; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .smart-sort.active { background: #0A66F0; color: white; border-color: #0A66F0; box-shadow: 0 10px 20px rgba(10,102,240,0.2); }
        
        .search-box { background: white; border: 1px solid #e2e8f0; border-radius: 20px; display: flex; align-items: center; padding: 0 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .search-icon { color: #94a3b8; margin-right: 12px; }
        .search-box input { flex: 1; border: none; padding: 18px 0; outline: none; font-size: 1rem; color: #1e293b; font-weight: 500; }
        .search-box input::placeholder { color: #cbd5e1; }
        
        .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
        
        .table-container { background: white; border-radius: 32px; border: 1px solid #e2e8f0; box-shadow: 0 20px 40px rgba(0,0,0,0.03); overflow: hidden; }
        .user-table { width: 100%; border-collapse: collapse; }
        .user-table th { background: #f8fafc; padding: 20px 30px; text-align: left; font-size: 0.7rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f1f5f9; }
        .empty-state { padding: 60px; text-align: center; color: #94a3b8; font-weight: 500; }

        @media (max-width: 1000px) {
          .sidebar { display: none; }
          .main-content { padding: 30px; }
        }
      `}</style>
    </div>
  );
}

function UserRow({ user, onTogglePro, onDelete }: { user: any, onTogglePro: () => void, onDelete: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const daysLeft = getDaysDiff(user.subscription?.endDate);
  
  const getStatusStyle = () => {
    if (user.subscription?.status !== 'ACTIVE') return { color: '#64748b', bg: '#f1f5f9', label: 'Неактивен' };
    if (daysLeft < 3) return { color: '#e11d48', bg: '#fff1f2', label: 'Шұғыл' };
    if (daysLeft < 7) return { color: '#d97706', bg: '#fffbeb', label: 'Назар аудар' };
    return { color: '#059669', bg: '#ecfdf5', label: 'Белсенді' };
  };

  const style = getStatusStyle();

  return (
    <motion.tr 
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ borderBottom: '1px solid #f1f5f9', position: 'relative' }}
    >
      <td style={{ padding: '24px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="avatar">
            {user.fio ? user.fio.charAt(0) : user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              {user.fio || user.username} {user.subscription?.status === 'ACTIVE' && '(PRO)'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>@{user.username} • {user.phone}</div>
          </div>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="hover-card"
            >
              <div className="card-label">Белсенділік</div>
              <div className="card-item"><span>Соңғы кіру:</span> <b>{user.metrics.lastLogin}</b></div>
              <div className="card-item"><span>Құжаттар:</span> <b style={{ color: '#0A66F0' }}>{user.metrics.docsCreated} КСП</b></div>
              <div className="progress-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
                  <span>Белсенділік</span>
                  <span>{user.metrics.activityScore}%</span>
                </div>
                <div className="bar-bg"><div className="bar-fill" style={{ width: `${user.metrics.activityScore}%` }}></div></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
      <td style={{ padding: '24px 30px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#475569' }}>{user.schoolName || "Мектеп жоқ"}</div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>{user.region}</div>
      </td>
      <td style={{ padding: '24px 30px' }}>
        <div style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: '20px', background: style.bg, color: style.color, fontSize: '0.7rem', fontWeight: 900, marginBottom: '6px' }}>
          {style.label}
        </div>
        {user.subscription?.status === 'ACTIVE' && (
          <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>
            {user.subscription.plan} • <span style={{ color: daysLeft < 3 ? '#e11d48' : '#64748b' }}>{user.subscription.endDate} дейін</span>
          </div>
        )}
      </td>
      <td style={{ padding: '24px 30px', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className={`pro-btn ${user.subscription?.status === 'ACTIVE' ? 'active' : ''}`} onClick={onTogglePro}>
            {user.subscription?.status === 'ACTIVE' ? "PRO Өшіру" : "PRO Қосу"}
          </button>
          <button className="del-btn" onClick={onDelete}>Өшіру</button>
        </div>
      </td>
      <style jsx>{`
        .avatar { width: 48px; height: 48px; border-radius: 16px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #94a3b8; border: 1px solid #e2e8f0; }
        .hover-card { position: absolute; left: 30px; top: 100%; z-index: 100; width: 240px; background: white; border-radius: 24px; padding: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; pointer-events: none; }
        .card-label { font-size: 0.6rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; }
        .card-item { display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 8px; }
        .card-item span { color: #64748b; }
        .progress-box { margin-top: 15px; padding-top: 15px; border-top: 1px solid #f1f5f9; }
        .bar-bg { width: 100%; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
        .bar-fill { height: 100%; background: #0A66F0; border-radius: 10px; }
        
        .pro-btn { padding: 10px 16px; border-radius: 12px; border: none; background: #0A66F0; color: white; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: 0.2s; }
        .pro-btn.active { background: #f1f5f9; color: #475569; }
        .pro-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        
        .del-btn { width: 38px; height: 38px; border-radius: 12px; border: 1px solid #f1f5f9; background: white; cursor: pointer; transition: 0.2s; }
        .del-btn:hover { background: #fff1f2; border-color: #fff1f2; }
      `}</style>
    </motion.tr>
  );
}

function Chip({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 20px', borderRadius: '14px', border: '1px solid',
      borderColor: active ? '#0f172a' : '#e2e8f0',
      background: active ? '#0f172a' : 'white',
      color: active ? 'white' : '#64748b',
      fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', transition: '0.2s',
      boxShadow: active ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
    }}>{label}</button>
  );
}
