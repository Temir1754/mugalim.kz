"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/Footer";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (searchParams.get("registered")) {
      setSuccess("Тіркелу сәтті аяқталды! Енді жүйеге кіре аласыз.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // 1. ПЕРВЫМ ДЕЛОМ: Ищем в localStorage (наша тестовая база)
      const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const localUser = allUsers.find((u: any) => (u.username === username || u.phone === username) && u.password === password);

      if (localUser) {
        localStorage.setItem("user", JSON.stringify(localUser));
        if (localUser.role === "ADMIN") window.location.href = "/admin";
        else if (localUser.role === "SELLER") window.location.href = "/seller";
        else window.location.href = "/client";
        return;
      }

      // 2. ЕСЛИ НЕ НАШЛИ: Спрашиваем сервер (реальная база)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "ADMIN") {
        window.location.href = "/admin";
      } else if (data.user.role === "SELLER") {
        window.location.href = "/seller";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, lineHeight: "1.1" }}>Жүйеге<br/>кіру</h1>
        <p style={{ fontSize: "0.8rem", color: "#8898aa", textAlign: "right", margin: 0, lineHeight: "1.4", paddingBottom: "4px" }}>
          Жеке кабинетке<br/>өтіңіз
        </p>
      </div>

      <form onSubmit={handleLogin}>
        {success && <div className="success-msg">{success}</div>}
        {error && <div className="err">{error}</div>}

        <div className="field with-icon">
            <span>🔑</span>
            <input 
              type="text" 
              placeholder="Логин немесе телефон" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ paddingLeft: "50px" }}
            />
        </div>

        <div className="field with-icon" style={{ position: "relative" }}>
            <span>🔒</span>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Құпия сөз" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: "50px", paddingRight: "50px" }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", opacity: 0.6 }}>
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
        </div>

        <div style={{ textAlign: "right", marginBottom: "15px" }}>
          <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "#5a6b82", textDecoration: "none", fontWeight: "600" }}>
            Құпия сөзді ұмыттыңыз ба?
          </Link>
        </div>

        <button className="b-pri" type="submit" disabled={isLoading} style={{ width: "100%" }}>
          {isLoading ? "..." : "Жүйеге кіру"}
        </button>
      </form>

      <p className="foot">
        Аккаунтыңыз жоқ па? <Link href="/register">Тіркелу</Link>
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
              Google арқылы кіру
            </button>
          </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div style={{ background: "var(--bg-main)" }}>
      <div className="split-screen">
        <div className="form-side">
          <Suspense fallback={<div className="wrapper">Жүктелуде...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <div className="visual-side">
          <div className="promo-container">
             <img src="/promo.png" alt="Промо" className="promo-img" />
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .split-screen { display: flex; min-height: calc(100vh - 100px); background: var(--bg-main); font-family: 'Inter', sans-serif; overflow: hidden; }
        .form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px; background: var(--bg-main); }
        .wrapper { width: 100%; max-width: 420px; }
        .visual-side { flex: 1; background: var(--primary-blue); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        @media (max-width: 1023px) { .visual-side { display: none; } }

        .promo-container { width: 90%; display: flex; justify-content: center; }
        .promo-img { width: 100%; height: auto; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); animation: zoomIn 0.8s ease-out; }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .header h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin: 0; letter-spacing: -0.5px; }
        
        .field { margin-bottom: 8px; position: relative; }
        .with-icon span { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); z-index: 1; font-size: 0.95rem; }

        .field input { 
          width: 100%; 
          padding: 12px; 
          border-radius: 8px; 
          border: 2px solid transparent; 
          background: var(--input-bg); 
          font-size: 0.9rem; 
          outline: none; 
          box-sizing: border-box;
          color: var(--text-main);
          transition: all 0.2s ease;
        }
        .field input:focus { border-color: var(--primary-blue); background: var(--bg-main); }

        .err { background: #fff1f0; color: #f5222d; padding: 8px; border-radius: 6px; margin-bottom: 10px; font-size: 0.8rem; border: 1px solid #ffa39e; }
        .success-msg { background: #f6ffed; color: #52c41a; padding: 8px; border-radius: 6px; margin-bottom: 10px; font-size: 0.8rem; border: 1px solid #b7eb8f; }

        .b-pri { background: var(--primary-blue); color: #fff; border: none; padding: 14px; border-radius: 10px; font-weight: 800; cursor: pointer; font-size: 0.95rem; }
        
        .foot { text-align: center; margin-top: 15px; color: var(--text-muted); font-size: 0.85rem; }
        .foot a { color: var(--primary-blue); font-weight: 700; text-decoration: none; }

        .social-signin { margin-top: 15px; }
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
          padding: 10px; 
          border-radius: 8px; 
          font-weight: 600; 
          color: var(--text-main); 
          cursor: pointer; 
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}
