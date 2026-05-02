"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations/dictionary";
import { generateLessonPlan, generateKTPThemes } from "@/lib/gemini";
import { calendar } from "@/utils/calendar";
import Footer from "@/components/Footer";

const GEMINI_API_KEY = "AIzaSyAlx1Zs7f41_odpXX6fS77eKLPsfuJSdYM";

async function callGeminiAI(
  subject: string,
  className: string,
  theme: string,
  language: string = "kz"
): Promise<any> {
  const prompt = `Сіз — Қазақстан Республикасының білім беру жүйесінің сарапшы-әдіскерісіз.
Қазақстан мұғалімдеріне арналған Сабақтың қысқа мерзімді жоспарын (ҚМЖ) құрастырыңыз.

МӘЛІМЕТТЕР:
- ПӘН: ${subject}
- СЫНЫП: ${className}
- ТАҚЫРЫП: ${theme}
- ТІЛ: Қазақша

ТЕК валидті JSON объектісін қайтарыңыз (markdown блоктарсыз, блок сыртында тырнақшасыз):
{
  "lessonGoal": "Сабақтың SMART-мақсаты",
  "criteria": "бағалау критерийлері",
  "langGoals": "тілдік мақсаттар мен терминдер",
  "values": "құндылықтарды дарыту",
  "links": "пәнаралық байланыстар",
  "priorKnowledge": "алдыңғы білім",
  "lessonFlow": "Басы: ...\\nОртасы: ...\\nСоңы: ...",
  "differentiation": "саралау",
  "assessment": "қалыптастырушы бағалау",
  "resources": "ресурстар"
}

Барлық мәндер ТЕК ҚАЗАҚ ТІЛІНДЕ болуы тиіс.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || `Gemini error ${res.status}`);
  }

  const data = await res.json();
  const rawText: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const jsonStr = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(jsonStr);
}

export default function GeneratorPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  const [teacherName, setTeacherName] = useState("");
  const [docType, setDocType] = useState("КСП"); // "КСП" or "КТП"
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [docLanguage] = useState("kz");
  const [theme, setTheme] = useState("");
  const [book, setBook] = useState("");

  // KSP specific fields
  const [lessonGoal, setLessonGoal] = useState("");
  const [criteria, setCriteria] = useState("");
  const [langGoals, setLangGoals] = useState("");
  const [values, setValues] = useState("");
  const [links, setLinks] = useState("");
  const [priorKnowledge, setPriorKnowledge] = useState("");
  const [lessonFlow, setLessonFlow] = useState("");
  const [lessonStages, setLessonStages] = useState<any[]>([]);
  const [differentiation, setDifferentiation] = useState("");
  const [methodology, setMethodology] = useState("");
  const [selfReflection, setSelfReflection] = useState("");
  const [assessment, setAssessment] = useState("");
  const [resources, setResources] = useState("");

  // KTP specific fields
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // [1, 3] for Mon, Wed
  const [totalHours, setTotalHours] = useState(34);
  const [ktpLessons, setKtpLessons] = useState<{ index: number; date: string; theme: string }[]>([]);

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [aiDone, setAiDone] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subjects: string[] = translations["kz"].subjects as unknown as string[];
  const classes: string[] = translations["kz"].classes as unknown as string[];

  const handleCalculateKTP = () => {
    if (selectedDays.length === 0) {
      setError("Апта күндерін таңдаңыз");
      return;
    }
    setError("");
    const dates = calendar.generateDates(selectedDays, totalHours);
    const lessons = dates.map((date: string, i: number) => ({
      index: i + 1,
      date,
      theme: `${i + 1}-сабақ`
    }));
    setKtpLessons(lessons);
    setAiDone(true);
  };

  const handleGenerateKTPThemes = async () => {
    if (!subject || !className) {
      setError("Пән мен сыныпты таңдаңыз");
      return;
    }
    setIsGeneratingAI(true);
    setError("");
    try {
      const themes = await generateKTPThemes(subject, className, totalHours, docLanguage);
      const updatedLessons = ktpLessons.map((l: any, i: number) => ({
        ...l,
        theme: themes[i]?.theme || l.theme
      }));
      setKtpLessons(updatedLessons);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAIGenerate = async () => {
    if (docType === "КТП") {
      handleCalculateKTP();
      return;
    }

    if (!subject || !className || !theme) {
      setError("Пән, Сынып және Тақырыпты толтырыңыз");
      return;
    }
    setError("");
    setAiDone(false);
    setIsGeneratingAI(true);
    try {
      const data = await generateLessonPlan(subject, className, theme, docLanguage, book);
      setLessonGoal(data.lessonGoal || "");
      setCriteria(data.criteria || "");
      setLangGoals(data.langGoals || "");
      setValues(data.values || "");
      setLinks(data.links || "");
      setPriorKnowledge(data.priorKnowledge || "");
      setLessonStages(data.lessonStages || []);
      const flowText = (data.lessonStages || [])
        .map((s: any) => `${s.stage}:\n${s.teacherActions}\n${s.studentActions}\n---`)
        .join("\n\n");
      setLessonFlow(flowText || data.lessonFlow || "");
      
      setDifferentiation(data.differentiation || "");
      setMethodology(data.methodology || "");
      setSelfReflection(data.selfReflection || "");
      setAssessment(data.assessment || "");
      setResources(data.resources || "");
      setAiDone(true);
    } catch (err: any) {
      setError("ЖИ қатесі: " + err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsDownloading(true);
    setError("");
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType,
          teacherName,
          subject,
          className,
          docLanguage,
          theme,
          book,
          authorId: user?.id,
          lessonGoal,
          criteria,
          langGoals,
          values,
          links,
          priorKnowledge,
          lessonFlow,
          lessonStages,
          differentiation,
          methodology,
          selfReflection,
          assessment,
          resources,
          lessonDates: [new Date().toLocaleDateString("kz-KZ")],
          lessons: ktpLessons,
        }),
      });
      if (!res.ok) throw new Error("Сервер қатесі");
      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { 
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
      });
      
      const fileName = `${docType === "КТП" ? "ktj" : "qmj"}_zhospary.docx`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 500);
    } catch {
      setError("Файл жасау кезінде қате кетті");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-main)" }}>
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "48px 20px 120px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
          {t("gen_title")}
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 32, lineHeight: 1.6 }}>
          {t("gen_subtitle")}
        </p>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#ef4444",
              padding: "14px 18px",
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--box-border)",
            borderRadius: 20,
            padding: 28,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>{t("gen_label_fio")}</label>
            <input
              type="text"
              placeholder={t("gen_placeholder_fio")}
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>{t("gen_label_type")}</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)} style={selectStyle}>
              <option value="КСП">ҚМЖ — Сабақ жоспары</option>
              <option value="КТП">КТЖ — Күнтізбелік-тақырыптық жоспар</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>{t("gen_label_class")}</label>
            <select value={className} onChange={(e) => setClassName(e.target.value)} style={selectStyle}>
              <option value="">Сыныпты таңдаңыз...</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 1" }}>
             <label style={labelStyle}>{t("gen_label_doc_lang")}</label>
             <div style={{ ...inputStyle, background: "var(--box-tint)", opacity: 0.8 }}>Қазақша</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 2" }}>
            <label style={labelStyle}>{t("gen_label_subject")}</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={selectStyle}>
              <option value="">Пәнді таңдаңыз...</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {docType === "КСП" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 2" }}>
              <label style={labelStyle}>{t("gen_label_theme")}</label>
              <input
                type="text"
                placeholder="Мысалы: Тіктөртбұрыш ауданы"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          {docType === "КСП" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 2" }}>
              <label style={labelStyle}>{t("gen_label_book")}</label>
              <input
                type="text"
                placeholder={t("gen_placeholder_book")}
                value={book}
                onChange={(e) => setBook(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          {docType === "КТП" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, gridColumn: "span 2" }}>
              <label style={labelStyle}>{t("gen_label_days")}</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5, 6].map((day) => {
                  const labels = ["", "Дс", "Сс", "Ср", "Бс", "Жм", "Сб"];
                  const label = labels[day];
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (isSelected) setSelectedDays(selectedDays.filter((d: number) => d !== day));
                        else setSelectedDays([...selectedDays, day]);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 10,
                        border: "1px solid var(--box-border)",
                        background: isSelected ? "var(--text-main)" : "var(--box-tint)",
                        color: isSelected ? "var(--bg-main)" : "var(--text-main)",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                        transition: "all 0.2s"
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {docType === "КТП" && (
             <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 2" }}>
             <label style={labelStyle}>
               Жалпы сағат саны
             </label>
             <select 
               value={totalHours} 
               onChange={(e) => setTotalHours(Number(e.target.value))} 
               style={selectStyle}
             >
               {[34, 68, 102, 136, 170, 204].map(h => (
                 <option key={h} value={h}>{h} сағат</option>
               ))}
             </select>
           </div>
          )}

          <button
            onClick={handleAIGenerate}
            disabled={isGeneratingAI}
            style={{
              gridColumn: "span 2",
              padding: "16px 24px",
              background: isGeneratingAI
                ? "rgba(99,102,241,0.5)"
                : "linear-gradient(135deg, #6366f1, #818cf8)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              border: "none",
              borderRadius: 16,
              cursor: isGeneratingAI ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "opacity 0.2s",
            }}
          >
            {isGeneratingAI ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={spinnerStyle} />
                  {t("gen_ai_loading")}
                </div>
                <p style={{ fontSize: 12, opacity: 0.8, fontWeight: 400 }}>
                  Терең генерация (7+ бет)... Бұл 1-2 минут алуы мүмкін
                </p>
              </div>
            ) : (
              t("gen_ai_btn")
            )}
          </button>
        </div>

        {aiDone && docType === "КСП" && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
              ✅ Нәтиже — ҚМЖ дайын
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label={t("gen_label_goal")} value={lessonGoal} onChange={setLessonGoal} rows={3} />
              <Field label={t("gen_label_flow")} value={lessonFlow} onChange={setLessonFlow} rows={10} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label={t("gen_label_criteria")} value={criteria} onChange={setCriteria} rows={4} />
                <Field label={t("gen_label_lang_goals")} value={langGoals} onChange={setLangGoals} rows={4} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label={t("gen_label_values")} value={values} onChange={setValues} rows={3} />
                <Field label={t("gen_label_links")} value={links} onChange={setLinks} rows={3} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label={t("gen_label_diff")} value={differentiation} onChange={setDifferentiation} rows={3} />
                <Field label={t("gen_label_assess")} value={assessment} onChange={setAssessment} rows={3} />
              </div>

              <Field label={t("gen_label_resources")} value={resources} onChange={setResources} rows={2} />
            </div>

            <button
              onClick={handleDownloadDocx}
              disabled={isDownloading}
              id="download-docx-btn"
              style={{
                marginTop: 32,
                width: "100%",
                padding: "20px 24px",
                background: "var(--text-main)",
                color: "var(--bg-main)",
                fontWeight: 800,
                fontSize: 18,
                border: "none",
                borderRadius: 18,
                cursor: isDownloading ? "not-allowed" : "pointer",
                position: "relative",
                zIndex: 10,
                opacity: isDownloading ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {isDownloading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                   <span style={{ ...spinnerStyle, borderTopColor: "var(--text-main)" }} />
                   {t("gen_loading")}
                </div>
              ) : (
                <>
                  <span style={{ marginRight: 8 }}>🚀</span>
                  {t("gen_submit")}
                </>
              )}
            </button>
          </div>
        )}

        {aiDone && docType === "КТП" && (
            <div style={{ marginTop: 40 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                        ✅ Күнтізбе жасалды
                    </h2>
                    <button 
                        onClick={handleGenerateKTPThemes}
                        disabled={isGeneratingAI}
                        style={{
                            padding: "10px 20px",
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 12,
                            fontWeight: 600,
                            cursor: isGeneratingAI ? "not-allowed" : "pointer",
                            fontSize: 14,
                            opacity: isGeneratingAI ? 0.7 : 1
                        }}
                    >
                        {isGeneratingAI ? t("gen_ai_loading") : "✨ Тақырыптарды ЖИ-мен толтыру"}
                    </button>
                </div>

                <div style={{ 
                    background: "var(--card-bg)", 
                    border: "1px solid var(--box-border)", 
                    borderRadius: 16, 
                    overflow: "hidden" 
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "var(--box-tint)", borderBottom: "1px solid var(--box-border)" }}>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, color: "var(--text-muted)" }}>#Сабақ</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, color: "var(--text-muted)" }}>Күні</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, color: "var(--text-muted)" }}>Сабақ тақырыбы</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ktpLessons.map((lesson: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: "1px solid var(--box-border)" }}>
                                    <td style={{ padding: "12px 16px", fontSize: 14 }}>{lesson.index}</td>
                                    <td style={{ padding: "12px 16px", fontSize: 14 }}>{lesson.date}</td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <input 
                                            type="text" 
                                            value={lesson.theme} 
                                            onChange={(e) => {
                                                const newLessons = [...ktpLessons];
                                                newLessons[idx].theme = e.target.value;
                                                setKtpLessons(newLessons);
                                            }}
                                            style={{ 
                                                width: "100%", 
                                                background: "transparent", 
                                                border: "none", 
                                                color: "var(--text-main)",
                                                outline: "none",
                                                fontSize: 14
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    onClick={handleDownloadDocx}
                    disabled={isDownloading}
                    style={{
                        marginTop: 32,
                        width: "100%",
                        padding: "20px 24px",
                        background: "var(--text-main)",
                        color: "var(--bg-main)",
                        fontWeight: 800,
                        fontSize: 18,
                        border: "none",
                        borderRadius: 18,
                        cursor: isDownloading ? "not-allowed" : "pointer",
                        opacity: isDownloading ? 0.6 : 1,
                        transition: "opacity 0.2s",
                    }}
                >
                    {isDownloading ? t("gen_loading") : t("gen_submit")}
                </button>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
      />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-muted)",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  background: "var(--box-tint)",
  border: "1px solid var(--box-border)",
  borderRadius: 12,
  padding: "12px 16px",
  color: "var(--text-main)",
  fontSize: 14,
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  background: "var(--box-tint)",
  border: "1px solid var(--box-border)",
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 14,
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
  cursor: "pointer",
};

const spinnerStyle: React.CSSProperties = {
  display: "inline-block",
  width: 18,
  height: 18,
  border: "2px solid rgba(255,255,255,0.3)",
  borderTop: "2px solid #fff",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};
