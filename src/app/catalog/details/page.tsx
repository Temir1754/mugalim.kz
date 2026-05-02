"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductDetails() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isKaspiLoading, setIsKaspiLoading] = useState(false);
  const [purchased, setPurchased] = useState(false);

  // Фейковые данные товара
  const product = {
    title: language === 'ru' ? "КСП Математика 3 класс (I Четверть)" : "3-сынып математика ҚМЖ (I тоқсан)",
    author: "@best_math",
    authorName: "Есмурзаева М.Б.",
    rating: 4.9,
    reviews: 112,
    price: 2000,
    description: language === 'ru' 
      ? "Уникальный поурочный план, полностью соответствующий ГОСО РК 2026 года. Включает в себя детально расписанные действия учителя и учеников, формативное оценивание и все нужные ресурсы (презентации, карточки)." 
      : "2026 жылғы ҚР МЖМБС-на толық сәйкес келетін бірегей сабақ жоспары. Мұғалім мен оқушылардың егжей-тегжейлі іс-әрекеттерін, формативті бағалауды және барлық қажетті ресурстарды қамтиды.",
    imgUrl: "https://images.unsplash.com/photo-1632516643720-e7f0d7e6a739?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    features: [
      { id: 1, icon: "📄", title: t('det_file_v1'), desc: language === 'ru' ? "Полностью редактируемый Word файл" : "Толық редакцияланатын Word файлы" },
      { id: 2, icon: "💻", title: t('det_file_v2'), desc: language === 'ru' ? "Интерактивные слайды для каждого урока" : "Әр сабаққа арналған интерактивті слайдтар" },
      { id: 3, icon: "✂️", title: t('det_file_v3'), desc: language === 'ru' ? "Карточки и задания для печати" : "Басып шығаруға арналған карточкалар мен тапсырмалар" },
      { id: 4, icon: "📊", title: t('det_file_v4'), desc: language === 'ru' ? "Готовые рубрики для ФО" : "ҚБ-ға арналған дайын рубрикалар" },
    ],
    benefits: language === 'ru' 
      ? ["Экономия 10+ часов подготовки", "100% соответствие ГОСО 2026", "Проверено методистами", "Готово к печати"]
      : ["Дайындыққа кететін 10+ сағатты үнемдеу", "2026 жылғы МЖМБС-на 100% сәйкес келеді", "Әдіскерлермен тексерілген", "Басып шығаруға дайын"],
    previews: [
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    ],
    userReviews: [
      { name: "Айгуль С.", date: "12.03.2026", text: language === 'ru' ? "Отличный материал! Все четко по целям обучения." : "Керемет материал! Оқу мақсаттарына сай бәрі нақты жазылған.", rating: 5 },
      { name: "Болат Ж.", date: "05.03.2026", text: language === 'ru' ? "Презентации очень красивые, дети в восторге." : "Презентациялар өте әдемі, балаларға қатты ұнады.", rating: 5 },
      { name: "Мадина К.", date: "28.02.2026", text: language === 'ru' ? "Немного поправила под свой класс, но база супер." : "Сал қана өз сыныбыма ыңғайлап түзеттім, бірақ базасы супер.", rating: 4 },
    ]
  };

  const faqs = [
    { q: language === 'ru' ? "В каком формате придет файл?" : "Файл қандай форматта болады?", a: language === 'ru' ? "Вы получите архив с .docx и .pptx файлами." : "Сіз .docx және .pptx файлдары бар архив аласыз." },
    { q: language === 'ru' ? "Можно ли редактировать текст?" : "Мәтінді редакциялауға бола ма?", a: language === 'ru' ? "Да, все файлы полностью открыты для редактирования." : "Иә, барлық файлдар редакциялау үшін толық ашық." },
    { q: language === 'ru' ? "Как я получу товар после оплаты?" : "Төлемнен кейін тауарды қалай аламын?", a: language === 'ru' ? "Ссылка появится мгновенно в личном кабинете." : "Сілтеме жеке кабинетте бірден пайда болады." },
  ];

  const handleBuy = () => {
    setIsKaspiLoading(true);
    // Имитация загрузки Kaspi Pay
    setTimeout(() => {
      setIsKaspiLoading(false);
      setPurchased(true);
    }, 1500);
  };

  const handleBack = () => {
    // If we have history, go back, otherwise go to catalog
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/catalog");
    }
  };

  return (
    <div className="mobile-container" style={{ display: "flex", flexDirection: "column", background: "var(--bg-color)", minHeight: "100vh" }}>
      
      <main className="content" style={{ flex: 1, padding: "0 0 220px 0", overflowY: "auto" }}>
        
        {/* Navigation Bar / Over the Hero */}
        <div className="inner-container" style={{ position: "absolute", top: 20, left: 0, right: 0, zIndex: 1200, display: "flex", gap: "10px", padding: "0 20px" }}>
          <button 
            onClick={handleBack} 
            style={{ 
              background: "rgba(255,255,255,0.2)", 
              border: "1px solid rgba(255,255,255,0.3)", 
              fontSize: "0.9rem", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              color: "white",
              padding: "8px 16px",
              borderRadius: "50px",
              fontWeight: "600",
              backdropFilter: "blur(10px)",
              transition: "all 0.2s"
            }}
          >
            {t('det_back')}
          </button>
        </div>

        {/* Hero Section */}
        <div style={{ position: "relative", width: "100%", height: "45vh", minHeight: "350px", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${product.imgUrl}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)" }} />
          
          <div className="inner-container" style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "30px 20px" }}>
            <div style={{ background: "rgba(255,149,0,0.2)", color: "#FFB800", padding: "4px 12px", borderRadius: "50px", width: "fit-content", fontSize: "0.75rem", fontWeight: "800", marginBottom: "12px", border: "1px solid rgba(255,149,0,0.3)", backdropFilter: "blur(5px)" }}>
              ⭐ {product.rating} ({product.reviews} {t('det_reviews')})
            </div>
            <h1 style={{ fontSize: "2rem", margin: 0, fontWeight: "900", color: "white", lineHeight: 1.1, textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
              {product.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "15px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary-blue)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", fontSize: "0.8rem" }}>
                {product.authorName[0]}
              </div>
              <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: "500" }}>{product.authorName}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="inner-container" style={{ padding: "0 20px" }}>
          
          {/* Main Info Card */}
          <div style={{ 
            background: "var(--card-bg)", 
            borderRadius: "24px", 
            padding: "24px", 
            marginTop: "-30px", 
            position: "relative", 
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            border: "1px solid var(--box-border)"
          }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "12px", color: "var(--text-main)", fontWeight: "800" }}>{t('det_author_desc')}</h2>
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "0" }}>
              {product.description}
            </p>
          </div>

          {/* Benefits Section */}
          <div style={{ margin: "40px 0" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "20px", color: "var(--text-main)", fontWeight: "800", textAlign: "center" }}>{t('det_benefits')}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {product.benefits.map((benefit, i) => (
                <div key={i} style={{ background: "var(--box-tint)", padding: "15px", borderRadius: "16px", border: "1px solid var(--box-border)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.2rem" }}>✅</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)" }}>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What's Inside Section */}
          <div style={{ margin: "40px 0" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "20px", color: "var(--text-main)", fontWeight: "800", textAlign: "center" }}>{t('det_what_inside')}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {product.features.map(feature => (
                <div key={feature.id} style={{ display: "flex", gap: "15px", background: "var(--card-bg)", padding: "18px", borderRadius: "20px", border: "1px solid var(--box-border)", transition: "transform 0.2s" }}>
                  <div style={{ fontSize: "2rem", width: "50px", height: "50px", background: "var(--box-tint)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {feature.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "1rem", margin: "0 0 4px 0", fontWeight: "700" }}>{feature.title}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          <div style={{ margin: "40px 0" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "20px", color: "var(--text-main)", fontWeight: "800", textAlign: "center" }}>{t('det_preview')}</h2>
            <div style={{ display: "flex", gap: "15px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "none" }}>
              {product.previews.map((img, i) => (
                <div key={i} style={{ flex: "0 0 280px", height: "180px", borderRadius: "18px", overflow: "hidden", border: "1px solid var(--box-border)", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                  <img src={img} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div style={{ margin: "40px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.3rem", margin: 0, color: "var(--text-main)", fontWeight: "800" }}>{t('det_reviews_title')}</h2>
              <span style={{ color: "var(--primary-blue)", fontWeight: "700", fontSize: "0.9rem" }}>{product.rating} / 5</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {product.userReviews.map((review, i) => (
                <div key={i} style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "20px", border: "1px solid var(--box-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{review.name}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{review.date}</span>
                  </div>
                  <div style={{ color: "#FFB800", fontSize: "0.8rem", marginBottom: "10px" }}>
                    {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{review.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div style={{ margin: "40px 0 60px 0" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "20px", color: "var(--text-main)", fontWeight: "800", textAlign: "center" }}>{t('det_faq')}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {faqs.map((faq, i) => (
                <details key={i} style={{ background: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--box-border)", overflow: "hidden" }}>
                  <summary style={{ padding: "15px 20px", fontWeight: "700", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {faq.q}
                    <span style={{ color: "var(--primary-blue)" }}>↓</span>
                  </summary>
                  <div style={{ padding: "0 20px 20px 20px", fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Fixed Purchase Bar */}
      <div style={{ 
        position: "fixed", 
        bottom: "0px", 
        width: "100%", 
        maxWidth: "480px", 
        left: "50%",
        transform: "translateX(-50%)",
        padding: "18px 20px", 
        background: "var(--card-bg)", 
        backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--box-border)", 
        boxShadow: "0 -10px 30px rgba(0,0,0,0.1)", 
        zIndex: 2100,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "background-color 0.3s ease"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>{language === 'ru' ? 'ИТОГО:' : 'БАРЛЫҒЫ:'}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "var(--text-main)", lineHeight: 1 }}>{product.price} ₸</div>
          </div>
          <button style={{ background: "none", border: "none", color: "var(--primary-blue)", fontWeight: "800", cursor: "pointer", fontSize: "0.9rem", padding: "5px 0" }}>
            {t('det_share')}
          </button>
        </div>
        
        {purchased ? (
          <button className="generate-btn" style={{ background: "#34C759", border: "none", height: "54px" }} onClick={() => router.push('/generator')}>
            {t('det_purchased')}
          </button>
        ) : (
          <button className="generate-btn" onClick={handleBuy} disabled={isKaspiLoading} style={{ background: isKaspiLoading ? "#ccc" : "#F14635", border: "none", height: "54px", fontSize: "1.05rem", gap: "10px" }}>
            {isKaspiLoading ? (
               <span>{t('det_loading_kaspi')}</span>
            ) : (
              <>
                <span style={{ fontSize: "1.2rem" }}>💳</span>
                <span>{t('det_buy_kaspi').replace('{price}', product.price.toString())}</span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
