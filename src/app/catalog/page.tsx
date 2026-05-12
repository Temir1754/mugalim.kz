"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

export default function Catalog() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/materials");
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="mobile-container" style={{ maxWidth: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <main className="content" style={{ padding: "40px 0", backgroundColor: "var(--bg-color)", flex: 1 }}>
        <div className="inner-container">
          <div className="title-row">
            <h1>{t('cat_title')}</h1>
          </div>
          
          {isLoading ? (
            <p style={{ textAlign: "center", padding: "50px" }}>Жүктелуде...</p>
          ) : (
            <>
              <p className="subtitle">
                {products.length > 0 
                  ? t('cat_found').replace('{count}', products.length.toString()) 
                  : "Әзірге материалдар табылмады"}
              </p>
              
              <div className="grid-catalog">
                {products.map(product => (
                  <Link href={`/catalog/details?id=${product.id}`} key={product.id} style={{ textDecoration: "none" }}>
                    <div className="form-card" style={{ padding: "20px", display: "flex", gap: "20px", alignItems: "center", cursor: "pointer", height: "100%" }}>
                      
                      {/* Иконка (генерируем на основе типа) */}
                      <div style={{ width: "80px", height: "80px", backgroundColor: "var(--box-tint)", border: "1px solid var(--box-border)", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "2.5rem" }}>
                        {product.type === "ПРЕЗЕНТАЦИЯ" ? "📊" : product.type === "КСП" ? "📝" : "📂"}
                      </div>
                      
                      {/* Информация */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "white", background: "var(--primary-blue)", padding: "3px 8px", borderRadius: "6px", marginRight: "8px" }}>{product.type}</span>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>{product.classNumber} сынып</span>
                          </div>
                          <strong style={{ fontSize: "1.1rem", color: "#F14635" }}>{product.price || 0} ₸</strong>
                        </div>
                        
                        <h4 style={{ margin: "10px 0", fontSize: "1.2rem", color: "var(--text-main)" }}>
                          {product.subject}
                        </h4>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            Авторы: <b style={{color:"var(--primary-blue)"}}>{product.author?.fio || "Белгісіз"}</b>
                          </span>
                          <span style={{ fontSize: "0.85rem", color: "#FF9500", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                             ⭐ 5.0
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
