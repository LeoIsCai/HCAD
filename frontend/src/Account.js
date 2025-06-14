import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Account({ user, onLogout }) {
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/user`, { method: 'GET', credentials: 'include' });
        if (res.status === 401) return navigate('/');
        const data = await res.json();
        if (data.email) setEmail(data.email);
        if (data.fullname) setFullname(data.fullname);
      } catch (err) {
        console.error('Fehler beim Laden des Profils:', err);
        alert('Konnte Profil nicht laden.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [API, navigate]);

  const handleSave = async e => {
    e.preventDefault();
    try {
      const payload = {};
      if (email) payload.email = email;
      if (fullname) payload.fullname = fullname;
      if (password) payload.password = password;

      const res = await fetch(`${API}/user`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      const result = await res.json();
      alert(result.message);
      if (password) {
        onLogout();
        navigate('/');
      }
    } catch (err) {
      console.error('Fehler beim Speichern des Profils:', err);
      alert('Profil konnte nicht gespeichert werden: ' + err.message);
    }
  };

  // Styles
  const containerStyle = { minHeight: '100vh', backgroundColor: '#f5f5f5', paddingTop: '80px', boxSizing: 'border-box' };
  const topBar = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 100
  };
  const navStyle = { display: 'flex', gap: '15px' };
  const navButton = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '8px 12px', borderRadius: '4px' };
  const sectionStyle = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' };
  const inputStyle = { width: '100%', padding: '10px', marginTop: '4px', marginBottom: '16px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
  const btnPrimary = { background: '#1f93ff', color: '#fff', padding: '10px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' };

  if (loading) return <p>Lade Profil…</p>;

  return (
    <div style={containerStyle}>
      <div style={topBar}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Mein Account</h1>
        <nav style={navStyle}>
          <button onClick={() => navigate('/dashboard')} style={navButton}>Dashboard</button>
          <button onClick={onLogout} style={{ ...navButton, color: 'red' }}>Logout</button>
        </nav>
      </div>

      <section style={sectionStyle}>
        <form onSubmit={handleSave}>
          <label>Email:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" style={inputStyle} />

          <label>Vollständiger Name:</label>
          <input value={fullname} onChange={e => setFullname(e.target.value)} placeholder="Max Mustermann" style={inputStyle} />

          <label>Passwort ändern:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Neues Passwort (leer lassen wenn nicht ändern)" style={inputStyle} />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" style={btnPrimary}>Speichern</button>
            <button type="button" onClick={() => { onLogout(); navigate('/'); }} style={{ ...navButton, color: 'red', fontSize: '16px' }}>Abmelden</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Account;
