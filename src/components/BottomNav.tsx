"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Не показываем навигацию на лендинге
  if (pathname === "/") return null;

  return (
    <nav className="bottom-nav">
      <Link href="/generator" className={`nav-item ${pathname === "/generator" ? "active" : ""}`} style={{ textDecoration: 'none' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
        <span>{t('nav_plans')}</span>
      </Link>
      
      <Link href="/catalog" className={`nav-item ${pathname === "/catalog" ? "active" : ""}`} style={{ textDecoration: 'none' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 10h16M4 14h16M4 18h16M4 6h16"/>
        </svg>
        <span>{t('nav_catalog')}</span>
      </Link>
      
      <Link href="/client" className={`nav-item ${pathname === "/client" ? "active" : ""}`} style={{ textDecoration: 'none' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/>
        </svg>
        <span>Жеке кабинет</span>
      </Link>
    </nav>
  );
}
