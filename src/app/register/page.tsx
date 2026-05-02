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
    "Сынып жетекші"
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
    },
    "Ақтөбе облысы": {
      "Мемлекеттік": ["№1 мектеп", "№21 гимназия", "№51 гимназия"],
      "Жекеменшік": ["Сымбат", "Болашақ"]
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
      if (!data.available) setError("Бұл логин бос емес, басқасын таңдаңыз");
      else setError("");
    } catch (e) {
      console.error(e);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    
    if (name === "phone") {
      value = formatPhone(value);
    }
    
    if (name === "fio") {
      value = value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    if (name === "username") {
      value = value.toLowerCase().replace(/[^a-z0-9_]/g, ""); 
      checkUsername(value);
    }

    if (name === "password") {
      if (/[а-яА-ЯёЁәӘіІңҢғҒүҮұҰқҚөӨһҺ]/.test(value)) {
        setError("Құпия сөзде кириллица әріптерін қолдануға болмайды (тек ағылшынша)");
        return;
      }
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === "region" || name === "schoolType") {
        newData.schoolName = "";
      }
      return newData;
    });
    setError("");
  };

  const nextStep = () => {
    if (step === 1 && (!formData.fio || formData.phone.length < 18)) {
      setError("Барлық өрістерді дұрыс толтырыңыз");
      return;
    }
    if (step === 2) {
      if (role === 'CLIENT' && (!formData.region || !formData.schoolName || !formData.specialty || !formData.className)) {
        setError("Барлық өрістерді толтырыңыз");
        return;
      }
      if (role === 'SELLER' && (!formData.specialty || !formData.className)) {
        setError("Мамандығыңыз бен сыныпты таңдаңыз");
        return;
      }
    }
    if (step === 3) {
      if (!usernameAvailable) {
        setError("Бұл логин бос емес");
        return;
      }
      if (formData.password.length < 6) {
        setError("Құпия сөз кем дегенде 6 символдан тұруы керек");
        return;
      }
    }
    setStep(step + 1);
    setError("");
  };

  const prevStep = () => setStep(step - 1);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
      return;
    }
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--bg-main)" }}>
      <div className="split-screen">
        <div className="form-side">
          <div className="wrapper">
            
            <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "15px" }}>
              <h1 style={{ margin: 0, lineHeight: "1.1" }}>Жұмысты<br/>бастайық</h1>
              <p style={{ fontSize: "0.8rem", color: "#8898aa", textAlign: "right", margin: 0, lineHeight: "1.4", paddingBottom: "4px" }}>
                Тіркелу үшін 3 қадамнан<br/>өтіңіз
              </p>
            </div>

            <div className="steps-modern">
              <span className={step >= 1 ? 'active' : ''}>1. Ақпарат</span>
              <span className={step >= 2 ? 'active' : ''}>2. Мектеп</span>
              <span className={step >= 3 ? 'active' : ''}>3. Аккаунт</span>
            </div>

            <div className="switcher" style={{ opacity: step > 1 ? 0.7 : 1, pointerEvents: step > 1 ? 'none' : 'auto' }}>
               <button className={role === 'CLIENT' ? 'active' : ''} onClick={() => step === 1 && setRole('CLIENT')} disabled={step > 1}>Мұғалім</button>
               <button className={role === 'SELLER' ? 'active' : ''} onClick={() => step === 1 && setRole('SELLER')} disabled={step > 1}>Автор</button>
            </div>

            <form onSubmit={handleRegister}>
              {error && <div className="err">{error}</div>}

              {step === 1 && (
                <div className="fade">
                  <div className="field with-icon">
                     <span>👤</span>
                     <input name="fio" placeholder="Аты-жөніңіз (ТАӘ)" value={formData.fio} onChange={handleChange} required style={{ paddingLeft: "50px" }} />
                  </div>
                  <div className="field with-icon">
                     <span>📞</span>
                     <input name="phone" placeholder="+7 (___) ___-__-__" value={formData.phone} onChange={handleChange} required style={{ paddingLeft: "50px" }} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="fade">
                  {role === 'CLIENT' && (
                    <>
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
                    </>
                  )}
                  <div className="field with-icon">
                     <span>🎓</span>
                     <select name="specialty" value={formData.specialty} onChange={handleChange} required style={{ paddingLeft: "50px" }}>
                       <option value="">Мамандығыңызды таңдаңыз...</option>
                       {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
                  <div className="field with-icon">
                     <span>📚</span>
                     <select name="className" value={formData.className} onChange={handleChange} required style={{ paddingLeft: "50px" }}>
                       <option value="">Қай сыныпқа сабақ бересіз?</option>
                       {[1,2,3,4,5,6,7,8,9,10,11].map(n => <option key={n} value={n}>{n}-сынып</option>)}
                     </select>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="fade">
                  <div className="field with-icon">
                     <span>🔑</span>
                     <input 
                       name="username" 
                       placeholder="Логин (Username)" 
                       value={formData.username} 
                       onChange={handleChange} 
                       required 
                       style={{ 
                         paddingLeft: "50px", 
                         borderColor: !usernameAvailable ? "#f5222d" : (formData.username.length >= 3 ? "#52c41a" : "") 
                       }} 
                     />
                     {usernameChecking && <span style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem" }}>⏳</span>}
                  </div>
                  <div className="field with-icon" style={{ position: "relative" }}>
                     <span>🔒</span>
                     <input name="password" type={showPassword ? "text" : "password"} placeholder="Құпия сөз (тек ағылшынша)" value={formData.password} onChange={handleChange} required style={{ paddingLeft: "50px", paddingRight: "50px" }} />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", opacity: 0.6 }}>
                       {showPassword ? "👁️" : "👁️‍🗨️"}
                     </button>
                  </div>
                </div>
              )}

              <div className="actions">
                 {step > 1 && <button type="button" className="b-sec" onClick={prevStep}>Артқа</button>}
                 <button type="submit" className="b-pri" disabled={isLoading || (step === 3 && !usernameAvailable)}>
                   {isLoading ? '...' : (step === 3 ? 'Тіркелу' : 'Келесі')}
                 </button>
              </div>
            </form>

            <p className="foot">
              Аккаунтыңыз бар ма? <Link href="/login">Кіру</Link>
            </p>

            <div className="social-signin">
               <div className="divider"><span>немесе әлеуметтік желілермен</span></div>
               <div className="social-grid">
                  <button type="button" className="google-btn" onClick={() => alert("Бұл функция жақында қосылады!")}>
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                      <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.956H.957a8.996 8.996 0 0 0 0 8.088l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.956l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    Google арқылы тіркелу
                  </button>
                  <div className="social-row" style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
                     <button type="button" className="social-circle fb" onClick={() => alert("Жақында...")}>f</button>
                     <button type="button" className="social-circle tw" onClick={() => alert("Жақында...")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                     </button>
                     <button type="button" className="social-circle rd" onClick={() => alert("Жақында...")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M24 11.5c0-1.654-1.346-3-3-3-.674 0-1.29.226-1.782.603C17.054 7.221 14.28 6.149 11.23 6.03l1.102-4.103 3.655.823c.038.746.663 1.346 1.428 1.346 1.103 0 2-.897 2-2s-.897-2-2-2c-.742 0-1.378.411-1.711 1.018l-3.957-.891c-.131-.03-.266.023-.342.133l-1.255 4.673C6.155 6.177 3.398 7.251 1.258 8.125 1.103 10.125 0 11.5c0 1.654 1.346 3 3 3 .152 0 .3-.012.443-.035C3.395 15.65 6.42 17 9.5 17s6.105-1.35 6.105-2.535c.143.023.291.035.443.035 1.654 0 3-1.346 3-3z"/></svg>
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="visual-side">
          <div className="promo-container">
             <img src="/promo.png" alt="КТП және КСП" className="promo-img" />
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .split-screen { display: flex; min-height: calc(100vh - 100px); background: #fff; font-family: 'Inter', sans-serif; overflow: hidden; }
        .form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px 10px; }
        .split-screen { display: flex; min-height: calc(100vh - 100px); background: var(--bg-main); font-family: 'Inter', sans-serif; overflow: hidden; }
        .form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px; background: var(--bg-main); }
        .wrapper { width: 100%; max-width: 420px; }
        .visual-side { flex: 1; background: var(--primary-blue); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        @media (max-width: 1023px) { .visual-side { display: none; } }

        .promo-container { width: 90%; display: flex; justify-content: center; }
        .promo-img { width: 100%; height: auto; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); animation: zoomIn 0.8s ease-out; }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .header h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; letter-spacing: -0.5px; }
        .header p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0; }

        .steps-modern { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid var(--box-border); padding-bottom: 5px; }
        .steps-modern span { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); transition: 0.3s; }
        .steps-modern span.active { color: var(--primary-blue); }

        .switcher { display: flex; background: var(--box-tint); padding: 2px; border-radius: 8px; margin-bottom: 12px; }
        .switcher button { flex: 1; padding: 6px; border: none; background: transparent; border-radius: 6px; font-weight: 600; color: var(--text-muted); cursor: pointer; font-size: 0.85rem; }
        .switcher button.active { background: var(--card-bg); color: var(--primary-blue); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

        .field { margin-bottom: 6px; position: relative; }
        .with-icon span { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); z-index: 1; font-size: 0.95rem; }

        .field input, .field select { 
          width: 100%; 
          padding: 10px; 
          border-radius: 8px; 
          border: 2px solid transparent; 
          background: var(--input-bg); 
          font-size: 0.85rem; 
          outline: none; 
          box-sizing: border-box;
          color: var(--text-main);
          transition: all 0.2s ease;
        }
        .field input:focus, .field select:focus { border-color: var(--primary-blue); background: var(--bg-main); }

        .err { background: #fff1f0; color: #f5222d; padding: 6px; border-radius: 6px; margin-bottom: 8px; font-size: 0.75rem; border: 1px solid #ffa39e; }

        .actions { display: flex; gap: 8px; margin-top: 10px; }
        .b-pri { flex: 1; background: var(--primary-blue); color: #fff; border: none; padding: 12px; border-radius: 10px; font-weight: 800; cursor: pointer; font-size: 0.9rem; }
        .b-sec { flex: 1; background: var(--input-bg); color: var(--text-main); border: 1px solid var(--box-border); padding: 12px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
        .b-sec:hover { background: var(--box-tint); color: var(--text-main); border-color: var(--primary-blue); }
        
        .foot { text-align: center; margin-top: 15px; color: var(--text-muted); font-size: 0.85rem; }
        .foot a { color: var(--primary-blue); font-weight: 700; text-decoration: none; }

        .social-signin { margin-top: 10px; }
        .divider { display: flex; align-items: center; text-align: center; color: var(--text-muted); font-size: 0.7rem; margin-bottom: 10px; }
        .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid var(--box-border); }
        .divider span { padding: 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }

        .google-btn { 
          width: 100%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 6px; 
          background: var(--card-bg); 
          border: 1px solid var(--box-border); 
          padding: 8px; 
          border-radius: 8px; 
          font-weight: 600; 
          color: var(--text-main); 
          cursor: pointer; 
          font-size: 0.8rem;
        }

        .social-circle { 
          width: 32px; height: 32px; border-radius: 50%; border: none; 
          display: flex; align-items: center; justify-content: center; 
          color: #fff; font-weight: 800; font-size: 0.9rem; cursor: pointer; 
        }
        .fb { background: #1877F2; }
        .tw { background: #1DA1F2; }
        .rd { background: #FF4500; }

        .fade { animation: fin 0.3s ease; }
        @keyframes fin { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
