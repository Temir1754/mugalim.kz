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

  const inputStyle = {
    width: "100%",
    padding: "16px 20px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "sans-serif",
    transition: "0.2s"
  };

  return (
    <div style={{ width: "100%", maxWidth: "420px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-1px", color: "#0f172a" }}>Кіру</h1>
          <p style={{ margin: "5px 0 0", color: "#64748b", fontWeight: 600 }}>Жеке кабинетке өтіңіз</p>
        </div>
      </div>

      <form onSubmit={handleLogin}>
        {success && <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", fontSize: "0.9rem", fontWeight: 600, border: "1px solid #dcfce7" }}>{success}</div>}
        {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", fontSize: "0.9rem", fontWeight: 600, border: "1px solid #fee2e2" }}>{error}</div>}

        <div style={{ marginBottom: "15px" }}>
            <input 
              type="text" 
              placeholder="Логин немесе телефон" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
            />
        </div>

        <div style={{ marginBottom: "15px", position: "relative" }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Құпия сөз" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: "80px" }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "#0A66F0", fontWeight: "bold" }}>
              {showPassword ? "Жасыру" : "Көрсету"}
            </button>
        </div>

        <div style={{ textAlign: "right", marginBottom: "25px" }}>
          <Link href="/forgot-password" style={{ fontSize: "0.9rem", color: "#64748b", textDecoration: "none", fontWeight: 600 }}>
            Құпия сөзді ұмыттыңыз ба?
          </Link>
        </div>

        <button 
          type="submit" 
          disabled={isLoading} 
          style={{ 
            width: "100%", 
            padding: "18px", 
            borderRadius: "18px", 
            background: "#0A66F0", 
            color: "white", 
            border: "none", 
            fontWeight: 800, 
            cursor: "pointer", 
            fontSize: "1rem",
            boxShadow: "0 10px 20px rgba(10, 102, 240, 0.2)",
            transition: "0.2s"
          }}
        >
          {isLoading ? "..." : "Жүйеге кіру"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "25px", color: "#64748b", fontWeight: 500 }}>
        Аккаунтыңыз жоқ па? <Link href="/register" style={{ color: "#0A66F0", fontWeight: 800, textDecoration: "none" }}>Тіркелу</Link>
      </p>

      <div style={{ marginTop: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", color: "#cbd5e1", fontSize: "0.75rem", marginBottom: "25px" }}>
            <div style={{ flex: 1, height: "1px", background: "#f1f5f9" }}></div>
            <span style={{ fontWeight: 800, letterSpacing: "1px" }}>НЕМЕСЕ</span>
            <div style={{ flex: 1, height: "1px", background: "#f1f5f9" }}></div>
          </div>
          <button type="button" style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "white", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "#1e293b" }} onClick={() => alert("Жақында...")}>
             Google арқылы кіру
          </button>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div style={{ background: "white", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
          <Suspense fallback={<div>Жүктелуде...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <div className="visual-side" style={{ flex: 1, background: "#0A66F0", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
           <div style={{ width: "80%", textAlign: "center", color: "white", zIndex: 2 }}>
              <h2 style={{ fontSize: "3.5rem", fontWeight: 900, marginBottom: "20px", letterSpacing: "-2px" }}>Қош келдіңіз!</h2>
              <p style={{ opacity: 0.9, fontSize: "1.2rem", fontWeight: 500, lineHeight: 1.6 }}>Мұғалімдерге арналған ең озық КТЖ/ҚМЖ генераторы мен материалдар каталогы.</p>
           </div>
           {/* Abstract shapes for premium look */}
           <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", zIndex: 1 }}></div>
           <div style={{ position: "absolute", top: "-5%", left: "-5%", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", zIndex: 1 }}></div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @media (max-width: 900px) { .visual-side { display: none ! alienation; } }
      `}</style>
    </div>
  );
}
