"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer style={{ 
      backgroundColor: "var(--primary-navy)", 
      color: "#ffffff", 
      padding: "80px 0", 
      marginTop: "80px"
    }}>
      <div className="inner-container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "60px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="logo" style={{ color: "white", fontSize: "1.75rem" }}>
              mu-ga-lim.kz
            </div>
            <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.6)", lineHeight: "1.6" }}>
              {t('footer_desc')}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 className="serif" style={{ color: "white", marginBottom: "8px", fontSize: "1.25rem" }}>{t('footer_nav')}</h4>
            <Link href="/generator" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{t('nav_plans')}</Link>
            <Link href="/catalog" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{t('nav_catalog')}</Link>
            <Link href="/client" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Жеке кабинет</Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 className="serif" style={{ color: "white", marginBottom: "8px", fontSize: "1.25rem" }}>{t('footer_support')}</h4>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}>WhatsApp: +7 (777) 000-00-00</div>
            <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
                <Link href="#" style={{ color: "white", textDecoration: "none" }}>Instagram</Link>
                <Link href="#" style={{ color: "white", textDecoration: "none" }}>Telegram</Link>
            </div>
          </div>

        </div>

        <div style={{ 
          marginTop: "80px", 
          paddingTop: "32px", 
          borderTop: "1px solid rgba(255,255,255,0.1)", 
          textAlign: "center",
          fontSize: "0.85rem",
          color: "rgba(255,255,255,0.4)" 
        }}>
          {t('footer_rights')}
        </div>
      </div>
    </footer>
  );
}
