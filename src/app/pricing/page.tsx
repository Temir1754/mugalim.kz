"use client";

import Footer from "@/components/Footer";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";

export default function PricingPage() {
  const { t, language } = useLanguage();
  const [plans, setPlans] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Загружаем тарифы из localStorage
    const savedPlans = localStorage.getItem("sitePlans");
    if (savedPlans) {
      setPlans(JSON.parse(savedPlans));
    } else {
      // Дефолтные тарифы, если их еще нет в базе
      const defaultPlans = [
        { 
          title: "Базалық", 
          price: "5 000 ₸", 
          features: ["аптасына 5 ҚМЖ", "айына 25 ҚМЖ / 1 КТЖ", "Smart Calendar PRO", "ЖИ-көмек (Тақырыптар)"], 
          cta: "Бастау", 
          emoji: "🌱" 
        },
        { 
          title: "Pro Мұғалім", 
          price: "20 000 ₸", 
          features: ["Шексіз КТЖ", "Шексіз ҚМЖ", "Smart Calendar PRO", "ЖИ-көмек (Тақырыптар)"], 
          cta: "PRO таңдау", 
          emoji: "🚀", 
          featured: true 
        },
        { 
          title: "Мектеп / Оқу ісінің меңгерушісі", 
          price: "50 000 ₸ бастап", 
          features: ["10 мұғалімге рұқсат", "Мектептің ортақ үлгілері", "Орындалуды бақылау", "Жеке менеджер"], 
          cta: "Ұйымдар үшін", 
          emoji: "🏫" 
        }
      ];
      setPlans(defaultPlans);
      localStorage.setItem("sitePlans", JSON.stringify(defaultPlans));
    }
  }, []);

  return (
    <div className="mobile-container" style={{ maxWidth: "100%" }}>
      <main className="content" style={{ padding: "10px 0", height: "calc(100vh - 80px)", display: "flex", alignItems: "center" }}>
        <div className="inner-container" style={{ width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "5px" }}>{t('pricing_title')}</h1>
            <p className="subtitle" style={{ fontSize: "0.9rem", margin: 0 }}>{t('pricing_subtitle')}</p>
          </div>

          <div className="grid-catalog">
            {plans.map((plan, idx) => (
              <div key={idx} className="form-card" style={{ 
                padding: "20px", 
                border: plan.featured ? "2px solid var(--primary-blue)" : "1px solid var(--box-border)",
                boxShadow: plan.featured ? "0 15px 40px rgba(10,102,240,0.15)" : "0 4px 15px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                background: "var(--card-bg)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                height: "auto"
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
                
                <div style={{ fontSize: "2.2rem", marginBottom: "10px", textAlign: "center" }}>{plan.emoji}</div>
                
                <h3 style={{ fontSize: "1.2rem", fontWeight: "900", marginBottom: "5px", textAlign: "center" }}>{plan.title}</h3>
                
                <div style={{ fontSize: "1.6rem", fontWeight: "900", marginBottom: "15px", textAlign: "center", display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px" }}>
                  {plan.price}
                  <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>{t('pricing_per_month')}</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: "15px" }}>
                  <ul style={{ padding: "0", listStyle: "none", width: "fit-content" }}>
                    {plan.features.map((f: string, i: number) => (
                      <li key={i} style={{ marginBottom: "8px", fontSize: "0.8rem", display: "flex", alignItems: "flex-start", gap: "8px", color: "var(--text-main)", fontWeight: "500" }}>
                          <span style={{ color: "var(--primary-blue)", fontSize: "0.9rem" }}>✓</span>
                          <span style={{ lineHeight: "1.2" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link 
                  href={user ? `/checkout?plan=${encodeURIComponent(plan.title)}&price=${encodeURIComponent(plan.price)}` : "/register"} 
                  className={`generate-btn ${(user?.subscription?.status === 'ACTIVE' && user?.subscription?.plan === plan.title) ? 'disabled' : ''}`}
                  style={{ 
                    background: (user?.subscription?.status === 'ACTIVE' && user?.subscription?.plan === plan.title) ? "#e0e0e0" : (plan.featured ? "var(--primary-blue)" : "transparent"), 
                    color: (user?.subscription?.status === 'ACTIVE' && user?.subscription?.plan === plan.title) ? "#888" : (plan.featured ? "white" : "var(--primary-blue)"),
                    border: "2px solid var(--primary-blue)",
                    borderRadius: "14px",
                    height: "48px",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    pointerEvents: (user?.subscription?.status === 'ACTIVE' && user?.subscription?.plan === plan.title) ? "none" : "auto",
                    opacity: (user?.subscription?.status === 'ACTIVE' && user?.subscription?.plan === plan.title) ? 0.7 : 1
                  }}
                >
                    {user?.subscription?.status === 'ACTIVE' && user?.subscription?.plan === plan.title 
                      ? "Белсенді" 
                      : (user ? "Сатып алу" : plan.cta)}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
