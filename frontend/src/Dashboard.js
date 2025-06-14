// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import PostForm from './PostForm';

export default function Dashboard({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [answerTexts, setAnswerTexts] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [expandedMy, setExpandedMy] = useState({});
  const [expandedAll, setExpandedAll] = useState({});
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/requests`, { credentials: 'include' });
        if (res.status === 401) return navigate('/');
        setRequests(await res.json());
      } catch {
        alert('Fehler beim Laden der Anfragen.');
      } finally {
        setLoadingReqs(false);
      }
    })();
  }, [API, navigate]);

  // Delete a request
  const handleDeleteRequest = async id => {
    if (!window.confirm('Möchtest du diese Anfrage wirklich löschen?')) return;
    try {
      const res = await fetch(`${API}/requests/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error();
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch {
      alert('Löschen fehlgeschlagen.');
    }
  };

  const myRequests = requests.filter(r => r.username === user);
  const toggleMy = id => setExpandedMy(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleAll = id => setExpandedAll(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSubmitAnswer = async id => {
    const content = (answerTexts[id] || '').trim();
    if (!content) return alert('Antwort darf nicht leer sein.');
    try {
      const res = await fetch(`${API}/requests/${id}/answers`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error();
      setRequests(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, answers: [{ username: user, content, timestamp: new Date().toISOString() }, ...r.answers] }
            : r
        )
      );
      setAnswerTexts(prev => ({ ...prev, [id]: '' }));
    } catch {
      alert('Antwort konnte nicht erstellt werden.');
    }
  };

  // Styles
  const container = { minHeight: '100vh', background: '#f5f5f5', paddingTop: '80px' };
  const topBar = { position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 100 };
  const navBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '8px 12px' };
  const section = { maxWidth: '800px', margin: '20px auto', background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' };
  const card = { marginBottom: '15px' };
  const btnPrimary = { background: '#1f93ff', color: '#fff', padding: '10px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' };
  const btnToggle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' };

  const renderRequest = (req, expanded, toggleFn, showDelete) => (
    <div key={req.id} style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{req.anliegen}</h3>
        <button onClick={() => toggleFn(req.id)} style={btnToggle}>
          {expanded[req.id] ? '▼' : '▶'}
        </button>
      </div>
      {expanded[req.id] && (
        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '4px', position: 'relative' }}>
          <p><strong>Von:</strong> {req.name}</p>
          <p><strong>Telefon:</strong> {req.telefon}</p>
          <p><strong>Adresse:</strong> {req.adresse}</p>
          <p style={{ marginTop: '10px' }}>{req.beschreibung}</p>
          <p style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>Erfasst am {new Date(req.timestamp).toLocaleString()}</p>
          <div style={{ marginTop: '12px' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Antworten:</h4>
            {req.answers.length ? req.answers.map((ans, i) => (
              <div key={i} style={{ background: '#f9f9f9', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px' }}><strong>{ans.username}</strong> <span style={{ fontSize: '12px', color: '#888' }}>{new Date(ans.timestamp).toLocaleString()}</span></p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{ans.content}</p>
              </div>
            )) : <p style={{ fontSize: '14px', color: '#666' }}>Keine Antworten.</p>}
            <textarea
              value={answerTexts[req.id] || ''}
              onChange={e => setAnswerTexts(prev => ({ ...prev, [req.id]: e.target.value }))}
              placeholder="Deine Antwort…"
              rows={2}
              style={{ width: '100%', padding: '8px', marginTop: '6px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            <button onClick={() => handleSubmitAnswer(req.id)} style={{ ...btnPrimary, marginTop: '6px' }}>Absenden</button>
          </div>
          {showDelete && (
            <button
              onClick={() => handleDeleteRequest(req.id)}
              style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'red', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Löschen
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={container}>
      <div style={topBar}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Dein Dashboard</h1>
        <div>
          <button onClick={() => navigate('/account')} style={navBtn}>Mein Account</button>
          <button onClick={onLogout} style={{ ...navBtn, color: 'red' }}>Logout</button>
        </div>
      </div>

      <section style={section}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 600 }}>Deine Übersichten</h2>
        {loadingReqs ? <p>Lade deine Anfragen…</p> : (myRequests.length ? myRequests.map(req => renderRequest(req, expandedMy, toggleMy, true)) : <p style={{ color: '#666' }}>Keine offenen Anfragen.</p>)}
      </section>

      <section style={{ ...section, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Neue Hilfe-Anfrage</h2>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>Anfrage erstellen</button>
      </section>

      <section style={section}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 600 }}>Offene Anfragen</h2>
        {loadingReqs ? <p>Anfragen laden…</p> : (requests.length ? requests.map(req => renderRequest(req, expandedAll, toggleAll, false)) : <p style={{ color: '#666' }}>Keine Anfragen vorhanden.</p>)}
      </section>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <PostForm onSubmit={() => setShowModal(false)} setRequests={setRequests} requests={requests} user={user} />
        </Modal>
      )}
    </div>
  );
}
