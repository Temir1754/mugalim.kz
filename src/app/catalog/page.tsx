"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

export default function Catalog() {
  const { t, language } = useLanguage();
  const products = [
    { id: 1, subject: "Математика", class: "3 сынып", type: "КТЖ", price: "2 500", rating: "4.9", reviews: 124, icon: "📏", author: "@school_best" },
    { id: 2, subject: "Математика", class: "1 сынып", type: "КТЖ", price: "2 000", rating: "5.0", reviews: 89, icon: "🔢", author: "@math_teacher" },
    { id: 3, subject: "Биология", class: "7 сынып", type: "ҚМЖ", price: "1 500", rating: "4.8", reviews: 56, icon: "🧬", author: "@bio_master" },
    { id: 4, subject: "Информатика", class: "9 сынып", type: "КТЖ", price: "3 000", rating: "4.7", reviews: 42, icon: "💻", author: "@it_pro" }
  ];

  return (
    <div className="mobile-container" style={{ maxWidth: "100%" }}>
      <main className="content" style={{ padding: "40px 0", backgroundColor: "var(--bg-color)", flex: 1 }}>
        <div className="inner-container">
          <div className="title-row">
            <h1>{t('cat_title')}</h1>
          </div>
          <p className="subtitle">{t('cat_found').replace('{count}', products.length.toString())}</p>
          
          <div className="grid-catalog">
            {products.map(product => (
              <Link href="/catalog/details" key={product.id} style={{ textDecoration: "none" }}>
                <div className="form-card" style={{ padding: "20px", display: "flex", gap: "20px", alignItems: "center", cursor: "pointer", height: "100%" }}>
                  
                  {/* Иконка / Обложка */}
                  <div style={{ width: "80px", height: "80px", backgroundColor: "var(--box-tint)", border: "1px solid var(--box-border)", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "2.5rem" }}>
                    {product.icon}
                  </div>
                  
                  {/* Информация */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "white", background: "var(--primary-blue)", padding: "3px 8px", borderRadius: "6px", marginRight: "8px" }}>{product.type}</span>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>{product.class}</span>
                      </div>
                      <strong style={{ fontSize: "1.1rem", color: "#F14635" }}>{product.price} ₸</strong>
                    </div>
                    
                    <h4 style={{ margin: "10px 0", fontSize: "1.2rem", color: "var(--text-main)" }}>
                      {product.subject}
                    </h4>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{t('cat_from')} <b style={{color:"var(--primary-blue)"}}>{product.author}</b></span>
                      <span style={{ fontSize: "0.85rem", color: "#FF9500", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                         ⭐ {product.rating} <span style={{color:"var(--text-secondary)", fontWeight:"normal"}}>({product.reviews})</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
