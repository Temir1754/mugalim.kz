"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export default function SellerDashboard() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [myMaterials, setMyMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    type: "КТП",
    subject: "",
    classNumber: "",
    price: "2500",
    description: ""
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      fetchMyMaterials(parsed.id);
    }
  }, []);

  const fetchMyMaterials = async (userId: string) => {
    try {
      const res = await fetch("/api/materials");
      const all = await res.json();
      setMyMaterials(Array.isArray(all) ? all.filter((m: any) => m.authorId === userId) : []);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) {
      alert("Файлды таңдаңыз немесе жүйеге қайта кіріңіз");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting upload for file:", file.name);
      // 1. Upload to Supabase Storage
      // Sanitize filename: keep only letters, numbers, dots and underscores
      const sanitizedName = file.name
        .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII (Cyrillic etc)
        .replace(/[\s\(\)]/g, "_")    // Replace spaces and parentheses with underscores
        .replace(/_{2,}/g, "_");      // Remove double underscores

      const fileName = `${Date.now()}_${sanitizedName || "document"}`;
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('materials')
        .upload(`uploads/${user.id}/${fileName}`, file);

      if (storageError) {
        console.error("Supabase Storage Error:", storageError);
        throw new Error(`Storage Error: ${storageError.message}`);
      }

      console.log("File uploaded successfully to storage:", storageData.path);

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('materials')
        .getPublicUrl(storageData.path);

      console.log("Generated public URL:", publicUrl);

      // 3. Save to DB via our API
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fileUrl: publicUrl,
          authorId: user.id
        })
      });

      const dbResponse = await res.json();
      if (!res.ok) {
        console.error("DB Save Error:", dbResponse);
        throw new Error(dbResponse.error || "Database saving failed");
      }

      console.log("Material saved to DB:", dbResponse.material);

      alert("Материал сәтті жүктелді! Модерациядан кейін жарияланады.");
      setShowUploadModal(false);
      fetchMyMaterials(user.id);
      
      setFile(null);
      setFormData({ type: "КТП", subject: "", classNumber: "", price: "2500", description: "" });

    } catch (err: any) {
      alert("Қате орын алды: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-container" style={{ maxWidth: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <main className="content" style={{ padding: "40px 0", flex: 1 }}>
        <div className="inner-container">
          <div className="title-row">
            <h1>Басқару панелі</h1>
          </div>
          <p className="subtitle">Сәлеметсіз бе, {user?.fio || "Автор"}!</p>

          <div className="grid-form" style={{ marginBottom: "40px" }}>
            <div className="form-card" style={{ padding: "30px", background: "linear-gradient(135deg, #0A66F0, #0645A6)", color: "white", gridColumn: "span 2" }}>
              <h3 style={{ margin: "0 0 10px 0", opacity: 0.9, fontSize: "1rem", fontWeight: "normal" }}>СІЗДІҢ ТАБЫСЫҢЫЗ</h3>
              <div style={{ fontSize: "3rem", fontWeight: "800" }}>{user?.balance || 0} ₸</div>
              <p style={{ margin: "10px 0 0 0", opacity: 0.8, fontSize: "0.9rem" }}>Қаражат Kaspi арқылы шығаруға қолжетімді</p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}>
               <button className="generate-btn" style={{ background: "#34C759", border: "none" }} onClick={() => setShowUploadModal(!showUploadModal)}>
                 {showUploadModal ? "Жабу" : "+ Жаңа материал жүктеу"}
               </button>
            </div>
          </div>

          {showUploadModal && (
            <div className="form-card" style={{ padding: "30px", marginBottom: "40px", border: "2px dashed #0A66F0", background: "rgba(10, 102, 240, 0.05)" }}>
                <h2 style={{ marginBottom: "20px" }}>Жаңа материалды толтыру</h2>
                <div className="grid-form">
                    <div className="input-group">
                        <span className="label">Файл түрі</span>
                        <select className="input" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                            <option value="КТП">КТП</option>
                            <option value="КСП">КСП</option>
                            <option value="ПРЕЗЕНТАЦИЯ">Презентация</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <span className="label">Пән</span>
                        <input className="input" placeholder="Мысалы: Физика" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <span className="label">Сынып</span>
                        <input className="input" placeholder="7 сынып" value={formData.classNumber} onChange={(e) => setFormData({...formData, classNumber: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <span className="label">Бағасы (₸)</span>
                        <input className="input" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                    </div>
                </div>
                
                <div className="input-group" style={{ marginTop: "20px" }}>
                    <span className="label">Файлды таңдаңыз</span>
                    <input type="file" className="input" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                </div>

                <button className="generate-btn" style={{ background: "#0A66F0", marginTop: "20px" }} onClick={handleUpload} disabled={isLoading}>
                    {isLoading ? "Жүктелуде..." : "Маркетке жіберу"}
                </button>
            </div>
          )}

          <h3 style={{ marginBottom: "20px" }}>Менің жүктелген материалдарым ({myMaterials.length})</h3>
          <div className="grid-catalog">
            {myMaterials.map((item, idx) => (
              <div key={idx} className="form-card" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "1.1rem" }}>{item.type} {item.subject} ({item.classNumber})</strong>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "5px" }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <span style={{ 
                    padding: "6px 12px", 
                    borderRadius: "20px", 
                    fontSize: "0.75rem", 
                    fontWeight: "bold",
                    background: item.status === "PENDING" ? "#FFF3CD" : "#D4EDDA",
                    color: item.status === "PENDING" ? "#856404" : "#155724"
                  }}>
                    {item.status === "PENDING" ? "Тексеруде" : "Мақұлданды"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
