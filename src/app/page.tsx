"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import React, { useState } from "react";

export default function Landing() {
  const { t, language } = useLanguage();
  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  const handleTagClick = (tag: string) => {
    setExpandedTag(expandedTag === tag ? null : tag);
  };

  const SidebarItem = ({ label }: { label: string }) => (
    <div 
      style={{ 
        padding: "12px 16px", 
        borderBottom: "1px solid var(--border-color)", 
        fontSize: "0.9rem", 
        fontWeight: 500,
        color: "var(--accent-slate)",
        cursor: "pointer"
      }}
    >
      {label}
    </div>
  );

  return (
    <div style={{ background: "var(--bg-color)" }}>
      {/* HERO SECTION */}
      <section style={{ padding: "100px 0", borderBottom: "1px solid var(--border-color)" }}>
        <div className="inner-container">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "60px", alignItems: "center" }}>
            
            <div style={{ flex: "1 1 500px" }}>
              <h1 style={{ fontSize: "clamp(3rem, 6vw, 4.5rem)", marginBottom: "32px", lineHeight: "1.1" }}>
                {t('hero_title').replace('<br />', ' ')}
              </h1>
              <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "48px", maxWidth: "600px" }}>
                {t('hero_subtitle')}
              </p>
              
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Link href="/generator" className="btn-primary" style={{ textDecoration: "none" }}>
                  {t('hero_cta_free')}
                </Link>
                <Link href="/catalog" className="btn-primary" style={{ background: "white", color: "var(--primary-navy)", border: "1px solid var(--primary-navy)", textDecoration: "none" }}>
                  {t('hero_cta_more')}
                </Link>
              </div>
            </div>

            <div style={{ flex: "1 1 400px", border: "1px solid var(--border-color)", padding: "40px", background: "white" }}>
              <h3 className="serif" style={{ fontSize: "1.5rem", marginBottom: "24px" }}>{t('rubric_title')}</h3>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <SidebarItem label={t('rubric_books')} />
                <SidebarItem label={t('rubric_sor_soch')} />
                <SidebarItem label={t('rubric_presentations')} />
                <SidebarItem label={t('rubric_method')} />
                <SidebarItem label={t('rubric_courses')} />
                <SidebarItem label={t('rubric_didactic')} />
              </div>
              <Link href="/catalog" style={{ display: "block", marginTop: "24px", textAlign: "right", color: "var(--primary-navy)", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>
                {t('rubric_more')} →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ padding: "120px 0", background: "white" }}>
        <div className="inner-container">
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
              <h2 style={{ fontSize: "3rem", marginBottom: "16px" }}>{t('features_title')}</h2>
              <div style={{ width: "60px", height: "2px", background: "var(--primary-navy)", margin: "0 auto" }}></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
              {/* Feature 1 */}
              <div style={{ padding: "40px", border: "1px solid var(--border-color)" }}>
                  <h3 className="serif" style={{ fontSize: "1.75rem", marginBottom: "20px" }}>{t('feat1_title')}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: "1.7" }}>
                      {t('feat1_desc')}
                  </p>
              </div>

              {/* Feature 2 */}
              <div style={{ padding: "40px", border: "1px solid var(--border-color)" }}>
                  <h3 className="serif" style={{ fontSize: "1.75rem", marginBottom: "20px" }}>{t('feat2_title')}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: "1.7", marginBottom: "24px" }}>
                      {t('feat2_desc')}
                  </p>
                  <ul style={{ padding: "0", listStyle: "none", color: "var(--primary-navy)", fontWeight: 600 }}>
                      <li style={{ marginBottom: "12px" }}>— {t('feat2_item1')}</li>
                      <li style={{ marginBottom: "12px" }}>— {t('feat2_item2')}</li>
                      <li>— {t('feat2_item3')}</li>
                  </ul>
              </div>

              {/* Feature 3 */}
              <div style={{ padding: "40px", border: "1px solid var(--border-color)", background: "var(--primary-navy)", color: "white" }}>
                  <h3 className="serif" style={{ fontSize: "1.75rem", marginBottom: "20px", color: "white" }}>{t('feat3_title')}</h3>
                  <p style={{ opacity: 0.8, fontSize: "1.1rem", lineHeight: "1.7", marginBottom: "32px" }}>
                      {t('feat3_desc')}
                  </p>
                  <Link href="/seller" style={{ color: "white", fontWeight: 700, textDecoration: "underline" }}>{t('feat3_cta')}</Link>
              </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: "100px 0", background: "var(--bg-color)" }}>
        <div className="inner-container" style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "3.5rem", marginBottom: "32px" }}>{t('cta_title')}</h2>
            <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", maxWidth: "700px", margin: "0 auto 48px auto" }}>
                {t('cta_desc')}
            </p>
            <Link href="/register" className="btn-primary" style={{ padding: "20px 48px", fontSize: "1.1rem", textDecoration: "none" }}>
                {t('cta_button')}
            </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
