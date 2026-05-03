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

const getStatusColor = (status: string, daysLeft: number) => {
  if (status !== 'ACTIVE') return 'text-slate-400 bg-slate-50 border-slate-200';
  if (daysLeft < 3) return 'text-rose-600 bg-rose-50 border-rose-200';
  if (daysLeft < 7) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-emerald-600 bg-emerald-50 border-emerald-200';
};

const getStatusLabel = (status: string, daysLeft: number) => {
  if (status !== 'ACTIVE') return 'Неактивен';
  if (daysLeft < 3) return 'Шұғыл (🚨)';
  if (daysLeft < 7) return 'Назар аудар (⚠️)';
  return 'Белсенді (🟢)';
};

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChip, setFilterChip] = useState("all"); // all, pro, expiring, active, problematic, noschool
  const [isSmartSort, setIsSmartSort] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === "ADMIN") setIsAdmin(true);
    }

    let allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    // Add some mock metrics for demo if not present
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
      window.location.reload();
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

    // Apply Chips
    if (filterChip === "pro") filtered = filtered.filter(u => u.subscription?.status === 'ACTIVE');
    if (filterChip === "expiring") filtered = filtered.filter(u => getDaysDiff(u.subscription?.endDate) < 7 && u.subscription?.status === 'ACTIVE');
    if (filterChip === "active") filtered = filtered.filter(u => u.subscription?.status === 'ACTIVE' && getDaysDiff(u.subscription?.endDate) >= 7);
    if (filterChip === "problematic") filtered = filtered.filter(u => !u.subscription || u.subscription.status !== 'ACTIVE' || getDaysDiff(u.subscription?.endDate) < 3);
    if (filterChip === "noschool") filtered = filtered.filter(u => !u.schoolName);

    // Sorting
    if (isSmartSort) {
      filtered.sort((a, b) => {
        const d1 = getDaysDiff(a.subscription?.endDate);
        const d2 = getDaysDiff(b.subscription?.endDate);
        
        // Priority 1: Expiring soon (< 3 days)
        const p1_a = (a.subscription?.status === 'ACTIVE' && d1 < 3) ? 0 : 1;
        const p1_b = (b.subscription?.status === 'ACTIVE' && d2 < 3) ? 0 : 1;
        if (p1_a !== p1_b) return p1_a - p1_b;

        // Priority 2: Active PRO
        const p2_a = a.subscription?.status === 'ACTIVE' ? 0 : 1;
        const p2_b = b.subscription?.status === 'ACTIVE' ? 0 : 1;
        if (p2_a !== p2_b) return p2_a - p2_b;

        // Priority 3: Days left (ASC)
        if (d1 !== d2) return d1 - d2;

        return 0;
      });
    }

    return filtered;
  }, [registeredUsers, searchQuery, filterChip, isSmartSort]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
          <div className="text-4xl mb-6 text-center">🔐</div>
          <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Админ Панель</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Логин" value={login} onChange={(e) => setLogin(e.target.value)} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all" />
            <input type="password" placeholder="Құпия сөз" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all" />
            {error && <p className="text-rose-500 text-sm text-center font-semibold">{error}</p>}
            <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-lg shadow-slate-200">Кіру</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 h-screen sticky top-0 bg-white border-r border-slate-200/60 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl">M</div>
            <h1 className="font-black text-xl tracking-tight">Mugalim.kz</h1>
          </div>

          <nav className="space-y-2 flex-1">
            <NavBtn icon="👥" label="Мұғалімдер" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
            <NavBtn icon="💳" label="Төлемдер" active={activeTab === "payments"} onClick={() => setActiveTab("payments")} />
            <NavBtn icon="🏷️" label="Тарифтер" active={activeTab === "tariffs"} onClick={() => setActiveTab("tariffs")} />
          </nav>

          <div className="pt-8 border-t border-slate-100">
            <button onClick={() => { localStorage.removeItem("user"); window.location.reload(); }} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-semibold">
              <span>🚪</span> Шығу
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-12 max-w-[1400px] mx-auto">
          <header className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-black tracking-tight text-slate-900">Мұғалімдерді басқару</h2>
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => setIsSmartSort(!isSmartSort)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border ${isSmartSort ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
                 >
                   <span>🤖</span> Smart сұрыптау
                 </button>
              </div>
            </div>

            <div className="bg-white p-2 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-2">
              <div className="pl-6 pr-2 text-slate-400">🔍</div>
              <input 
                type="text" 
                placeholder="Ник, аты, мектеп немесе телефон бойынша іздеу..." 
                className="flex-1 py-4 outline-none text-slate-600 font-medium placeholder:text-slate-300 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              <Chip label="Барлығы" active={filterChip === "all"} onClick={() => setFilterChip("all")} />
              <Chip label="💎 PRO" active={filterChip === "pro"} onClick={() => setFilterChip("pro")} />
              <Chip label="⏰ Истекает" active={filterChip === "expiring"} onClick={() => setFilterChip("expiring")} />
              <Chip label="⚡ Активные" active={filterChip === "active"} onClick={() => setFilterChip("active")} />
              <Chip label="🚨 Проблемные" active={filterChip === "problematic"} onClick={() => setFilterChip("problematic")} />
              <Chip label="🏫 Без школы" active={filterChip === "noschool"} onClick={() => setFilterChip("noschool")} />
            </div>
          </header>

          <section className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-bottom border-slate-100">
                  <th className="px-8 py-5 text-left text-[0.7rem] font-black uppercase tracking-widest text-slate-400">Мұғалім мен Ник</th>
                  <th className="px-8 py-5 text-left text-[0.7rem] font-black uppercase tracking-widest text-slate-400">Мектебі</th>
                  <th className="px-8 py-5 text-left text-[0.7rem] font-black uppercase tracking-widest text-slate-400">Тариф пен Мерзімі</th>
                  <th className="px-8 py-5 text-right text-[0.7rem] font-black uppercase tracking-widest text-slate-400">Әрекеттер</th>
                </tr>
              </thead>
              <motion.tbody layout className="divide-y divide-slate-100">
                <AnimatePresence>
                  {processedUsers.map((u) => (
                    <UserRow key={u.username} user={u} onTogglePro={() => togglePro(u.username)} onDelete={() => deleteUser(u.username)} />
                  ))}
                </AnimatePresence>
              </motion.tbody>
            </table>
            {processedUsers.length === 0 && (
              <div className="py-20 text-center text-slate-400 font-medium">Мұғалімдер табылмады</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function UserRow({ user, onTogglePro, onDelete }: { user: any, onTogglePro: () => void, onDelete: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const daysLeft = getDaysDiff(user.subscription?.endDate);
  const statusColor = getStatusColor(user.subscription?.status, daysLeft);
  const statusLabel = getStatusLabel(user.subscription?.status, daysLeft);

  return (
    <motion.tr 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group hover:bg-slate-50/80 transition-colors relative"
    >
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold overflow-hidden border border-slate-200/50">
            {user.fio ? user.fio.charAt(0) : user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-2">
              {user.fio || user.username}
              {user.subscription?.status === 'ACTIVE' && <span title="PRO Аккаунт">💎</span>}
            </div>
            <div className="text-sm text-slate-400 font-medium">@{user.username} • {user.phone}</div>
          </div>
        </div>

        {/* Hover Preview Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute left-8 top-full -mt-2 z-50 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200/60 p-5 pointer-events-none"
            >
              <div className="text-[0.65rem] font-black uppercase tracking-wider text-slate-400 mb-3">Белсенділік</div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                   <span className="text-xs text-slate-500">Соңғы кіру:</span>
                   <span className="text-xs font-bold text-slate-800">{user.metrics.lastLogin}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-xs text-slate-500">Құжаттар саны:</span>
                   <span className="text-xs font-bold text-blue-600">{user.metrics.docsCreated} КСП/КТП</span>
                 </div>
                 <div className="pt-2 border-t border-slate-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-500">Белсенділік деңгейі:</span>
                      <span className="text-xs font-bold">{user.metrics.activityScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 rounded-full" style={{ width: `${user.metrics.activityScore}%` }}></div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
      <td className="px-8 py-6">
        <div className="text-sm font-semibold text-slate-600">{user.schoolName || "Мектеп көрсетілмеген"}</div>
        <div className="text-[0.65rem] text-slate-400 uppercase font-black tracking-tight">{user.region || "Аймақ жоқ"}</div>
      </td>
      <td className="px-8 py-6">
        <div className="flex flex-col gap-1.5">
          <div className={`text-[0.65rem] font-black uppercase px-2.5 py-1 rounded-full border w-fit ${statusColor}`}>
            {statusLabel}
          </div>
          {user.subscription?.status === 'ACTIVE' && (
            <div className="text-xs font-bold text-slate-800 ml-1">
              {user.subscription.plan} <span className="text-slate-300 font-medium">•</span> {user.subscription.endDate} дейін
            </div>
          )}
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={onTogglePro}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${user.subscription?.status === 'ACTIVE' ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'}`}
          >
            {user.subscription?.status === 'ACTIVE' ? "PRO Өшіру" : "PRO Қосу"}
          </button>
          <button 
            onClick={onDelete}
            className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-200/50 flex items-center justify-center transition-all"
          >
            🗑️
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

function NavBtn({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${active ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
    >
      <span className="text-lg">{icon}</span> {label}
    </button>
  );
}

function Chip({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2 rounded-2xl text-[0.75rem] font-bold transition-all border ${active ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
    >
      {label}
    </button>
  );
}
