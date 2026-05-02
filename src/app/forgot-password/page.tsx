"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Ввод телефона, 2: Ввод кода, 3: Новый пароль
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  return (
    <div className="mobile-container" style={{ padding: "40px 20px" }}>
       {/* Назад */}
       <Link href="/login" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", fontSize: "0.9rem" }}>
         ← Назад к входу
       </Link>

      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "10px" }}>
          {step === 1 && "Сброс пароля"}
          {step === 2 && "Введите код"}
          {step === 3 && "Новый пароль"}
        </h1>
        <p className="subtitle">
          {step === 1 && "Введите ваш номер телефона, указанный при регистрации."}
          {step === 2 && `Мы отправили код на ваш номер ${phone}.`}
          {step === 3 && "Придумайте надежный пароль для вашего аккаунта."}
        </p>
      </div>

      <div className="form-card" style={{ padding: 0 }}>
        {step === 1 && (
          <>
            <div className="input-group">
              <span className="label">Номер телефона</span>
              <input 
                type="tel" 
                className="input" 
                placeholder="+7 (___) ___-__-__" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button className="generate-btn" onClick={() => setStep(2)}>
              Получить код в WhatsApp
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="input-group">
              <span className="label">4-значный код</span>
              <input 
                type="text" 
                className="input" 
                placeholder="____" 
                maxLength={4}
                style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "10px" }}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button className="generate-btn" onClick={() => setStep(3)}>
              Подтвердить код
            </button>
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "20px" }}>
              Не пришел код?{" "}
              <button style={{ background: "none", border: "none", color: "var(--primary-blue)", fontWeight: "600", cursor: "pointer" }}>
                Отправить еще раз
              </button>
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <div className="input-group">
              <span className="label">Новый пароль</span>
              <input type="password" className="input" placeholder="••••••••" />
            </div>
            <div className="input-group">
              <span className="label">Повторите пароль</span>
              <input type="password" className="input" placeholder="••••••••" />
            </div>
            <button className="generate-btn" onClick={() => router.push("/login")}>
              Сохранить и войти
            </button>
          </>
        )}
      </div>
    </div>
  );
}
