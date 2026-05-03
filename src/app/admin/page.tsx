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
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("private");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (Array.isArray(data)) setRegisteredUsers(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === "ADMIN") setIsAdmin(true);
    }
    fetchUsers();
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

  const approveRequest = async (username: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, action: "APPROVE" }),
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const rejectRequest = async (username: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, action: "REJECT" }),
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  const groups = useMemo(() => {
    const filtered = registeredUsers.filter(u => 
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.fio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery)
    );

    return {
      privateTeachers: filtered.filter(u => u.schoolType === "Жекеменшік" && u.role === "CLIENT"),
      privateAdmins: filtered.filter(u => u.schoolType === "Жекеменшік" && u.role === "SCHOOL_ADMIN"),
      stateTeachers: filtered.filter(u => u.schoolType === "Мемлекеттік" && u.role === "CLIENT"),
      stateAdmins: filtered.filter(u => u.schoolType === "Мемлекеттік" && u.role === "SCHOOL_ADMIN"),
      sellers: filtered.filter(u => u.role === "SELLER")
    };
  }, [registeredUsers, searchQuery]);

  if (!isAdmin) {
    return (
      <div className="login-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="login-card">
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
          h2 { font-weight: 900; margin-bottom: 30px; font-size: 1.5rem; }
          input { width: 100%; padding: 16px 20px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 15px; outline: none; box-sizing: border-box; font-size: 1rem; }
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
        <div className="sidebar-brand">MUGALIM.KZ</div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'private' ? 'active' : ''}`} onClick={() => setActiveTab('private')}>Жекеменшік</button>
          <button className={`nav-item ${activeTab === 'state' ? 'active' : ''}`} onClick={() => setActiveTab('state')}>Мемлекеттік</button>
          <button className={`nav-item ${activeTab === 'sellers' ? 'active' : ''}`} onClick={() => setActiveTab('sellers')}>Сатушылар</button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => { localStorage.removeItem("user"); window.location.reload(); }}>Шығу</button>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>{activeTab === 'private' ? 'Жекеменшік мектептер' : activeTab === 'state' ? 'Мемлекеттік мектептер' : 'Сатушылар'}</h1>
          </div>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Іздеу (ник, аты, телефон)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <main className="content">
          {activeTab === 'private' && (
            <>
              <SubSection title="Мұғалімдер" users={groups.privateTeachers} onApprove={approveRequest} onReject={rejectRequest} />
              <SubSection title="Оқу ісінің меңгерушісі" users={groups.privateAdmins} onApprove={approveRequest} onReject={rejectRequest} />
            </>
          )}

          {activeTab === 'state' && (
            <>
              <SubSection title="Мұғалімдер" users={groups.stateTeachers} onApprove={approveRequest} onReject={rejectRequest} />
              <SubSection title="Оқу ісінің меңгерушісі" users={groups.stateAdmins} onApprove={approveRequest} onReject={rejectRequest} />
            </>
          )}

          {activeTab === 'sellers' && (
            <SellerTable users={groups.sellers} />
          )}
        </main>
      </div>

      <style jsx>{`
        .admin-layout { display: flex; min-height: 100vh; background: #fdfdfd; font-family: sans-serif; color: #1e293b; }
        
        .sidebar { width: 280px; background: white; border-right: 1px solid #f1f5f9; display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 100; }
        .sidebar-brand { padding: 40px; font-size: 1.2rem; font-weight: 900; letter-spacing: 2px; color: #0f172a; border-bottom: 1px solid #f1f5f9; }
        .sidebar-nav { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; gap: 8px; }
        .nav-item { padding: 16px 20px; border-radius: 12px; border: none; background: transparent; text-align: left; font-weight: 700; color: #64748b; cursor: pointer; transition: 0.2s; font-size: 0.95rem; }
        .nav-item:hover { background: #f8fafc; color: #0f172a; }
        .nav-item.active { background: #0f172a; color: white; }
        .sidebar-footer { padding: 20px; border-top: 1px solid #f1f5f9; }
        
        .main-content { flex-grow: 1; margin-left: 280px; }
        
        .header { background: white; padding: 40px 60px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 90; }
        .header h1 { font-size: 1.8rem; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
        
        .search-bar { width: 400px; }
        .search-bar input { width: 100%; padding: 14px 20px; border-radius: 14px; border: 1px solid #e2e8f0; background: #f8fafc; outline: none; font-size: 0.9rem; font-weight: 600; transition: 0.2s; }
        .search-bar input:focus { border-color: #0f172a; background: white; }

        .logout-btn { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #fee2e2; background: #fef2f2; font-weight: 700; cursor: pointer; color: #ef4444; font-size: 0.9rem; }
        .logout-btn:hover { background: #fee2e2; }

        .content { padding: 40px 60px; max-width: 1400px; }
      `}</style>
    </div>
  );
}


function Section({ title, children }: any) {
  return (
    <div style={{ marginBottom: "60px" }}>
      <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "30px", paddingBottom: "10px", borderBottom: "3px solid #0f172a", display: "inline-block" }}>{title}</h2>
      {children}
    </div>
  );
}

function SubSection({ title, users, onApprove, onReject }: any) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#64748b", marginBottom: "20px" }}>{title}</h3>
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>№</th>
              <th>НИК</th>
              <th>ФИО</th>
              <th>МАМАНДЫҒЫ</th>
              <th>ҚАЛАСЫ</th>
              <th>СЫНЫБЫ</th>
              <th>МЕКТЕБІ</th>
              <th>НОМЕРІ</th>
              <th>ТАРИФ ТҮРІ</th>
              <th style={{ textAlign: "center" }}>СҰРАУ</th>
              <th>БАСТАЛУЫ</th>
              <th>АЯҚТАЛУЫ</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map((u: any, i: number) => (
              <tr key={u.username}>
                <td>{i + 1}</td>
                <td style={{ fontWeight: 700 }}>{u.username}</td>
                <td>{u.fio || "-"}</td>
                <td>{u.specialty || "-"}</td>
                <td>{u.region || "-"}</td>
                <td>{u.className || "-"}</td>
                <td>{u.schoolName || "-"}</td>
                <td>{u.phone}</td>
                <td>
                  <span className={`tariff-badge ${u.subscription?.status === 'ACTIVE' ? 'pro' : ''}`}>
                    {u.subscription?.plan || "Базалық"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button className="approve-btn" onClick={() => onApprove(u.username)}>растау</button>
                    <button className="reject-btn" onClick={() => onReject(u.username)}>бас тарту</button>
                  </div>
                </td>
                <td>{u.subscription?.startDate || "-"}</td>
                <td>{u.subscription?.endDate || "-"}</td>
              </tr>
            )) : (
              <tr><td colSpan={12} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Қолданушылар жоқ</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .table-wrapper { background: white; border-radius: 24px; border: 1px solid #f1f5f9; box-shadow: 0 10px 30px rgba(0,0,0,0.02); overflow-x: auto; }
        .custom-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .custom-table th { background: #f8fafc; padding: 16px 20px; text-align: left; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
        .custom-table td { padding: 16px 20px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
        
        .tariff-badge { padding: 4px 10px; border-radius: 8px; font-weight: 800; font-size: 0.7rem; background: #f1f5f9; color: #64748b; }
        .tariff-badge.pro { background: #fffbeb; color: #d97706; }
        
        .approve-btn { padding: 6px 12px; border-radius: 8px; border: none; background: #fef08a; color: #854d0e; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: 0.2s; }
        .approve-btn:hover { background: #fde047; }
        
        .reject-btn { padding: 6px 12px; border-radius: 8px; border: none; background: #f1f5f9; color: #64748b; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: 0.2s; }
        .reject-btn:hover { background: #e2e8f0; }
      `}</style>
    </div>
  );
}

function SellerTable({ users }: any) {
  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            <th>№</th>
            <th>НИК</th>
            <th>ФИО</th>
            <th>МАМАНДЫҒЫ</th>
            <th>ҚАЛАСЫ</th>
            <th>СЫНЫБЫ</th>
            <th>МЕКТЕБІ</th>
            <th>НОМЕРІ</th>
            <th>КТЖ</th>
            <th>ҚМЖ</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? users.map((u: any, i: number) => (
            <tr key={u.username}>
              <td>{i + 1}</td>
              <td style={{ fontWeight: 700 }}>{u.username}</td>
              <td>{u.fio || "-"}</td>
              <td>{u.specialty || "-"}</td>
              <td>{u.region || "-"}</td>
              <td>{u.className || "-"}</td>
              <td>{u.schoolName || "-"}</td>
              <td>{u.phone}</td>
              <td>01.01.2026</td>
              <td><span style={{ fontWeight: 800, color: "#0A66F0" }}>1 тоқсан</span></td>
            </tr>
          )) : (
            <tr><td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Сатушылар жоқ</td></tr>
          )}
        </tbody>
      </table>
      <style jsx>{`
        .table-wrapper { background: white; border-radius: 24px; border: 1px solid #f1f5f9; box-shadow: 0 10px 30px rgba(0,0,0,0.02); overflow-x: auto; }
        .custom-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .custom-table th { background: #f8fafc; padding: 16px 20px; text-align: left; font-weight: 900; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
        .custom-table td { padding: 16px 20px; border-bottom: 1px solid #f8fafc; }
      `}</style>
    </div>
  );
}
