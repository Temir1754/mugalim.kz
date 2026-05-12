"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("adminAuth"); 
    setUser(null);
    window.location.href = "/";
  };

  const getCabinetLink = () => {
    if (user?.role === "ADMIN") return "/admin";
    if (user?.role === "SELLER") return "/seller";
    return "/client";
  };

  return (
    <nav className="navbar">
      <div className="inner-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        <Link href="/" className="logo">
          mu-ga-lim.kz
        </Link>

        <div className="nav-links">
          <Link href="/catalog" className={`nav-link-top ${pathname === "/catalog" ? "active" : ""}`}>{t('nav_catalog')}</Link>
          <Link href="/generator" className={`nav-link-top ${pathname === "/generator" ? "active" : ""}`}>{t('nav_plans')}</Link>
          <Link href="/pricing" className={`nav-link-top ${pathname === "/pricing" ? "active" : ""}`}>{t('nav_pricing')}</Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className={`nav-link-top ${pathname === "/admin" ? "active" : ""}`} style={{ color: "#0A66F0", fontWeight: 800 }}>Админ</Link>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <Link href={getCabinetLink()} className="nav-link-top" style={{ fontWeight: "700" }}>
                {user.fio || user.username}
              </Link>
              <button 
                onClick={handleLogout}
                className="btn-primary"
                style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2", padding: "6px 15px", fontSize: "0.85rem" }}
              >
                Шығу
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="nav-link-top">
                {t('nav_login')}
              </Link>
              <Link href="/register" className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.9rem", textDecoration: "none" }}>
                {t('nav_register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

