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
      const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const localUser = allUsers.find((u: any) => (u.username === username || u.phone === username) && u.password === password);

      if (localUser) {
        localStorage.setItem("user", JSON.stringify(localUser));
        if (localUser.role === "ADMIN") window.location.href = "/admin";
        else if (localUser.role === "SELLER") window.location.href = "/seller";
        else window.location.href = "/client";
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role === "ADMIN") window.location.href = "/admin";
      else if (data.user.role === "SELLER") window.location.href = "/seller";
      else window.location.href = "/";
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
        <h1 style={{ margin: 0, lineHeight: "1.1", fontSize: "2rem", fontWeight: "900" }}>Жүйеге кіру</h1>
        <p style={{ fontSize: "0.85rem", color: "#8898aa", textAlign: "right", margin: 0 }}>Жеке кабинет</p>
      </div>

      <form onSubmit={handleLogin}>
        {success && <div className="success-msg">{success}</div>}
        {error && <div className="err">{error}</div>}

        <div className="field">
            <input 
              type="text" 
              placeholder="Логин немесе телефон" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
        </div>

        <div className="field" style={{ position: "relative" }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Құпия сөз" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: "80px" }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "var(--primary-blue)", fontWeight: "bold" }}>
              {showPassword ? "Жасыру" : "Көрсету"}
            </button>
        </div>

        <div style={{ textAlign: "right", marginBottom: "20px" }}>
          <Link href="/forgot-password" style={{ fontSize: "0.85rem", color: "#5a6b82", textDecoration: "none", fontWeight: "600" }}>
            Құпия сөзді ұмыттыңыз ба?
          </Link>
        </div>

        <button className="b-pri" type="submit" disabled={isLoading} style={{ width: "100%", padding: "16px", borderRadius: "12px", background: "var(--primary-blue)", color: "white", border: "none", fontWeight: "800", cursor: "pointer", fontSize: "1rem" }}>
          {isLoading ? "..." : "Кіру"}
        </button>
      </form>

      <p className="foot" style={{ textAlign: "center", marginTop: "20px", color: "#637381" }}>
        Аккаунтыңыз жоқ па? <Link href="/register" style={{ color: "var(--primary-blue)", fontWeight: "800", textDecoration: "none" }}>Тіркелу</Link>
      </p>

      <div className="social-signin" style={{ marginTop: "30px" }}>
          <div className="divider" style={{ display: "flex", alignItems: "center", gap: "10px", color: "#8898aa", fontSize: "0.75rem", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "#eee" }}></div>
            <span>НЕМЕСЕ</span>
            <div style={{ flex: 1, height: "1px", background: "#eee" }}></div>
          </div>
          <button type="button" className="google-btn" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e0e6ed", background: "white", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }} onClick={() => alert("Жақында...")}>
             Google арқылы кіру
          </button>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      <div className="split-screen" style={{ display: "flex", minHeight: "100vh" }}>
        <div className="form-side" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
          <Suspense fallback={<div>Жүктелуде...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <div className="visual-side" style={{ flex: 1, background: "var(--primary-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
           <div style={{ width: "80%", textAlign: "center", color: "white" }}>
              <h2 style={{ fontSize: "2.5rem", fontWeight: "900", marginBottom: "20px" }}>Қош келдіңіз!</h2>
              <p style={{ opacity: 0.8, fontSize: "1.1rem" }}>Мұғалімдерге арналған ең озық КТЖ/ҚМЖ генераторы мен материалдар каталогы.</p>
           </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .wrapper { width: 100%; max-width: 400px; }
        .field { margin-bottom: 15px; }
        .field input { 
          width: 100%; 
          padding: 14px 20px; 
          border-radius: 12px; 
          border: 1px solid #e0e6ed; 
          background: #f9fafb; 
          font-size: 1rem; 
          outline: none; 
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .field input:focus { border-color: var(--primary-blue); background: white; box-shadow: 0 0 0 4px rgba(10, 102, 240, 0.1); }
        .err { background: #fff1f0; color: #f5222d; padding: 12px; border-radius: 10px; margin-bottom: 20px; font-size: 0.9rem; border: 1px solid #ffa39e; }
        .success-msg { background: #f6ffed; color: #52c41a; padding: 12px; border-radius: 10px; margin-bottom: 20px; font-size: 0.9rem; border: 1px solid #b7eb8f; }
        @media (max-width: 900px) { .visual-side { display: none; } }
      `}</style>
    </div>
  );
}
