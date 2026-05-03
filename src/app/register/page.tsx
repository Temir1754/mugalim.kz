"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/Footer";

export default function Register() {
  const router = useRouter();
  const { t } = useLanguage();
  const [role, setRole] = useState("CLIENT"); 
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fio: "",
    phone: "+7 ",
    region: "Алматы",
    schoolType: "Мемлекеттік",
    schoolName: "",
    specialty: "",
    className: ""
  });

  const specialties = [
    "Қазақ тілі", "Орыс тілі", "Қазақ әдебиеті", "Орыс әдебиеті", "Әдебиеттік оқу", "Шетел тілі",
    "Математика", "Алгебра", "Геометрия", "Жаратылыстану", "Биология", "Физика", "Химия", "География",
    "Қазақстан тарихы", "Дүниежүзі тарихы", "Информатика", "Музыка", "Сынып жетекші"
  ];

  const schoolsData: Record<string, Record<string, string[]>> = {
    "Алматы": {
      "Мемлекеттік": ["№1 мектеп-гимназия", "№159 гимназия", "№178 лицей", "№173 мектеп"],
      "Жекеменшік": ["TAMOS Education", "Haileybury Almaty", "Quantum STEM School", "NGS"]
    },
    "Астана": {
      "Мемлекеттік": ["№17 гимназия", "№66 мектеп-лицей", "№81 «Astana English School»"],
      "Жекеменшік": ["Nur-Orda", "Spectrum International School", "BINOM School"]
    }
  };

  const availableSchools = (schoolsData[formData.region] && schoolsData[formData.region][formData.schoolType]) || ["Басқа мектеп"];

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 0) return "+7 ";
    let formatted = "+7 ";
    if (numbers.length > 1) {
      const main = numbers.substring(1);
      if (main.length > 0) formatted += "(" + main.substring(0, 3);
      if (main.length > 3) formatted += ") " + main.substring(3, 6);
      if (main.length > 6) formatted += "-" + main.substring(6, 8);
      if (main.length > 8) formatted += "-" + main.substring(8, 10);
    }
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === "phone") value = formatPhone(value);
    if (name === "username") value = value.toLowerCase().replace(/[^a-z0-9_]/g, ""); 
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const nextStep = () => {
    if (step === 1 && (!formData.fio || formData.phone.length < 18)) {
      setError("Аты-жөніңіз бен телефон нөмірін толық толтырыңыз");
      return;
    }
    if (step === 2 && (role !== 'SELLER' && (!formData.region || !formData.schoolName))) {
      setError("Барлық өрістерді толтырыңыз");
      return;
    }
    setStep(step + 1);
    setError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) { nextStep(); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Тіркелу қатесі");
      }
      window.location.href = "/login?registered=true";
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "sans-serif",
    transition: "0.2s"
  };

  return (
    <div style={{ background: "white", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Left Side: Form */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
          <div style={{ width: "100%", maxWidth: "440px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 900, letterSpacing: "-1px" }}>Тіркелу</h1>
                <p style={{ margin: "5px 0 0", color: "#64748b", fontWeight: 600, fontSize: "0.9rem" }}>{step}-ші қадам: {step === 1 ? 'Жеке мәліметтер' : step === 2 ? 'Мектепті таңдау' : 'Аккаунт ашу'}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#cbd5e1", letterSpacing: "1px" }}>{step}/3</span>
              </div>
            </div>

            {/* Role Switcher */}
            {step === 1 && (
              <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "14px", marginBottom: "25px" }}>
                {['CLIENT', 'SCHOOL_ADMIN', 'SELLER'].map((r) => (
                  <button 
                    key={r}
                    onClick={() => setRole(r)}
                    style={{ 
                      flex: 1, padding: "10px", border: "none", borderRadius: "11px", 
                      background: role === r ? "white" : "transparent",
                      color: role === r ? "#0f172a" : "#64748b",
                      fontWeight: 800, fontSize: "0.75rem", cursor: "pointer", transition: "0.2s",
                      boxShadow: role === r ? "0 4px 10px rgba(0,0,0,0.05)" : "none"
                    }}
                  >
                    {r === 'CLIENT' ? 'Мұғалім' : r === 'SCHOOL_ADMIN' ? 'Завуч' : 'Автор'}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleRegister}>
              {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: "12px", borderRadius: "12px", marginBottom: "20px", fontSize: "0.85rem", fontWeight: 600, border: "1px solid #fee2e2" }}>{error}</div>}

              <div style={{ minHeight: "260px" }}>
                {step === 1 && (
                  <div>
                    <div style={{ marginBottom: "15px" }}>
                      <label style={labelStyle}>Толық аты-жөніңіз</label>
                      <input name="fio" placeholder="Мысалы: Асанов Арман" value={formData.fio} onChange={handleChange} style={inputStyle} required />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                      <label style={labelStyle}>Телефон нөмірі</label>
                      <input name="phone" placeholder="+7 (___) ___-__-__" value={formData.phone} onChange={handleChange} style={inputStyle} required />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                       <div>
                         <label style={labelStyle}>Аймақ</label>
                         <select name="region" value={formData.region} onChange={handleChange} style={inputStyle}>
                           {Object.keys(schoolsData).map(r => <option key={r} value={r}>{r}</option>)}
                         </select>
                       </div>
                       <div>
                         <label style={labelStyle}>Мектеп түрі</label>
                         <select name="schoolType" value={formData.schoolType} onChange={handleChange} style={inputStyle}>
                           <option value="Мемлекеттік">Мемлекеттік</option>
                           <option value="Жекеменшік">Жекеменшік</option>
                         </select>
                       </div>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                      <label style={labelStyle}>Мектеп атауы</label>
                      <select name="schoolName" value={formData.schoolName} onChange={handleChange} style={inputStyle} required>
                        <option value="">Таңдаңыз...</option>
                        {availableSchools.map(s => <option key={s} value={s}>{s}</option>)}
                        <option value="Басқа">Басқа мектеп...</option>
                      </select>
                    </div>
                    {role === 'CLIENT' && (
                      <div style={{ marginBottom: "15px" }}>
                        <label style={labelStyle}>Мамандық</label>
                        <select name="specialty" value={formData.specialty} onChange={handleChange} style={inputStyle} required>
                          <option value="">Таңдаңыз...</option>
                          {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <div style={{ marginBottom: "15px" }}>
                      <label style={labelStyle}>Логин (Ник)</label>
                      <input name="username" placeholder="Кемінде 3 таңба" value={formData.username} onChange={handleChange} style={inputStyle} required />
                    </div>
                    <div style={{ marginBottom: "15px", position: "relative" }}>
                      <label style={labelStyle}>Құпия сөз</label>
                      <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={handleChange} style={inputStyle} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "15px", top: "38px", background: "none", border: "none", cursor: "pointer", color: "#0A66F0", fontWeight: 700, fontSize: "0.75rem" }}>
                        {showPassword ? 'Жасыру' : 'Көрсету'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "30px" }}>
                {step > 1 && (
                  <button type="button" onClick={() => setStep(step - 1)} style={{ flex: 1, padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", background: "white", fontWeight: 800, cursor: "pointer", color: "#64748b" }}>Артқа</button>
                )}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ 
                    flex: 2, padding: "16px", borderRadius: "16px", background: "#0A66F0", color: "white", border: "none", fontWeight: 800, cursor: "pointer",
                    boxShadow: "0 10px 20px rgba(10, 102, 240, 0.15)"
                  }}
                >
                  {isLoading ? '...' : step === 3 ? 'Тіркелуді аяқтау' : 'Келесі қадам'}
                </button>
              </div>
            </form>

            <p style={{ textAlign: "center", marginTop: "25px", color: "#64748b", fontWeight: 500 }}>
              Аккаунтыңыз бар ма? <Link href="/login" style={{ color: "#0A66F0", fontWeight: 800, textDecoration: "none" }}>Кіру</Link>
            </p>

            <div style={{ marginTop: "40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", color: "#cbd5e1", fontSize: "0.75rem", marginBottom: "25px" }}>
                  <div style={{ flex: 1, height: "1px", background: "#f1f5f9" }}></div>
                  <span style={{ fontWeight: 800, letterSpacing: "1px" }}>НЕМЕСЕ</span>
                  <div style={{ flex: 1, height: "1px", background: "#f1f5f9" }}></div>
                </div>
                <button type="button" style={{ 
                  width: "100%", 
                  padding: "14px", 
                  borderRadius: "16px", 
                  border: "1px solid #e2e8f0", 
                  background: "white", 
                  fontWeight: 700, 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "12px", 
                  color: "#1e293b",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  transition: "0.2s"
                }} onClick={() => alert("Жақында...")}>
                   <svg width="20" height="20" viewBox="0 0 24 24">
                     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                   </svg>
                   Google арқылы тіркелу
                </button>
            </div>
          </div>
        </div>

        {/* Right Side: Image Banner */}
        <div className="visual-side" style={{ flex: 1, background: "#0A66F0", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
           <img 
             src="/images/login-promo.png" 
             alt="Promo" 
             style={{ 
               width: "90%", 
               height: "auto", 
               maxHeight: "90%",
               objectFit: "contain",
               zIndex: 2,
               borderRadius: "24px",
               boxShadow: "0 20px 50px rgba(0,0,0,0.15)"
             }} 
           />
           <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(0deg, rgba(10,102,240,0.3) 0%, transparent 100%)", zIndex: 2 }}></div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @media (max-width: 1023px) { .visual-side { display: none !important; } }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "0.7rem",
  fontWeight: 900,
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  marginBottom: "6px",
  marginLeft: "4px"
};
