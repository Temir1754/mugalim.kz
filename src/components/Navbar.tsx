"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Sync auth state and theme
  useEffect(() => {
    setMounted(true);
    
    // Check user
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      
      // Автоматическая проверка срока действия тарифа
      if (parsedUser.subscription && parsedUser.subscription.status === 'ACTIVE') {
        const [day, month, year] = parsedUser.subscription.endDate.split('.');
        const endDate = new Date(Number(year), Number(month) - 1, Number(day));
        const now = new Date();

        if (now > endDate) {
          // Тариф аяқталды! Өшіру
          parsedUser.subscription.status = 'EXPIRED';
          localStorage.setItem("user", JSON.stringify(parsedUser));
          
          // Обновляем в общем списке пользователей
          const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
          const idx = allUsers.findIndex((u: any) => u.username === parsedUser.username);
          if (idx !== -1) {
            allUsers[idx].subscription.status = 'EXPIRED';
            localStorage.setItem("registeredUsers", JSON.stringify(allUsers));
          }
          
          alert("Сіздің тарифіңіздің мерзімі аяқталды. Жұмысты жалғастыру үшін тарифті жаңартыңыз.");
        }
      }
      
      setUser(parsedUser);
    }
    
    // Инициализация или обновление тестовых юзеров
    const existingUsersRaw = localStorage.getItem("registeredUsers");
    let allUsers = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
    
    const zavuchIdx = allUsers.findIndex((u: any) => u.username === "zavuch");
    
    if (zavuchIdx === -1) {
      // Добавляем Завуча с активным тарифом Мектеп
      allUsers.push({ username: "zavuch", password: "123321", phone: "+7 (777) 111-22-33", role: "SCHOOL_ADMIN", subscription: { status: "ACTIVE", plan: "Мектеп", endDate: "01.06.2026" } });
    } else {
      // Принудительно ставим активный тариф Мектеп
      allUsers[zavuchIdx].password = "123321";
      allUsers[zavuchIdx].subscription = { status: "ACTIVE", plan: "Мектеп", endDate: "01.06.2026" }; 
    }

    // Добавляем остальных, если их нет
    if (!allUsers.some((u: any) => u.username === "teacher")) {
      allUsers.push({ username: "teacher", password: "password", phone: "+7 (777) 444-55-66", role: "CLIENT", subscription: { status: "EXPIRED", plan: "Базалық", endDate: "01.05.2026" } });
    }
    if (!allUsers.some((u: any) => u.username === "avtor")) {
      allUsers.push({ username: "avtor", password: "password", phone: "+7 (777) 888-99-00", role: "SELLER" });
    }

    localStorage.setItem("registeredUsers", JSON.stringify(allUsers));

    // Ensure no leftover dark mode class
    document.documentElement.classList.remove("dark");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("adminAuth"); // Also clear admin session if exists
    setUser(null);
    window.location.href = "/";
  };



  return (
    <nav className="navbar">
      <div className="inner-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* LEFT: LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div className="logo" style={{ fontSize: "1.4rem" }}>
              <img src="/logo.svg" alt="Mugalim.kz" style={{ height: "60px", width: "auto" }} />
            </div>
          </Link>
        </div>

        {/* MIDDLE: LINKS (Desktop Only) */}
        <div className="nav-links">
          <Link href="/news" className={`nav-link-top ${pathname === "/news" ? "active" : ""}`}>{t('nav_news')}</Link>
          <Link href="/catalog" className={`nav-link-top ${pathname === "/catalog" ? "active" : ""}`}>{t('nav_catalog')}</Link>
          <Link href="/generator" className={`nav-link-top ${pathname === "/generator" ? "active" : ""}`}>{t('nav_plans')}</Link>
          <Link href="/pricing" className={`nav-link-top ${pathname === "/pricing" ? "active" : ""}`}>{t('nav_pricing')}</Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" style={{ color: "#FF9500", fontWeight: "bold" }} className="nav-link-top">Админ</Link>
          )}
        </div>

        {/* RIGHT: DYNAMIC VIEW */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          


          {user ? (
            /* AUTHORIZED VIEW ACTIONS */
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link href={user.role === "SELLER" ? "/seller" : "/client"} style={{ textDecoration: "none", color: "var(--text-main)", fontSize: "0.9rem", fontWeight: "600" }}>
                {user.username}
              </Link>
              <button 
                onClick={handleLogout}
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid var(--box-border)", color: "var(--text-secondary)", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", cursor: "pointer" }}
              >
                Шығу
              </button>
              <Link href={user.role === "SELLER" ? "/seller" : "/client"} style={{ textDecoration: "none" }}>
                <div className="avatar" style={{ width: "32px", height: "32px", border: "2px solid #eee", borderRadius: "50%", background: "#ccc" }}></div>
              </Link>
            </div>
          ) : (
            /* GUEST VIEW ACTIONS */
            <>
              <Link href="/login" style={{ textDecoration: "none", color: "var(--text-main)", fontWeight: "600", fontSize: "0.95rem", marginLeft: "10px" }}>
                {t('nav_login')}
              </Link>
              <Link href="/register" className="badge" style={{ textDecoration: "none", padding: "10px 24px", fontSize: "0.95rem", marginLeft: "10px" }}>
                {t('nav_register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
