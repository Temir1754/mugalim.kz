"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/Footer";

export default function Register() {
  const router = useRouter();
  const { t } = useLanguage();
  const [role, setRole] = useState("CLIENT"); // CLIENT, SELLER, SCHOOL_ADMIN
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameChecking, setUsernameChecking] = useState(false);
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
    "Математика", "Алгебра", "Геометрия",
    "Жаратылыстану", "Биология", "Физика", "Химия", "География",
    "Қазақстан тарихы", "Дүниежүзі тарихы", "Құқық негіздері", "Адам. Қоғам. Құқық",
    "Информатика",
    "Көркем еңбек", "Технология", "Еңбекке баулу", "Бейнелеу өнері", "Музыка",
    "Сынып жетекші", "Мектеп әкімшілігі"
  ];

  const schoolsData: Record<string, Record<string, string[]>> = {
    "Алматы": {
      "Мемлекеттік": ["№1 мектеп-гимназия", "№2 лицей", "№159 гимназия", "№178 лицей", "№173 мектеп", "№39 мамандандырылған лицей", "№92 мамандандырылған лицей", "№134 лицей"],
      "Жекеменшік": ["TAMOS Education", "Haileybury Almaty", "Quantum STEM School", "NGS (New Generation School)", "Мирас", "Шоқан Уәлиханов атындағы мектеп", "Galaxy International School"]
    },
    "Астана": {
      "Мемлекеттік": ["№1 мектеп", "№17 гимназия", "№66 мектеп-лицей", "№81 «Astana English School»", "№3 лицей", "№60 мектеп-лицей"],
      "Жекеменшік": ["Nur-Orda", "Spectrum International School", "Haileybury Astana", "BINOM School", "Seed School", "IQanat High School of Burabay"]
    },
    "Шымкент": {
      "Мемлекеттік": ["№1 мектеп", "№7 гимназия", "№12 лицей", "№24 мектеп", "№90 мектеп-лицей"],
      "Жекеменшік": ["Мансұр", "Орда", "Арофат", "Ақ-Жол", "Төле би"]
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

  const checkUsername = async (name: string) => {
    if (name.length < 3) return;
    setUsernameChecking(true);
    try {
      const res = await fetch(`/api/auth/check-username?username=${name}`);
      const data = await res.json();
      setUsernameAvailable(data.available);
      if (!data.available) setError("Бұл логин бос емес");
      else setError("");
    } catch (e) { console.error(e); }
    finally { setUsernameChecking(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === "phone") value = formatPhone(value);
    if (name === "fio") value = value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    if (name === "username") {
      value = value.toLowerCase().replace(/[^a-z0-9_]/g, ""); 
      checkUsername(value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const nextStep = () => {
    if (step === 1 && (!formData.fio || formData.phone.length < 18)) {
      setError("Аты-жөніңіз бен телефон нөмірін толық толтырыңыз");
      return;
    }
    if (step === 2) {
      if ((role === 'CLIENT' || role === 'SCHOOL_ADMIN') && (!formData.region || !formData.schoolName)) {
        setError("Барлық өрістерді толтырыңыз");
        return;
      }
    }
    setStep(step + 1);
    setError("");
  };

  const prevStep = () => setStep(step - 1);

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Тіркелу қатесі");
      window.location.href = "/login?registered=true";
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  return (
    <div style={{ background: "var(--bg-main)" }}>
      <div className="split-screen">
        <div className="form-side">
          <div className="wrapper">
            <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "15px" }}>
              <h1 style={{ margin: 0, lineHeight: "1.1" }}>Жұмысты<br/>бастайық</h1>
              <p style={{ fontSize: "0.8rem", color: "#8898aa", textAlign: "right", margin: 0, lineHeight: "1.4", paddingBottom: "4px" }}>Тіркелу үшін 3 қадамнан<br/>өтіңіз</p>
            </div>

            <div className="steps-modern">
              <span className={step >= 1 ? 'active' : ''}>1. Ақпарат</span>
              <span className={step >= 2 ? 'active' : ''}>2. Мектеп</span>
              <span className={step >= 3 ? 'active' : ''}>3. Аккаунт</span>
            </div>

            <div className="switcher" style={{ opacity: step > 1 ? 0.7 : 1, pointerEvents: step > 1 ? 'none' : 'auto', display: "flex", background: "var(--box-tint)", padding: "4px", borderRadius: "10px", marginBottom: "15px" }}>
               <button className={role === 'CLIENT' ? 'active' : ''} onClick={() => setRole('CLIENT')} style={{ flex: 1, padding: "8px", border: "none", borderRadius: "8px", background: role === 'CLIENT' ? "#fff" : "transparent", fontWeight: "700", cursor: "pointer", fontSize: "0.75rem" }}>Мұғалім</button>
               <button className={role === 'SCHOOL_ADMIN' ? 'active' : ''} onClick={() => setRole('SCHOOL_ADMIN')} style={{ flex: 1, padding: "8px", border: "none", borderRadius: "8px", background: role === 'SCHOOL_ADMIN' ? "#fff" : "transparent", fontWeight: "700", cursor: "pointer", fontSize: "0.75rem" }}>Оқу ісінің меңгерушісі</button>
               <button className={role === 'SELLER' ? 'active' : ''} onClick={() => setRole('SELLER')} style={{ flex: 1, padding: "8px", border: "none", borderRadius: "8px", background: role === 'SELLER' ? "#fff" : "transparent", fontWeight: "700", cursor: "pointer", fontSize: "0.75rem" }}>Автор</button>
            </div>

            <form onSubmit={handleRegister}>
              {error && <div className="err">{error}</div>}

              {step === 1 && (
                <div className="fade">
                  <div className="field with-icon"><span>👤</span><input name="fio" placeholder="Аты-жөніңіз (ТАӘ)" value={formData.fio} onChange={handleChange} required style={{ paddingLeft: "50px" }} /></div>
                  <div className="field with-icon"><span>📞</span><input name="phone" placeholder="+7 (___) ___-__-__" value={formData.phone} onChange={handleChange} required style={{ paddingLeft: "50px" }} /></div>
                </div>
              )}

              {step === 2 && (
                <div className="fade">
                  <div className="field with-icon">
                     <span>📍</span>
                     <select name="region" value={formData.region} onChange={handleChange} style={{ paddingLeft: "50px" }}>
                       {Object.keys(schoolsData).sort().map(reg => <option key={reg} value={reg}>{reg}</option>)}
                     </select>
                  </div>
                  <div className="field with-icon">
                     <span>🏫</span>
                     <select name="schoolType" value={formData.schoolType} onChange={handleChange} style={{ paddingLeft: "50px" }}>
                       <option value="Мемлекеттік">Мемлекеттік мектеп</option>
                       <option value="Жекеменшік">Жекеменшік мектеп</option>
                     </select>
                  </div>
                  <div className="field with-icon">
                     <span>🏛️</span>
                     <select name="schoolName" value={formData.schoolName} onChange={handleChange} required style={{ paddingLeft: "50px" }}>
                       <option value="">Мектепті таңдаңыз...</option>
                       {availableSchools.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
                  {role !== 'SCHOOL_ADMIN' && (
                    <div className="field with-icon">
                       <span>🎓</span>
                       <select name="specialty" value={formData.specialty} onChange={handleChange} required style={{ paddingLeft: "50px" }}>
                         <option value="">Мамандығыңызды таңдаңыз...</option>
                         {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                  )}
                  {role === 'CLIENT' && (
                    <div className="field with-icon">
                       <span>📚</span>
                       <select name="className" value={formData.className} onChange={handleChange} required style={{ paddingLeft: "50px" }}>
                         <option value="">Қай сыныпқа сабақ бересіз?</option>
                         {[1,2,3,4,5,6,7,8,9,10,11].map(n => <option key={n} value={n}>{n}-сынып</option>)}
                       </select>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="fade">
                  <div className="field with-icon">
                     <span>🔑</span>
                     <input name="username" placeholder="Логин (Username)" value={formData.username} onChange={handleChange} required style={{ paddingLeft: "50px", borderColor: !usernameAvailable ? "#f5222d" : "" }} />
                  </div>
                  <div className="field with-icon" style={{ position: "relative" }}>
                     <span>🔒</span>
                     <input name="password" type={showPassword ? "text" : "password"} placeholder="Құпия сөз" value={formData.password} onChange={handleChange} required style={{ paddingLeft: "50px", paddingRight: "50px" }} />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", opacity: 0.6 }}>{showPassword ? "👁️" : "👁️‍🗨️"}</button>
                  </div>
                </div>
              )}

              <div className="actions" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                 {step > 1 && <button type="button" onClick={prevStep} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid var(--box-border)", cursor: "pointer" }}>Артқа</button>}
                 <button type="submit" style={{ flex: 2, padding: "12px", background: "var(--primary-blue)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer" }}>{isLoading ? '...' : (step === 3 ? 'Тіркелу' : 'Келесі')}</button>
              </div>
            </form>
            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.85rem" }}>Аккаунтыңыз бар ма? <Link href="/login" style={{ color: "var(--primary-blue)", fontWeight: "700" }}>Кіру</Link></p>
          </div>
        </div>

        <div className="visual-side" style={{ flex: 1, background: "var(--primary-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
           <img src="/promo.png" alt="Promo" style={{ width: "80%", borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }} />
        </div>
      </div>
      <Footer />
      <style jsx>{`
        .split-screen { display: flex; min-height: calc(100vh - 100px); background: var(--bg-main); font-family: 'Inter', sans-serif; }
        .form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .wrapper { width: 100%; max-width: 440px; }
        .steps-modern { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid var(--box-border); padding-bottom: 8px; }
        .steps-modern span { font-size: 0.75rem; font-weight: 600; color: #ccc; }
        .steps-modern span.active { color: var(--primary-blue); }
        .field { margin-bottom: 8px; position: relative; }
        .with-icon span { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); z-index: 1; }
        .field input, .field select { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--box-border); background: #fff; outline: none; }
        .err { background: #fff1f0; color: #f5222d; padding: 8px; border-radius: 8px; margin-bottom: 10px; font-size: 0.8rem; border: 1px solid #ffa39e; }
        .fade { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 1023px) { .visual-side { display: none; } }
      `}</style>
    </div>
  );
}
