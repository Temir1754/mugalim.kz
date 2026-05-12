"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { processTextbookPdf, addTextbook, getSubjects, updateTextbook, deleteTextbook, getTextbookTopicsRaw, saveTextbookTopicsRaw } from "./actions";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState("");
  const [error, setError] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [dbTextbooks, setDbTextbooks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("private");
  const [isProcessingPdf, setIsProcessingPdf] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (Array.isArray(data)) setRegisteredUsers(data);
    } catch (err) { console.error(err); }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materials?admin=true");
      const data = await res.json();
      if (Array.isArray(data)) setMaterials(data);
    } catch (err) { console.error(err); }
  };

  const fetchDbTextbooks = async () => {
    try {
      const res = await fetch("/api/generator/metadata?type=admin-textbooks");
      const data = await res.json();
      if (Array.isArray(data)) setDbTextbooks(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === "ADMIN") setIsAdmin(true);
    }
    fetchUsers();
    fetchMaterials();
    fetchDbTextbooks();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === "admin" && password === "Temir173173") {
      localStorage.setItem("user", JSON.stringify({ username: "admin", role: "ADMIN" }));
      setIsAdmin(true);
      window.location.reload();
    } else {
      setError("Қате логин немесе құпия сөз");
    }
  };

  const approveRequest = async (username: string) => {
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, action: "APPROVE" }),
    });
    fetchUsers();
  };

  const rejectRequest = async (username: string) => {
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, action: "REJECT" }),
    });
    fetchUsers();
  };

  const manageMaterial = async (id: string, action: string) => {
    await fetch("/api/admin/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    fetchMaterials();
  };

  const groups = useMemo(() => {
    const filtered = registeredUsers.filter(u => 
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.fio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery)
    );
    return {
      privateTeachers: filtered.filter(u => u.schoolType === "Жекеменшік" && u.role === "CLIENT"),
      privateAdmins: filtered.filter(u => u.schoolType === "Жекеменшік" && u.role === "SCHOOL_ADMIN"),
      stateTeachers: filtered.filter(u => u.schoolType === "Мемлекеттік" && u.role === "CLIENT"),
      stateAdmins: filtered.filter(u => u.schoolType === "Мемлекеттік" && u.role === "SCHOOL_ADMIN"),
      sellers: filtered.filter(u => u.role === "SELLER")
    };
  }, [registeredUsers, searchQuery]);

  if (!isAdmin) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h2>Админ Панель</h2>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Логин" value={login} onChange={(e) => setLogin(e.target.value)} />
            <input type="password" placeholder="Құпия сөз" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="error">{error}</p>}
            <button type="submit">Кіру</button>
          </form>
        </div>
        <style jsx>{`
          .login-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 20px; font-family: sans-serif; }
          .login-card { background: white; padding: 40px; border-radius: 32px; width: 100%; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); text-align: center; }
          h2 { font-weight: 900; margin-bottom: 30px; }
          input { width: 100%; padding: 16px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 15px; outline: none; }
          button { width: 100%; padding: 16px; background: #0f172a; color: white; border: none; border-radius: 16px; font-weight: 800; cursor: pointer; }
          .error { color: #f43f5e; font-size: 0.85rem; margin-bottom: 15px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">MUGALIM.KZ</div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'private' ? 'active' : ''}`} onClick={() => setActiveTab('private')}>Жекеменшік</button>
          <button className={`nav-item ${activeTab === 'state' ? 'active' : ''}`} onClick={() => setActiveTab('state')}>Мемлекеттік</button>
          <button className={`nav-item ${activeTab === 'sellers' ? 'active' : ''}`} onClick={() => setActiveTab('sellers')}>Сатушылар</button>
          <button className={`nav-item ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>Материалдар</button>
          <button className={`nav-item ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>Кітапхана (RAG)</button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => { localStorage.removeItem("user"); window.location.reload(); }}>Шығу</button>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <h1>
            {activeTab === 'private' ? 'Жекеменшік мектептер' : 
             activeTab === 'state' ? 'Мемлекеттік мектептер' : 
             activeTab === 'sellers' ? 'Сатушылар' : 
             activeTab === 'library' ? 'Кітапхана' : 'Материалдар'}
          </h1>
          <div className="search-bar">
            <input type="text" placeholder="Іздеу..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </header>

        <main className="content">
          {activeTab === 'private' && (
            <>
              <SubSection title="Мұғалімдер" users={groups.privateTeachers} onApprove={approveRequest} onReject={rejectRequest} />
              <SubSection title="Оқу ісінің меңгерушісі" users={groups.privateAdmins} onApprove={approveRequest} onReject={rejectRequest} />
            </>
          )}
          {activeTab === 'state' && (
            <>
              <SubSection title="Мұғалімдер" users={groups.stateTeachers} onApprove={approveRequest} onReject={rejectRequest} />
              <SubSection title="Оқу ісінің меңгерушісі" users={groups.stateAdmins} onApprove={approveRequest} onReject={rejectRequest} />
            </>
          )}
          {activeTab === 'sellers' && <SellerTable users={groups.sellers} />}
          {activeTab === 'materials' && <MaterialsTable materials={materials} onAction={manageMaterial} />}
          {activeTab === 'library' && (
            <LibraryTable 
              textbooks={dbTextbooks} 
              onRefresh={fetchDbTextbooks}
              isProcessing={isProcessingPdf}
              setIsProcessing={setIsProcessingPdf}
            />
          )}
        </main>
      </div>

      <style jsx>{`
        .admin-layout { display: flex; min-height: 100vh; background: #fdfdfd; font-family: sans-serif; }
        .sidebar { width: 280px; background: white; border-right: 1px solid #f1f5f9; position: fixed; height: 100vh; display: flex; flex-direction: column; }
        .sidebar-brand { padding: 40px; font-weight: 900; letter-spacing: 2px; }
        .sidebar-nav { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; gap: 8px; }
        .nav-item { padding: 14px 20px; border-radius: 12px; border: none; background: transparent; text-align: left; font-weight: 700; color: #64748b; cursor: pointer; }
        .nav-item.active { background: #0f172a; color: white; }
        .main-content { flex-grow: 1; margin-left: 280px; }
        .header { background: white; padding: 30px 60px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50; }
        .search-bar input { padding: 12px 20px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; width: 300px; }
        .content { padding: 40px 60px; }
        .logout-btn { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #fee2e2; background: #fef2f2; color: #ef4444; font-weight: 700; cursor: pointer; }
      `}</style>
    </div>
  );
}

function MaterialsTable({ materials, onAction }: any) {
  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            <th>№</th><th>ТҮРІ</th><th>ПӘН</th><th>СЫНЫП</th><th>СТАТУС</th><th>ӘРЕКЕТ</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m: any, i: number) => (
            <tr key={m.id}>
              <td>{i + 1}</td>
              <td>{m.type}</td>
              <td>{m.subject}</td>
              <td>{m.classNumber}</td>
              <td>{m.status}</td>
              <td>
                <button onClick={() => onAction(m.id, 'APPROVE')}>OK</button>
                <button onClick={() => onAction(m.id, 'DELETE')}>Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{styles}</style>
    </div>
  );
}

function SubSection({ title, users, onApprove, onReject }: any) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h3 style={{ marginBottom: 20 }}>{title}</h3>
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>№</th><th>ФИО</th><th>ПӘН</th><th>НОМЕР</th><th>ӘРЕКЕТ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any, i: number) => (
              <tr key={u.username}>
                <td>{i + 1}</td>
                <td>{u.fio}</td>
                <td>{u.specialty}</td>
                <td>{u.phone}</td>
                <td>
                  <button onClick={() => onApprove(u.username)}>OK</button>
                  <button onClick={() => onReject(u.username)}>X</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx>{styles}</style>
    </div>
  );
}

function SellerTable({ users }: any) {
  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            <th>№</th><th>ФИО</th><th>НОМЕР</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any, i: number) => (
            <tr key={u.username}>
              <td>{i + 1}</td>
              <td>{u.fio}</td>
              <td>{u.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{styles}</style>
    </div>
  );
}

function LibraryTable({ textbooks, onRefresh, isProcessing, setIsProcessing }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [topicsModalId, setTopicsModalId] = useState<string | null>(null);
  const [topicsText, setTopicsText] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    subjectId: "",
    subjectName: "", // Добавляем имя предмета для редактирования
    newSubjectName: "",
    grade: 1,
    publisher: "",
    author: "",
    year: 2024,
    language: "kz"
  });

  useEffect(() => {
    getSubjects().then(setSubjects);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = editingId 
      ? await updateTextbook(editingId, formData)
      : await addTextbook(formData);
      
    if (res.success) {
      alert(editingId ? "Өзгерістер сақталды!" : "Кітап қосылды!");
      setIsAdding(false);
      setEditingId(null);
      onRefresh();
      getSubjects().then(setSubjects);
    } else {
      alert(`Қате: ${res.error}`);
    }
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setFormData({
      subjectId: t.subjectId,
      subjectName: t.subject?.name || "",
      newSubjectName: "",
      grade: t.grade,
      publisher: t.publisher,
      author: t.author,
      year: t.year,
      language: t.language || "kz"
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Бұл кітапты и оның барлық деректерін жоюды растайсыз ба?")) {
      const res = await deleteTextbook(id);
      if (res.success) {
        alert("Жойылды!");
        onRefresh();
      } else {
        alert(`Қате: ${res.error}`);
      }
    }
  };

  const handleUpload = async (textbookId: string, file: File) => {
    setIsProcessing(textbookId);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("textbookId", textbookId);

    try {
      const data = await processTextbookPdf(formData);
      if (data.success) { 
        alert(`Сәтті! ${data.message}`); 
        onRefresh(); 
      } else { 
        alert(`Қате: ${data.error}`); 
      }
    } catch (err: any) { 
      alert(`Байланыс қатесі: ${err.message || 'Белгісіз қате'}`); 
    } finally { setIsProcessing(null); }
  };

  const openTopicsModal = async (t: any) => {
    setTopicsModalId(t.id);
    setTopicsText("Жүктелуде...");
    const res = await getTextbookTopicsRaw(t.id);
    if (res.success) {
      setTopicsText(res.text || "");
    } else {
      setTopicsText("");
      alert(`Қате: ${res.error}`);
    }
  };

  const handleSaveTopics = async () => {
    if (!topicsModalId) return;
    const res = await saveTextbookTopicsRaw(topicsModalId, topicsText);
    if (res.success) {
      alert(`Сәтті сақталды! (${res.count} тақырып)`);
      setTopicsModalId(null);
      onRefresh();
    } else {
      alert(`Қате: ${res.error}`);
    }
  };

  return (
    <div className="library-container">
      <div className="library-header">
        <button className="add-book-btn" onClick={() => {
          setIsAdding(!isAdding);
          setEditingId(null);
          if (!isAdding) setFormData({ subjectId: "", subjectName: "", newSubjectName: "", grade: 1, publisher: "", author: "", year: 2024, language: "kz" });
        }}>
          {isAdding ? "Болдырмау" : "+ Жаңа кітап қосу"}
        </button>
      </div>

      {isAdding && (
        <form className="add-book-form" onSubmit={handleSubmit}>
          <h3>{editingId ? "Кітапты өңдеу" : "Жаңа кітап"}</h3>
          <div className="form-grid">
            {editingId ? (
              // При редактировании даем менять название текущего предмета
              <input 
                type="text" 
                placeholder="Пән атауы" 
                value={formData.subjectName} 
                onChange={e => setFormData({...formData, subjectName: e.target.value})}
                required 
              />
            ) : (
              // При добавлении - выбор из списка
              <select 
                value={formData.subjectId} 
                onChange={e => setFormData({...formData, subjectId: e.target.value})}
                required
              >
                <option value="">Пәнді таңдаңыз...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                <option value="new">+ Жаңа пән қосу</option>
              </select>
            )}
            
            {!editingId && formData.subjectId === "new" && (
              <input 
                type="text" 
                placeholder="Жаңа пән атауы" 
                required
                onChange={e => setFormData({...formData, newSubjectName: e.target.value})} 
              />
            )}

            <input type="number" placeholder="Сынып" value={Number.isNaN(formData.grade) ? "" : formData.grade} onChange={e => setFormData({...formData, grade: parseInt(e.target.value)})} required />
            <input type="text" placeholder="Баспа" value={formData.publisher} onChange={e => setFormData({...formData, publisher: e.target.value})} required />
            <input type="text" placeholder="Авторы" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} required />
            <input type="number" placeholder="Жылы" value={Number.isNaN(formData.year) ? "" : formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} required />
            <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} required>
              <option value="kz">Қазақша</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          <button type="submit" className="submit-btn">{editingId ? "Сақтау" : "Қосу"}</button>
        </form>
      )}

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>№</th><th>ПӘН</th><th>СЫНЫП</th><th>АВТОР</th><th>ТІЛІ</th><th>ЖИ ОҚЫТУ</th><th>ӘРЕКЕТ</th>
            </tr>
          </thead>
          <tbody>
            {textbooks.map((t: any, i: number) => (
              <tr key={t.id}>
                <td>{i + 1}</td>
                <td>{t.subject?.name}</td>
                <td>{t.grade}</td>
                <td>{t.author}</td>
                <td>{t.language === "ru" ? "Русский" : "Қазақша"}</td>
                <td>{t._count?.chunks > 0 ? "Дайын ✅" : "Оқытылмаған ⏳"}</td>
                <td className="actions-cell">
                  <button className="edit-btn" onClick={() => handleEdit(t)}>Өңдеу</button>
                  <button className="delete-btn" onClick={() => handleDelete(t.id)}>Жою</button>
                  <button className="upload-btn" onClick={() => openTopicsModal(t)}>Тақырыптар</button>
                  <label className="upload-btn">
                    {isProcessing === t.id ? "..." : "PDF жүктеу"}
                    <input type="file" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleUpload(t.id, e.target.files[0])} />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <style jsx>{styles}</style>
      </div>

      {topicsModalId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Тақырыптарды өңдеу (әр жолға бір тақырып)</h3>
            <textarea 
              value={topicsText} 
              onChange={e => setTopicsText(e.target.value)}
              placeholder="1-тақырып..."
              rows={15}
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setTopicsModalId(null)}>Болдырмау</button>
              <button className="submit-btn" onClick={handleSaveTopics}>Сақтау</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = `
  .table-wrapper { background: white; border-radius: 20px; border: 1px solid #f1f5f9; overflow: hidden; }
  .custom-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .custom-table th { background: #f8fafc; padding: 15px; text-align: left; color: #94a3b8; }
  .custom-table td { padding: 15px; border-bottom: 1px solid #f8fafc; }
  .upload-btn { background: #0f172a; color: white; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; }
  .actions-cell { display: flex; gap: 8px; align-items: center; }
  .edit-btn { background: #f1f5f9; color: #0f172a; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
  .delete-btn { background: #fee2e2; color: #ef4444; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
  .library-header { margin-bottom: 20px; display: flex; justify-content: flex-end; }
  .add-book-btn { background: #0f172a; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; }
  .add-book-form { background: white; padding: 30px; border-radius: 24px; border: 1px solid #f1f5f9; margin-bottom: 30px; }
  .add-book-form h3 { margin-bottom: 20px; font-weight: 800; }
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
  .form-grid input, .form-grid select { padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; }
  .submit-btn { background: #10b981; color: white; border: none; padding: 12px 30px; border-radius: 10px; font-weight: 700; cursor: pointer; }
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal-content { background: white; padding: 30px; border-radius: 20px; width: 600px; display: flex; flex-direction: column; gap: 20px; }
  .modal-content textarea { width: 100%; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; font-family: inherit; resize: vertical; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
  .cancel-btn { padding: 12px 24px; border-radius: 12px; border: 1px solid #e2e8f0; background: transparent; cursor: pointer; }
`;
