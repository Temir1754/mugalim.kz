"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations/dictionary";
import { generateLessonPlan, generateKTPThemes } from "@/lib/gemini";
import { calendar } from "@/utils/calendar";
import Footer from "@/components/Footer";

// GEMINI_API_KEY removed for security. Using server-side generation instead.

// AI generation is handled via server actions in lib/gemini.ts

export default function GeneratorPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  const [teacherName, setTeacherName] = useState("");
  const [docType, setDocType] = useState("КСП"); // "КСП" or "КТП"
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [docLanguage, setDocLanguage] = useState("kz");
  const [theme, setTheme] = useState("");
  const [book, setBook] = useState("");
  const [lessonDate, setLessonDate] = useState("");

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

  const [selectedDays, setSelectedDays] = useState<number[]>([]); // [1, 3] for Mon, Wed
  const [totalHours, setTotalHours] = useState(34);
  const [ktpLessons, setKtpLessons] = useState<{ index: number; date: string; theme: string }[]>([]);

  // --- NEW RAG-READY FIELDS ---
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);
  const [dbTextbooks, setDbTextbooks] = useState<any[]>([]);
  const [dbTopics, setDbTopics] = useState<any[]>([]);
  const [selectedTextbookId, setSelectedTextbookId] = useState("");
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [aiDone, setAiDone] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch all available subjects from DB
    fetch("/api/generator/metadata?type=subjects")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbSubjects(data);
      })
      .catch(err => console.error("Error fetching subjects:", err));

    // Auto-fill from localStorage if available
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.fio) setTeacherName(user.fio);
        if (user.specialty) setSubject(user.specialty);
        if (user.className) setClassName(user.className);
      } catch (e) {
        console.error("Auth parse error", e);
      }
    }
  }, []);

  const classes: string[] = translations["kz"].classes as unknown as string[];
  
  const publishersBySubject: Record<string, string[]> = {
    "Ағылшын тілі": ["Express Publishing Kazakhstan", "Oxford University Press", "Cambridge University Press", "Macmillan"],
    "Математика": ["Мектеп", "Атамұра", "Алматыкітап баспасы", "Арман-ПВ"],
    "Алгебра": ["Мектеп", "Атамұра", "Арман-ПВ"],
    "Геометрия": ["Мектеп", "Атамұра"],
    "Қазақ тілі": ["Атамұра", "Алматыкітап баспасы", "Мектеп", "Арман-ПВ"],
    "Қазақ әдебиеті": ["Атамұра", "Алматыкітап баспасы", "Арман-ПВ"],
    "Орыс тілі": ["Мектеп", "Алматыкітап баспасы", "Көкжиек-Горизонт"],
    "Информатика": ["Арман-ПВ", "Мектеп", "Bilim Media Group"],
    "Физика": ["Мектеп", "Арман-ПВ"],
    "Химия": ["Мектеп", "Арман-ПВ"],
    "Биология": ["Мектеп", "Атамұра"],
    "География": ["Атамұра", "Алматыкітап баспасы"],
    "Тарих": ["Атамұра", "Мектеп"],
    "Жаратылыстану": ["Алматыкітап баспасы", "Мектеп", "Атамұра"],
    "Өзін-өзі тану": ["Бөбек"],
    "Көркем еңбек": ["Алматыкітап баспасы"],
    "Дене шынықтыру": ["Мектеп"]
  };

  const defaultPublishers = [
    "Атамұра",
    "Мектеп",
    "Алматыкітап баспасы",
    "Көкжиек-Горизонт",
    "Aknur Press",
    "Арман-ПВ",
    "Bilim Media Group",
    "Express Publishing Kazakhstan"
  ];

  const subjectsByGrade: Record<string, string[]> = {
    primary: ["Математика", "Қазақ тілі", "Әдебиеттік оқу", "Орыс тілі", "Ағылшын тілі", "Жаратылыстану", "Дүниетану", "Көркем еңбек", "Музыка", "Дене шынықтыру", "Өзін-өзі тану", "Цифрлық сауаттылық"],
    middle56: ["Математика", "Қазақ тілі", "Қазақ әдебиеті", "Орыс тілі", "Орыс әдебиеті", "Ағылшын тілі", "Жаратылыстану", "Қазақстан тарихы", "Информатика", "Көркем еңбек", "Музыка", "Дене шынықтыру"],
    middle79: ["Алгебра", "Геометрия", "Физика", "Химия", "Биология", "География", "Информатика", "Қазақстан тарихы", "Дүниежүзі тарихы", "Қазақ тілі", "Қазақ әдебиеті", "Орыс тілі", "Орыс әдебиеті", "Ағылшын тілі", "Дене шынықтыру", "Көркем еңбек"],
    senior: ["Алгебра және анализ бастамалары", "Геометрия", "Физика", "Химия", "Биология", "География", "Информатика", "Қазақстан тарихы", "Дүниежүзі тарихы", "Құқық негіздері", "Қазақ тілі", "Қазақ әдебиеті", "Орыс тілі", "Орыс әдебиеті", "Ағылшын тілі", "Дене шынықтыру"]
  };

  const filteredSubjects = (() => {
    const dbSubjectNames = dbSubjects.map(s => s.name);
    let baseList: string[] = [];
    
    if (!className) {
      baseList = subjectsByGrade.primary;
    } else {
      const grade = parseInt(className);
      if (grade <= 4) baseList = subjectsByGrade.primary;
      else if (grade <= 6) baseList = subjectsByGrade.middle56;
      else if (grade <= 9) baseList = subjectsByGrade.middle79;
      else baseList = subjectsByGrade.senior;
    }

    return Array.from(new Set([...baseList, ...dbSubjectNames])).sort();
  })();

  // Reset subject if it's not in the new filtered list
  useEffect(() => {
    if (className && subject && !filteredSubjects.includes(subject)) {
      setSubject("");
    }
  }, [className, filteredSubjects, subject]);

  const currentPublishers = subject && publishersBySubject[subject] 
    ? publishersBySubject[subject] 
    : defaultPublishers;

  // --- NEW: FETCH TEXTBOOKS FROM DB ---
  useEffect(() => {
    async function fetchTextbooks() {
      if (!subject || !className) {
        setDbTextbooks([]);
        return;
      }
      setIsLoadingMetadata(true);
      try {
        const res = await fetch(`/api/generator/metadata?type=textbooks&subjectName=${encodeURIComponent(subject)}&grade=${className}&language=${docLanguage}`);
        const data = await res.json();
        setDbTextbooks(data);
        
        if (Array.isArray(data) && data.length === 1) {
          setSelectedTextbookId(data[0].id);
          setBook(`${data[0].publisher}, ${data[0].year} (${data[0].author})`);
        } else {
          setSelectedTextbookId("");
          setBook("");
        }
      } catch (e) {
        console.error("Textbook fetch error", e);
      } finally {
        setIsLoadingMetadata(false);
      }
    }
    fetchTextbooks();
  }, [subject, className, docLanguage]);

  // --- NEW: FETCH TOPICS FROM DB ---
  useEffect(() => {
    async function fetchTopics() {
      if (!selectedTextbookId) {
        setDbTopics([]);
        return;
      }
      setIsLoadingMetadata(true);
      try {
        const res = await fetch(`/api/generator/metadata?type=topics&textbookId=${selectedTextbookId}`);
        const data = await res.json();
        setDbTopics(data);
      } catch (e) {
        console.error("Failed to fetch topics", e);
      } finally {
        setIsLoadingMetadata(false);
      }
    }
    fetchTopics();
  }, [selectedTextbookId]);

  if (!mounted) return null;

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
          lessonDate,
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
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 30,
            padding: 32,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
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

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>{t("gen_label_subject")}</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={selectStyle}>
              <option value="">Пәнді таңдаңыз...</option>
              {filteredSubjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 1" }}>
             <label style={labelStyle}>{t("gen_label_doc_lang")}</label>
             <select value={docLanguage} onChange={(e) => setDocLanguage(e.target.value)} style={selectStyle}>
                <option value="kz">Қазақша</option>
                <option value="ru">Русский</option>
             </select>
          </div>

          {docType === "КСП" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>{t("gen_label_doc_lang") === "Оқыту тілі" ? "Күні" : "Дата"}</label>
              <input 
                type="date" 
                value={lessonDate} 
                onChange={(e) => setLessonDate(e.target.value)} 
                style={inputStyle}
              />
            </div>
          )}

          {docType === "КСП" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Оқулық / Баспа</label>
              <select 
                value={selectedTextbookId} 
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedTextbookId(id);
                  const found = Array.isArray(dbTextbooks) ? dbTextbooks.find(t => t.id === id) : null;
                  if (found) setBook(`${found.publisher}, ${found.year} (${found.author})`);
                }} 
                style={selectStyle}
              >
                <option value="">Баспаны таңдаңыз...</option>
                {Array.isArray(dbTextbooks) && dbTextbooks.length > 0 ? (
                  dbTextbooks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.publisher}, {t.year} ({t.author}) {t.part ? `| Бөлім ${t.part}` : ''} {t.language ? `[${t.language.toUpperCase()}]` : ''}
                    </option>
                  ))
                ) : (
                  currentPublishers.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))
                )}
                <option value="Басқа">Басқа...</option>
              </select>
            </div>
          )}

          {docType === "КСП" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 2" }}>
              <label style={labelStyle}>{t("gen_label_theme")}</label>
              {Array.isArray(dbTopics) && dbTopics.length > 0 ? (
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Сабақ тақырыбын таңдаңыз...</option>
                  {dbTopics.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Сабақ тақырыбын жазыңыз (мысалы: Тіктөртбұрыш ауданы)"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  style={inputStyle}
                />
              )}
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
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 14,
  padding: "14px 18px",
  color: "var(--text-main)",
  fontSize: 15,
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
};

const selectStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 14,
  padding: "14px 18px",
  fontSize: 15,
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
  cursor: "pointer",
  color: "var(--text-main)",
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
