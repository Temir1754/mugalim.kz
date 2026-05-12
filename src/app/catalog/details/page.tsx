"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useLanguage } from "@/context/LanguageContext";

function ProductDetailsContent() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialId = searchParams.get("id");

  const [product, setProduct] = useState<any>(null);
  const [isKaspiLoading, setIsKaspiLoading] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!materialId) {
      router.push("/catalog");
      return;
    }

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/materials?id=${materialId}`);
        const data = await res.json();
        if (data) {
          setProduct(data);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [materialId, router]);

  const handleBuy = async () => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      alert("Сатып алу үшін алдымен жүйеге кіріңіз");
      router.push("/login");
      return;
    }
    const user = JSON.parse(savedUser);

    setIsKaspiLoading(true);
    try {
      // 1. Record purchase in DB
      const res = await fetch("/api/materials/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, materialId })
      });

      if (!res.ok) throw new Error("Purchase failed");

      // 2. Success
      setIsKaspiLoading(false);
      setPurchased(true);
      alert("Төлем сәтті өтті! Материал жеке кабинетіңізге қосылды.");
    } catch (err: any) {
      alert("Қате орын алды: " + err.message);
      setIsKaspiLoading(false);
    }
  };

  const handleDownload = () => {
    if (product?.fileUrl) {
      window.open(product.fileUrl, '_blank');
    }
  };

  if (isLoading) return <div style={{ padding: "100px", textAlign: "center" }}>Жүктелуде...</div>;
  if (!product) return <div style={{ padding: "100px", textAlign: "center" }}>Материал табылмады</div>;

  return (
    <div className="mobile-container" style={{ display: "flex", flexDirection: "column", background: "var(--bg-color)", minHeight: "100vh" }}>
      
      <main className="content" style={{ flex: 1, padding: "0 0 220px 0", overflowY: "auto" }}>
        
        <div className="inner-container" style={{ position: "absolute", top: 20, left: 0, right: 0, zIndex: 1200, display: "flex", gap: "10px", padding: "0 20px" }}>
          <button 
            onClick={() => router.back()} 
            style={{ 
              background: "rgba(255,255,255,0.4)", 
              border: "1px solid rgba(255,255,255,0.3)", 
              fontSize: "0.9rem", 
              cursor: "pointer", 
              color: "white",
              padding: "8px 16px",
              borderRadius: "50px",
              fontWeight: "600",
              backdropFilter: "blur(10px)"
            }}
          >
            ← {t('det_back')}
          </button>
        </div>

        {/* Hero Section */}
        <div style={{ position: "relative", width: "100%", height: "40vh", minHeight: "300px", background: "var(--primary-navy)" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)" }} />
          
          <div className="inner-container" style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "30px 20px" }}>
            <div style={{ background: "#FF9500", color: "white", padding: "4px 12px", borderRadius: "50px", width: "fit-content", fontSize: "0.75rem", fontWeight: "800", marginBottom: "12px" }}>
              ⭐ 5.0 (Материал тексерілген)
            </div>
            <h1 style={{ fontSize: "2rem", margin: 0, fontWeight: "900", color: "white", lineHeight: 1.1 }}>
              {product.subject} ({product.classNumber} сынып)
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "15px" }}>
              <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: "500" }}>Авторы: {product.author?.fio || "Белгісіз"}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="inner-container" style={{ padding: "0 20px" }}>
          
          <div style={{ 
            background: "var(--card-bg)", 
            borderRadius: "24px", 
            padding: "24px", 
            marginTop: "-30px", 
            position: "relative", 
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            border: "1px solid var(--box-border)"
          }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "12px", color: "var(--text-main)", fontWeight: "800" }}>Сипаттама</h2>
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Бұл {product.subject} пәні бойынша {product.classNumber} сыныпқа арналған сапалы {product.type}. 
              Материал 2026 жылғы МЖМБС стандартына сай жасалған.
            </p>
          </div>

          <div style={{ margin: "40px 0" }}>
             <h2 style={{ fontSize: "1.3rem", marginBottom: "20px", fontWeight: "800" }}>Материалдың артықшылықтары</h2>
             <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: "10px" }}>✅ Толық редакцияланатын формат</li>
                <li style={{ marginBottom: "10px" }}>✅ ҚБ-ға арналған дайын тапсырмалар</li>
                <li style={{ marginBottom: "10px" }}>✅ Әдіскерлермен мақұлданған</li>
             </ul>
          </div>

        </div>
      </main>

      {/* Fixed Purchase Bar */}
      <div style={{ 
        position: "fixed", bottom: "0px", width: "100%", maxWidth: "480px", left: "50%", transform: "translateX(-50%)",
        padding: "18px 20px", background: "var(--card-bg)", borderTop: "1px solid var(--box-border)", boxShadow: "0 -10px 30px rgba(0,0,0,0.1)", zIndex: 2100,
        display: "flex", flexDirection: "column", gap: "12px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "800", textTransform: "uppercase" }}>БАРЛЫҒЫ:</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "var(--text-main)" }}>{product.price || 0} ₸</div>
          </div>
        </div>
        
        {purchased ? (
          <button className="generate-btn" style={{ background: "#34C759", border: "none", height: "54px" }} onClick={handleDownload}>
            Файлды жүктеу (Скачать)
          </button>
        ) : (
          <button className="generate-btn" onClick={handleBuy} disabled={isKaspiLoading} style={{ background: isKaspiLoading ? "#ccc" : "#0A66F0", border: "none", height: "54px", fontSize: "1.05rem" }}>
            {isKaspiLoading ? "Төлем жүруде..." : `Kaspi арқылы сатып алу (${product.price || 0} ₸)`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProductDetails() {
  return (
    <Suspense fallback={<div>Жүктелуде...</div>}>
      <ProductDetailsContent />
    </Suspense>
  );
}
