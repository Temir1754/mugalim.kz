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

  const subOptions = {
    [t('rubric_books_self')]: [
      { id: 'online', label: "Онлайн оқу" },
      { id: 'kz_only', label: "Тек қазақша" }
    ],
    [t('rubric_books_lyrics')]: [
      { id: 'classics', label: "Классика" },
      { id: 'modern', label: "Заманауи" }
    ],
    [t('rubric_books_fantasy')]: [
      { id: 'world', label: "Әлем классикасы" },
      { id: 'new', label: "Жаңа туындылар" }
    ],
    [t('rubric_books_method')]: [
      { id: 'active', label: "Белсенді әдістер" },
      { id: 'planning', label: "Жоспарлау" }
    ],
    [t('rubric_books_psy')]: [
      { id: 'stress', label: "Өзін-өзі реттеу" },
      { id: 'motivation', label: "Мотивация" }
    ],
    [t('rubric_presentations')]: [
      { id: 'free', label: t('rubric_free') },
      { id: 'paid', label: t('rubric_paid') }
    ]
  };

  const SidebarItem = ({ icon, label, isInteractive = false }: { icon: string, label: string, isInteractive?: boolean }) => {
    const isExpanded = expandedTag === label;
    return (
      <div style={{ position: "relative" }}>
        <div 
          onClick={() => isInteractive ? handleTagClick(label) : null}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            padding: "10px 14px", 
            background: isExpanded ? "var(--box-border)" : "var(--box-tint)", 
            borderRadius: "12px", 
            cursor: "pointer", 
            border: "1px solid var(--box-border)",
            transition: "all 0.2s ease"
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>{icon}</span>
          <span style={{ fontWeight: "700", fontSize: "0.85rem", flex: 1 }}>{label}</span>
          {isInteractive && (
            <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>{isExpanded ? "▾" : "▸"}</span>
          )}
        </div>
        
        {isExpanded && subOptions[label as keyof typeof subOptions] && (
          <div style={{ 
            position: "absolute", 
            top: "calc(100% + 5px)", 
            left: "0", 
            zIndex: 20, 
            background: "var(--card-bg)", 
            border: "1px solid var(--box-border)", 
            borderRadius: "12px", 
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            minWidth: "180px",
            overflow: "hidden"
          }}>
            {subOptions[label as keyof typeof subOptions]?.map(opt => (
              <div 
                key={opt.id} 
                style={{ padding: "10px 15px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", borderBottom: "1px solid var(--box-tint)" }}
                onClick={() => setExpandedTag(null)}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mobile-container" style={{ maxWidth: "100%" }}>
      {/* HERO SECTION WITH RUBRICS SIDEBAR */}
      <section style={{ padding: "60px 0", background: "var(--hero-bg)" }}>
        <div className="inner-container">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", alignItems: "flex-start" }}>
            
            {/* HERO CONTENT (Left) */}
            <div style={{ flex: "1 1 600px", textAlign: "left" }}>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "800", marginBottom: "20px", lineHeight: "1.1", background: "linear-gradient(90deg, #0A66F0, #00C2FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t('hero_title').split('<br />').map((text, i) => <React.Fragment key={i}>{text}{i === 0 && <br />}</React.Fragment>)}
              </h1>
              <p className="subtitle" style={{ fontSize: "1.1rem", maxWidth: "650px", marginBottom: "32px" }}>
                {t('hero_subtitle')}
              </p>
              
              <div style={{ display: "flex", gap: "12px", marginBottom: "50px", flexWrap: "wrap" }}>
                   <Link href="/register" className="generate-btn" style={{ width: "auto", padding: "16px 32px" }}>{t('hero_cta_free')}</Link>
                   <Link href="/catalog" className="day-btn" style={{ fontSize: "0.95rem", display: "flex", alignItems: "center", padding: "16px 32px", border: "1px solid var(--box-border)", borderRadius: "14px", background: "var(--card-bg)", color: "var(--text-main)", textDecoration: "none" }}>{t('hero_cta_more')}</Link>
              </div>

              <div style={{ position: "relative", width: "100%", borderRadius: "32px", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,102,240,0.15)" }}>
                   <Image src="/landing/hero.png" alt="Мұғалім.kz Ассистент" width={1000} height={560} style={{ width: "100%", height: "auto" }} />
              </div>
            </div>

            {/* SIDEBAR RUBRICS (Right) */}
            <div style={{ flex: "0 1 320px", minWidth: "280px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="form-card" style={{ padding: "20px", background: "var(--card-bg)", border: "1px solid var(--box-border)", boxShadow: "0 15px 35px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "900", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.5rem" }}>📚</span>
                  {t('rubric_title')}
                </h3>
                
                {/* Books Category */}
                <div style={{ marginBottom: "20px" }}>
                   <div style={{ fontWeight: "800", fontSize: "0.8rem", color: "var(--primary-blue)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>{t('rubric_books')}</div>
                   <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {[t('rubric_books_self'), t('rubric_books_lyrics'), t('rubric_books_fantasy'), t('rubric_books_method'), t('rubric_books_psy')].map(tag => {
                        const isExpanded = expandedTag === tag;
                        return (
                          <div key={tag} style={{ position: "relative" }}>
                            <span 
                              onClick={() => handleTagClick(tag)}
                              className="tag-chip" 
                              style={{ 
                                background: isExpanded ? "var(--primary-blue)" : "var(--box-tint)", 
                                color: isExpanded ? "white" : "inherit",
                                padding: "6px 12px", 
                                borderRadius: "8px", 
                                fontSize: "0.8rem", 
                                fontWeight: "600", 
                                cursor: "pointer", 
                                border: "1px solid var(--box-border)",
                                transition: "all 0.2s ease",
                                display: "inline-block",
                                boxShadow: isExpanded ? "0 4px 10px rgba(10,102,240,0.25)" : "none"
                              }}
                            >
                              {tag} {subOptions[tag as keyof typeof subOptions] ? (isExpanded ? "▾" : "▸") : ""}
                            </span>
                            
                            {/* Dropdown for Tag */}
                            {isExpanded && subOptions[tag as keyof typeof subOptions] && (
                              <div style={{ 
                                position: "absolute", 
                                top: "calc(100% + 5px)", 
                                left: "0", 
                                zIndex: 10, 
                                background: "var(--card-bg)", 
                                border: "1px solid var(--box-border)", 
                                borderRadius: "10px", 
                                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                                minWidth: "150px",
                                overflow: "hidden"
                              }}>
                                {subOptions[tag as keyof typeof subOptions]?.map(opt => (
                                  <div 
                                    key={opt.id} 
                                    style={{ padding: "8px 12px", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", borderBottom: "1px solid var(--box-tint)" }}
                                    onClick={() => setExpandedTag(null)}
                                  >
                                    {opt.label}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                   </div>
                </div>

                {/* Other Rubrics List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                   <SidebarItem icon="📝" label={t('rubric_sor_soch')} />
                   <SidebarItem icon="📽️" label={t('rubric_presentations')} isInteractive={true} />
                   <SidebarItem icon="📖" label={t('rubric_method')} />
                   <SidebarItem icon="💻" label={t('rubric_courses')} />
                   <SidebarItem icon="💡" label={t('rubric_didactic')} />
                   <SidebarItem icon="🧘" label={t('rubric_relaxation')} />
                </div>

                <Link href="/catalog" style={{ display: "block", textAlign: "center", marginTop: "25px", color: "var(--text-secondary)", fontSize: "0.9rem", textDecoration: "none", fontWeight: "600" }}>
                   {t('rubric_more')} →
                </Link>
              </div>

              {/* Promo Banner */}
              <div style={{ padding: "30px", background: "linear-gradient(135deg, #0A66F0, #00C2FF)", borderRadius: "24px", color: "white", boxShadow: "0 15px 35px rgba(10,102,240,0.2)" }}>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "1.2rem", fontWeight: "800" }}>Автор бол</h4>
                  <p style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "24px", lineHeight: "1.4" }}>Өз жоспарларыңды жүктеп, табыс тап.</p>
                  <Link href="/seller" style={{ background: "white", color: "#0A66F0", padding: "14px 24px", borderRadius: "14px", fontSize: "0.9rem", fontWeight: "800", textDecoration: "none", display: "inline-block", textAlign: "center", width: "100%", boxSizing: "border-box" }}>{t('feat3_cta')}</Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ padding: "100px 0", backgroundColor: "var(--bg-color)" }}>
        <div className="inner-container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <span className="badge" style={{ marginBottom: "15px", padding: "6px 14px" }}>{t('features_badge')}</span>
              <h2 style={{ fontSize: "2.5rem", fontWeight: "800" }}>{t('features_title')}</h2>
          </div>

          <div className="grid-catalog" style={{ gap: "30px" }}>
              {/* Feature 1 */}
              <div className="form-card" style={{ padding: "40px", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "24px" }}>🤖</div>
                  <h3 style={{ margin: "0 0 15px 0", fontSize: "1.5rem" }}>{t('feat1_title')}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: "1.6", flex: 1 }}>
                      {t('feat1_desc')}
                  </p>
                  <div style={{ marginTop: "30px", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)" }}>
                       <Image src="/landing/calendar.png" alt="Smart Calendar" width={400} height={250} style={{ width: "100%", height: "auto" }} />
                  </div>
              </div>

              {/* Feature 2 */}
              <div className="form-card" style={{ padding: "40px" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "24px" }}>📄</div>
                  <h3 style={{ margin: "0 0 15px 0", fontSize: "1.5rem" }}>{t('feat2_title')}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: "1.6" }}>
                      {t('feat2_desc')}
                  </p>
                  <ul style={{ padding: "0", listStyle: "none", marginTop: "30px" }}>
                      <li style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "12px", fontSize: "1.05rem" }}>
                        <span style={{ color: "var(--primary-blue)" }}>✔</span> {t('feat2_item1')}
                      </li>
                      <li style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "12px", fontSize: "1.05rem" }}>
                        <span style={{ color: "var(--primary-blue)" }}>✔</span> {t('feat2_item2')}
                      </li>
                      <li style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "12px", fontSize: "1.05rem" }}>
                        <span style={{ color: "var(--primary-blue)" }}>✔</span> {t('feat2_item3')}
                      </li>
                  </ul>
              </div>

              {/* Feature 3 */}
              <div className="form-card" style={{ padding: "40px" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "24px" }}>💰</div>
                  <h3 style={{ margin: "0 0 15px 0", fontSize: "1.5rem" }}>{t('feat3_title')}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: "1.6" }}>
                      {t('feat3_desc')}
                  </p>
                  <Link href="/seller" style={{ display: "inline-block", marginTop: "40px", color: "var(--primary-blue)", fontWeight: "800", textDecoration: "none", fontSize: "1.1rem" }}>{t('feat3_cta')}</Link>
              </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section style={{ padding: "80px 0" }}>
        <div className="inner-container">
          <div style={{ padding: "100px 40px", textAlign: "center", background: "linear-gradient(135deg, #0A66F0, #0046E2)", borderRadius: "40px", color: "white", boxShadow: "0 25px 50px rgba(10, 102, 240, 0.25)" }}>
                <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "800", marginBottom: "24px" }}>{t('cta_title')}</h2>
                <p style={{ fontSize: "1.2rem", opacity: 0.9, maxWidth: "600px", margin: "0 auto 48px auto" }}>
                    {t('cta_desc')}
                </p>
                <Link href="/register" className="generate-btn" style={{ backgroundColor: "white", color: "var(--primary-blue)", width: "auto", padding: "18px 48px", margin: "0 auto", fontSize: "1.1rem" }}>
                    {t('cta_button')}
                </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


