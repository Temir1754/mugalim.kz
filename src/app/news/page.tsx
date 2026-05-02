"use client";

import Footer from "@/components/Footer";

export default function NewsPage() {
  const news = [
    { title: "БҒМ-нің №145 жаңа бұйрығы: КТЖ-дағы өзгерістер", date: "07.04.2026", desc: "Соңғы ұсыныстарға сәйкес жаңа оқу жылында бөлімдерді қалай дұрыс толтыру керектігін біліңіз." },
    { title: "Мұғалім.kz енді Наурыз мейрамын автоматты түрде есептейді", date: "05.04.2026", desc: "Біз Smart Calendar-ды жаңарттық. Енді КТЖ генерациялау кезінде барлық көктемгі мерекелер ескеріледі." },
    { title: "Наурыз айының үздік 5 авторы сыйлық алды", date: "01.04.2026", desc: "Биология және физика пәндері бойынша сатылым бойынша көш бастаған авторларымызды құттықтаймыз." }
  ];

  return (
    <div className="mobile-container" style={{ maxWidth: "100%" }}>
      <main className="content" style={{ padding: "40px 0" }}>
        <div className="inner-container">
          <div className="logo" style={{ justifyContent: "center", fontSize: "2rem", marginBottom: "10px" }}>
            Мұғалім.kz
          </div>
          <h1>Білім беру жаңалықтары</h1>
          <p className="subtitle">Стандарттардағы өзгерістер мен платформа жаңартуларынан хабардар болыңыз</p>

          <div className="grid-catalog">
            {news.map((item, idx) => (
              <div key={idx} className="form-card" style={{ padding: "30px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--primary-blue)", fontWeight: "bold" }}>{item.date}</span>
                <h3 style={{ margin: "10px 0" }}>{item.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>{item.desc}</p>
                <button style={{ background: "none", border: "none", color: "var(--primary-blue)", fontWeight: "bold", padding: 0, marginTop: "15px", cursor: "pointer" }}>Толығырақ →</button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
