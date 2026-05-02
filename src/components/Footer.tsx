"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer style={{ 
      backgroundColor: "#1a1a24", 
      color: "#ffffff", 
      padding: "60px 20px 100px 20px", 
      marginTop: "40px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="grid-form" style={{ gap: "40px" }}>
          
          {/* Logo & About */}
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div className="logo" style={{ color: "white", fontSize: "1.5rem", gap: "10px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              <span style={{ fontWeight: "800" }}>Мұғалім.kz</span>
            </div>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: "1.6" }}>
              {t('footer_desc')}
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h4 style={{ color: "white", marginBottom: "5px" }}>{t('footer_nav')}</h4>
            <Link href="/generator" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.9rem" }}>{t('nav_plans')}</Link>
            <Link href="/catalog" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.9rem" }}>{t('nav_catalog')}</Link>
            <Link href="/client" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.9rem" }}>Жеке кабинет</Link>
          </div>

          {/* Support & Socials */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h4 style={{ color: "white", marginBottom: "5px" }}>{t('footer_support')}</h4>
            <Link href="https://wa.me/77770000000" style={{ color: "white", textDecoration: "none", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}>
               <span>💬 WhatsApp: +7 (777) 000-00-00</span>
            </Link>
            <div style={{ marginTop: "10px", display: "flex", gap: "15px" }}>
                <Link href="#" style={{ color: "white", fontSize: "0.95rem", textDecoration: "none" }}>📸 Instagram</Link>
                <Link href="#" style={{ color: "white", fontSize: "0.95rem", textDecoration: "none" }}>✈️ Telegram</Link>
            </div>
          </div>

        </div>

        <div style={{ 
          marginTop: "60px", 
          paddingTop: "20px", 
          borderTop: "1px solid rgba(255,255,255,0.1)", 
          textAlign: "center",
          fontSize: "0.8rem",
          color: "rgba(255,255,255,0.3)" 
        }}>
          {t('footer_rights')}
        </div>
      </div>
    </footer>
  );
}
