"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";

export default function PricingPage() {
  const { t } = useLanguage();
  const [plans, setPlans] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedPlans = localStorage.getItem("sitePlans");
    if (savedPlans) {
      setPlans(JSON.parse(savedPlans));
    } else {
      const defaultPlans = [
        { 
          title: "Базалық", 
          price: "5 000 ₸", 
          features: ["аптасына 5 ҚМЖ", "айына 25 ҚМЖ / 1 КТЖ", "Smart Calendar PRO", "ЖИ-көмек (Тақырыптар)"], 
          cta: "Бастау"
        },
        { 
          title: "Pro Мұғалім", 
          price: "20 000 ₸", 
          features: ["Шексіз КТЖ", "Шексіз ҚМЖ", "Smart Calendar PRO", "ЖИ-көмек (Тақырыптар)"], 
          cta: "PRO таңдау", 
          featured: true 
        },
        { 
          title: "Мектеп / Оқу ісінің меңгерушісі", 
          price: "50 000 ₸ бастап", 
          features: ["10 мұғалімге рұқсат", "Мектептің ортақ үлгілері", "Орындалуды бақылау", "Жеке менеджер"], 
          cta: "Ұйымдар үшін"
        }
      ];
      setPlans(defaultPlans);
      localStorage.setItem("sitePlans", JSON.stringify(defaultPlans));
    }
  }, []);

  return (
    <div style={{ background: "var(--bg-color)", minHeight: "100vh", padding: "80px 0" }}>
      <div className="inner-container">
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h1 style={{ fontSize: "3rem", marginBottom: "16px" }}>{t('pricing_title')}</h1>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
            {t('pricing_subtitle')}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
          {plans.map((plan, idx) => (
            <div key={idx} style={{ 
              padding: "48px 32px", 
              border: "1px solid var(--border-color)",
              background: "white",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              textAlign: "center"
            }}>
              {plan.featured && (
                <span style={{ 
                  position: "absolute", 
                  top: "0", 
                  left: "50%", 
                  transform: "translate(-50%, -50%)", 
                  background: "var(--primary-navy)", 
                  color: "white", 
                  padding: "4px 16px", 
                  fontSize: "0.75rem", 
                  fontWeight: 700,
                  letterSpacing: "1px"
                }}>
                  ТАНЫМАЛ
                </span>
              )}
              
              <h3 className="serif" style={{ fontSize: "1.5rem", marginBottom: "16px" }}>{plan.title}</h3>
              
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--primary-navy)", marginBottom: "32px" }}>
                {plan.price}
                <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-muted)", marginLeft: "4px" }}>{t('pricing_per_month')}</span>
              </div>
              
              <ul style={{ padding: "0", listStyle: "none", marginBottom: "40px", flex: 1 }}>
                {plan.features.map((f: string, i: number) => (
                  <li key={i} style={{ marginBottom: "12px", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                    — {f}
                  </li>
                ))}
              </ul>

              <Link 
                href={user ? `/checkout?plan=${encodeURIComponent(plan.title)}&price=${encodeURIComponent(plan.price)}` : "/register"} 
                className="btn-primary"
                style={{ 
                  textDecoration: "none",
                  opacity: (user?.subscription?.status === 'ACTIVE' && user?.subscription?.plan === plan.title) ? 0.5 : 1,
                  pointerEvents: (user?.subscription?.status === 'ACTIVE' && user?.subscription?.plan === plan.title) ? "none" : "auto"
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
      <Footer />
    </div>
  );
}
