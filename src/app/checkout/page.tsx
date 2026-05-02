"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planName = searchParams.get("plan") || "PRO Мұғалім";
  const planPrice = searchParams.get("price") || "2 900 ₸";
  const [user, setUser] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);

  const isFree = planPrice === "0 ₸" || planPrice === "0";

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(savedUser));
    }
  }, [router]);

  const sendWhatsAppConfirmation = () => {
    const phone = "77769661649";
    const text = encodeURIComponent(
      `Сәлем! Мен mu-ga-lim.kz сайтында тариф сатып алдым.\n\n` +
      `👤 Логин: ${user?.username}\n` +
      `📞 Тел: ${user?.phone || 'Көрсетілмеген'}\n` +
      `📦 Тариф: ${planName}\n` +
      `💰 Сомасы: ${planPrice}\n\n` +
      `Аударым жасадым, чекті қазір жіберемін. Рұқсат беруіңізді өтінемін.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    
    // Сохраняем запрос для админ-панели
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30); // По умолчанию на 30 дней

    const requests = JSON.parse(localStorage.getItem("paymentRequests") || "[]");
    const newRequest = {
      id: Date.now(),
      username: user?.username,
      phone: user?.phone,
      plan: planName,
      price: planPrice,
      date: startDate.toLocaleString(),
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      status: 'PENDING'
    };
    requests.push(newRequest);
    localStorage.setItem("paymentRequests", JSON.stringify(requests));

    setIsPaid(true);
  };

  const handleFreeActivation = () => {
    setIsPaid(true);
  };

  return (
    <div className="mobile-container" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="form-card" style={{ padding: "30px", textAlign: "center", maxWidth: "450px", width: "100%" }}>
        {!isPaid ? (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>{isFree ? "✅" : "💳"}</div>
            <h2 style={{ marginBottom: "10px", fontSize: "1.8rem" }}>{isFree ? "Тарифті белсендіру" : "Тарифті растау"}</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "25px", fontSize: "0.95rem" }}>
              Құрметті <strong>{user?.username}</strong>, {isFree ? "таңдалған тегін тарифті қосу үшін төмендегі батырманы басыңыз." : "таңдалған тарифті белсендіру үшін Kaspi аударымын жасаңыз."}
            </p>
            
            <div style={{ background: "var(--box-tint)", padding: "15px", borderRadius: "16px", marginBottom: "25px", textAlign: "left", border: "1px solid var(--box-border)" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                  <span>Тариф:</span>
                  <strong style={{ color: "var(--primary-blue)" }}>{planName}</strong>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem" }}>
                  <span>Бағасы:</span>
                  <strong style={{ fontSize: "1.1rem" }}>{planPrice}</strong>
               </div>
            </div>

            {!isFree && (
              <div style={{ textAlign: "left", background: "#f8faff", padding: "20px", borderRadius: "16px", border: "1px dashed #0A66F0", marginBottom: "25px" }}>
                 <p style={{ fontSize: "0.85rem", color: "#0A66F0", fontWeight: "800", marginBottom: "12px", textAlign: "center" }}>АУДАРЫМ ҮШІН ДЕРЕКТЕР:</p>
                 
                 <div style={{ marginBottom: "10px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Телефон нөмірі (Kaspi):</span>
                    <div style={{ fontSize: "1.1rem", fontWeight: "800" }}>+7 705 967 81 19</div>
                 </div>
                 
                 <div style={{ marginBottom: "10px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Алушы:</span>
                    <div style={{ fontSize: "1rem", fontWeight: "700" }}>Темірхан А.</div>
                 </div>

                 <div style={{ marginTop: "15px", padding: "10px", background: "white", borderRadius: "10px", border: "1px solid #e0e6ed" }}>
                    <span style={{ fontSize: "0.8rem", color: "#ff4d4f", fontWeight: "700" }}>⚠️ Түсініктемеге жазыңыз:</span>
                    <div style={{ fontSize: "0.9rem", fontWeight: "800", marginTop: "4px", color: "#333" }}>
                       mu-ga-lim.kz {user?.username}
                    </div>
                 </div>
              </div>
            )}

            <button className="generate-btn" style={{ marginBottom: "12px" }} onClick={isFree ? handleFreeActivation : sendWhatsAppConfirmation}>
               {isFree ? "Қазір белсендіру" : "✅ Төледім, растау жіберу"}
            </button>
            
            <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.9rem" }} onClick={() => router.back()}>
               ← Кері қайту
            </button>
          </>
        ) : (
          <div style={{ padding: "20px 0" }}>
             <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🎉</div>
             <h2 style={{ marginBottom: "15px" }}>{isFree ? "Сәтті қосылды!" : "Өтініш жіберілді!"}</h2>
             <p style={{ color: "var(--text-secondary)", marginBottom: "30px", lineHeight: "1.6" }}>
                {isFree 
                  ? "Құттықтаймыз! Сіздің «Базалық» тарифіңіз сәтті белсендірілді. Енді КТЖ мен ҚМЖ жасауға кірісе аласыз."
                  : "Сіздің төлеміңіз туралы ақпарат әкімшіге жіберілді. Төлем расталған соң (5-10 минут) тариф автоматты түрде қосылады."}
             </p>
             <button className="generate-btn" onClick={() => router.push("/")}>
                Басты бетке өту
             </button>
          </div>
        )}

        <p style={{ marginTop: "20px", fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
          Сұрақтар бойынша қолдау қызметіне жазыңыз. mu-ga-lim.kz — сіздің сенімді көмекшіңіз.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Жүктелуде...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
