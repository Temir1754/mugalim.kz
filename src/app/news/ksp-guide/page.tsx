"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function KSPGuide() {
  const { t, language } = useLanguage();

  return (
    <div style={{ background: "var(--hero-bg)", minHeight: "100vh", paddingBottom: "100px" }}>
      {/* Header */}
      <div style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--box-border)", padding: "20px 0", position: "sticky", top: 0, zIndex: 100 }}>
        <div className="inner-container" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/generator" style={{ color: "var(--primary-blue)", textDecoration: "none", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            ← {t('det_back')}
          </Link>
          <h1 style={{ fontSize: "1.2rem", fontWeight: "800", margin: 0 }}>
            {language === 'ru' ? "Гайд по составлению КСП (2026)" : "ҚМЖ құрастыру бойынша нұсқаулық (2026)"}
          </h1>
        </div>
      </div>

      <div className="inner-container" style={{ maxWidth: "900px", marginTop: "40px" }}>
        {/* Intro */}
        <section className="form-card" style={{ padding: "40px", marginBottom: "30px", background: "linear-gradient(135deg, var(--card-bg) 0%, var(--box-tint) 100%)" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "20px", background: "linear-gradient(90deg, #0A66F0, #00C2FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {language === 'ru' ? "Как составить идеальный КСП?" : "Керемет ҚМЖ-ны қалай жасауға болады?"}
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.7", color: "var(--text-secondary)" }}>
            {language === 'ru' 
              ? "Краткосрочный план (КСП) — это не просто бумажная отчетность, а дорожная карта вашего урока. Мы подготовили подробную инструкцию, которая поможет вам создавать планы мирового уровня."
              : "Қысқа мерзімді жоспар (ҚМЖ) — бұл жай ғана қағаз есебі емес, бұл сіздің сабағыңыздың жол картасы. Біз сізге әлемдік деңгейдегі жоспарлар жасауға көмектесетін егжей-тегжейлі нұсқаулық дайындадық."}
          </p>
        </section>

        {/* Steps */}
        <div style={{ display: "grid", gap: "25px", marginBottom: "50px" }}>
          {[
            { 
              step: "01", 
              title: language === 'ru' ? "Тема и цели обучения" : "Тақырып пен оқу мақсаттары", 
              desc: language === 'ru' ? "Определите тему согласно КТП. Сформулируйте цели обучения в соответствии с учебной программой." : "КТЖ-ға сәйкес тақырыпты анықтаңыз. Оқу бағдарламасына сәйкес оқу мақсаттарын тұжырымдаңыз." 
            },
            { 
              step: "02", 
              title: language === 'ru' ? "Критерии оценивания" : "Бағалау критерийлері", 
              desc: language === 'ru' ? "Сформулируйте измеримые показатели достижения целей. Ученик должен понимать, за что он получит оценку." : "Мақсаттарға қол жеткізудің өлшенетін көрсеткіштерін тұжырымдаңыз. Оқушы не үшін баға алатынын түсінуі керек." 
            },
            { 
              step: "03", 
              title: language === 'ru' ? "Активная деятельность" : "Белсенді қызмет", 
              desc: language === 'ru' ? "Продумайте задания. Урок должен быть деятельностным: учитель организует исследование, а не просто объясняет." : "Тапсырмаларды ойластырыңыз. Сабақ іс-әрекетке негізделген болуы керек: мұғалім жай ғана түсіндіріп қоймай, зерттеуді ұйымдастырады." 
            }
          ].map(item => (
            <div key={item.step} style={{ display: "flex", gap: "25px", padding: "30px", background: "var(--card-bg)", borderRadius: "24px", border: "1px solid var(--box-border)" }}>
              <span style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--primary-blue)", opacity: 0.2, lineHeight: 1 }}>{item.step}</span>
              <div>
                <h4 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "10px" }}>{item.title}</h4>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Examples */}
        <h3 style={{ fontSize: "1.5rem", fontWeight: "900", marginBottom: "25px" }}>
          {language === 'ru' ? "Примеры по предметам" : "Пәндер бойынша мысалдар"}
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginBottom: "50px" }}>
          {[
            { 
              subject: language === 'ru' ? "Русский язык (5 класс)" : "Орыс тілі (5 сынып)", 
              theme: language === 'ru' ? "Предложение и его виды" : "Сөйлем және оның түрлері",
              goal: language === 'ru' ? "Распознавать простые и сложные предложения." : "Жай және құрмалас сөйлемдерді ажырату."
            },
            { 
              subject: language === 'ru' ? "Математика (2 класс)" : "Математика (2 сынып)", 
              theme: language === 'ru' ? "Сложение двузначных чисел" : "Екі таңбалы сандарды қосу",
              goal: language === 'ru' ? "Выполнять вычисления с переходом через десяток." : "Ондықтан аттап өту арқылы есептеулерді орындау."
            },
            { 
              subject: language === 'ru' ? "История Казахстана" : "Қазақстан тарихы", 
              theme: language === 'ru' ? "Образование Казахского ханства" : "Қазақ хандығының құрылуы",
              goal: language === 'ru' ? "Объяснить причины объединения племён." : "Тайпалардың бірігу себептерін түсіндіру."
            }
          ].map((ex, i) => (
            <div key={i} style={{ padding: "25px", background: "var(--box-tint)", borderRadius: "20px", border: "1px solid var(--box-border)" }}>
              <div style={{ fontWeight: "800", color: "var(--primary-blue)", marginBottom: "10px", fontSize: "0.9rem" }}>{ex.subject}</div>
              <div style={{ fontWeight: "700", marginBottom: "8px" }}>{ex.theme}</div>
              <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>{ex.goal}</div>
            </div>
          ))}
        </div>

        {/* Errors to avoid */}
        <section style={{ padding: "40px", background: "#FFEBEE", borderRadius: "24px", border: "1px solid #FFCDD2", color: "#B71C1C" }}>
          <h3 style={{ fontWeight: "900", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            ⚠️ {language === 'ru' ? "Типичные ошибки" : "Жиі кездесетін қателіктер"}
          </h3>
          <ul style={{ paddingLeft: "20px", display: "grid", gap: "12px", fontWeight: "600" }}>
            <li>{language === 'ru' ? "Несоответствие целей и заданий" : "Мақсаттар мен тапсырмалардың сәйкес келмеуі"}</li>
            <li>{language === 'ru' ? "Отсутствие измеримых критериев оценивания" : "Өлшенетін бағалау критерийлерінің болмауы"}</li>
            <li>{language === 'ru' ? "Формальное копирование шаблона" : "Үлгіні жай ғана көшіре салу"}</li>
            <li>{language === 'ru' ? "Отсутствие раздела рефлексии" : "Рефлексия бөлімінің болмауы"}</li>
          </ul>
        </section>

        {/* CTA */}
        <div style={{ marginTop: "60px", textAlign: "center" }}>
          <Link href="/generator" className="generate-btn" style={{ padding: "18px 45px", display: "inline-block", textDecoration: "none" }}>
            {language === 'ru' ? "Перейти к созданию Плана" : "Жоспар құруға өту"}
          </Link>
        </div>
      </div>
    </div>
  );
}
