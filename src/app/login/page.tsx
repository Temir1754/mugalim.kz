"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

function LoginForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect based on role
      if (data.user.role === "ADMIN") {
        window.location.href = "/admin";
      } else if (data.user.role === "SELLER") {
        window.location.href = "/seller";
      } else {
        window.location.href = "/client";
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-title">
        <div className="logo" style={{ fontSize: '2rem', marginBottom: '8px', display: 'block' }}>mu-ga-lim.kz</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
          Қазақстан мұғалімдеріне арналған кәсіби платформа
        </div>
      </div>

      <h2 className="serif" style={{ fontSize: '1.75rem', marginBottom: '24px', textAlign: 'center' }}>Жүйеге кіру</h2>

      <form onSubmit={handleLogin}>
        {success && <div style={{ color: "#16a34a", marginBottom: "16px", fontSize: "0.9rem", textAlign: 'center' }}>{success}</div>}
        {error && <div style={{ color: "#dc2626", marginBottom: "16px", fontSize: "0.9rem", textAlign: 'center' }}>{error}</div>}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--accent-slate)' }}>Электрондық пошта немесе логин</label>
          <input 
            type="text" 
            placeholder="example@mugalim.kz" 
            required 
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--accent-slate)' }}>Құпия сөз</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            required 
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading} 
          className="btn-primary"
          style={{ width: '100%', marginBottom: '20px' }}
        >
          {isLoading ? "Кіру..." : "Кіру"}
        </button>
      </form>

      <div style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
        Аккаунт жоқ па? <Link href="/register" style={{ color: "var(--primary-navy)", fontWeight: 700, textDecoration: 'none' }}>Тіркелу</Link>
      </div>
      
      <div style={{ textAlign: "center", marginTop: "32px", fontSize: "0.8rem", color: "#cbd5e1" }}>
        Тест үшін: admin / Temir173173 (әкімші аккаунты)
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <Suspense fallback={<div>Жүктелуде...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

