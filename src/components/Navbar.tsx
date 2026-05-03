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

  useEffect(() => {
    setMounted(true);
    
    // Check user session
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    }
    
    // Ensure no leftover dark mode class
    document.documentElement.classList.remove("dark");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("adminAuth"); 
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link href={user.role === "SELLER" ? "/seller" : "/client"} style={{ textDecoration: "none", color: "var(--text-main)", fontSize: "0.9rem", fontWeight: "600" }}>
                {user.username === "admin" ? "Профиль" : user.username}
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
