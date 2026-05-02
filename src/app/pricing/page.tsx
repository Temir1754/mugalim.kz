"use client";

import Footer from "@/components/Footer";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function PricingPage() {
  const { t, language } = useLanguage();
  
  const plans = [
    { 
      title: "Базалық", 
      price: "0 ₸", 
      features: ["айына 1 КТЖ", "аптасына 3 ҚМЖ", "маркетке кіру", "ЖИ қолдаусыз"], 
      cta: "Тегін бастау", 
      emoji: "🌱" 
    },
    { 
      title: "Pro Мұғалім", 
      price: "2 900 ₸", 
      features: ["Шексіз КТЖ", "Шексіз ҚМЖ", "Smart Calendar PRO", "ЖИ-көмек (Тақырыптар)"], 
      cta: "PRO таңдау", 
      emoji: "🚀", 
      featured: true 
    },
    { 
      title: "Мектеп / Оқу ісінің меңгерушісі", 
      price: "15 000 ₸ бастап", 
      features: ["10 мұғалімге рұқсат", "Мектептің ортақ үлгілері", "Орындалуды бақылау", "Жеке менеджер"], 
      cta: "Ұйымдар үшін", 
      emoji: "🏫" 
    }
  ];

  return (
    <div className="mobile-container" style={{ maxWidth: "100%" }}>
      <main className="content" style={{ padding: "80px 0" }}>
        <div className="inner-container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h1 style={{ fontSize: "3rem", fontWeight: "800" }}>{t('pricing_title')}</h1>
            <p className="subtitle">{t('pricing_subtitle')}</p>
          </div>

          <div className="grid-catalog">
            {plans.map((plan, idx) => (
              <div key={idx} className="form-card" style={{ 
                padding: "40px", 
                border: plan.featured ? "2px solid var(--primary-blue)" : "1px solid var(--box-border)",
                boxShadow: plan.featured ? "0 20px 50px rgba(10,102,240,0.2)" : "0 4px 15px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                background: "var(--card-bg)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}>
                {plan.featured && (
                  <span style={{ 
                    position: "absolute", 
                    top: "-16px", 
                    left: "50%", 
                    transform: "translateX(-50%)", 
                    background: "var(--primary-blue)", 
                    color: "white", 
                    padding: "6px 20px", 
                    borderRadius: "20px", 
                    fontSize: "0.85rem", 
                    fontWeight: "900",
                    letterSpacing: "1px",
                    boxShadow: "0 4px 10px rgba(10,102,240,0.3)"
                  }}>
                    ТАНЫМАЛ
                  </span>
                )}
                
                <div style={{ fontSize: "3.5rem", marginBottom: "24px", textAlign: "center" }}>{plan.emoji}</div>
                
                <h3 style={{ fontSize: "1.6rem", fontWeight: "900", marginBottom: "12px", textAlign: "center" }}>{plan.title}</h3>
                
                <div style={{ fontSize: "2.2rem", fontWeight: "900", marginBottom: "40px", textAlign: "center", display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px" }}>
                  {plan.price}
                  <span style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-secondary)" }}>{t('pricing_per_month')}</span>
                </div>
                
                <div style={{ flex: 1, display: "flex", justifyContent: "center", width: "100%", marginBottom: "40px" }}>
                  <ul style={{ padding: "0", listStyle: "none", width: "fit-content" }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ marginBottom: "18px", fontSize: "0.95rem", display: "flex", alignItems: "flex-start", gap: "12px", color: "var(--text-main)", fontWeight: "500" }}>
                          <span style={{ color: "var(--primary-blue)", fontSize: "1.1rem" }}>✓</span>
                          <span style={{ lineHeight: "1.4" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
 
                <Link href="/register" className="generate-btn" style={{ 
                  background: plan.featured ? "var(--primary-blue)" : "transparent", 
                  color: plan.featured ? "white" : "var(--primary-blue)",
                  border: "2px solid var(--primary-blue)",
                  boxShadow: plan.featured ? "0 10px 25px rgba(10,102,240,0.3)" : "none",
                  borderRadius: "16px",
                  height: "56px"
                }}>
                    {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
