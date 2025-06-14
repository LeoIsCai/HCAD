import React, { useState } from 'react';

function PostForm({ onSubmit, setRequests, requests, user }) {
  const [anliegen, setAnliegen] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telefon, setTelefon] = useState('');
  const [name, setName] = useState('');
  const [datumzeit, setDatumzeit] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

  const handleSubmitRequest = async e => {
    e.preventDefault();
    if (!(anliegen && adresse && telefon && name && datumzeit && beschreibung)) {
      alert('Bitte fülle alle Felder aus.');
      return;
    }
    try {
      const res = await fetch(`${API}/requests`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anliegen, adresse, telefon, name, datumzeit, beschreibung }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      const { id } = await res.json();
      const newReq = { id, username: user, anliegen, adresse, telefon, name, datumzeit, beschreibung, timestamp: new Date().toISOString(), answers: [] };
      setRequests([newReq, ...requests]);
      setAnliegen(''); setAdresse(''); setTelefon(''); setName(''); setDatumzeit(''); setBeschreibung('');
      onSubmit();
    } catch (err) {
      console.error(err);
      alert('Anfrage konnte nicht erstellt werden: ' + err.message);
    }
  };

  const inputStyle = {
    width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box'
  };

  const labelStyle = { display: 'block', fontWeight: '500', marginTop: '12px' };

  return (
    <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>Anliegen</label>
      <input type="text" value={anliegen} onChange={e => setAnliegen(e.target.value)} placeholder="Einkaufshilfe" required style={inputStyle} />
      <label style={labelStyle}>Adresse</label>
      <input type="text" value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="Straße, Hausnummer, PLZ, Ort" required style={inputStyle} />
      <label style={labelStyle}>Telefonnummer</label>
      <input type="tel" value={telefon} onChange={e => setTelefon(e.target.value)} placeholder="0123456789" required style={inputStyle} />
      <label style={labelStyle}>Name</label>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Vor- und Nachname" required style={inputStyle} />
      <label style={labelStyle}>Datum/Zeit</label>
      <input type="datetime-local" value={datumzeit} onChange={e => setDatumzeit(e.target.value)} required style={inputStyle} />
      <label style={labelStyle}>Beschreibung</label>
      <textarea value={beschreibung} onChange={e => setBeschreibung(e.target.value)} rows={3} required style={{ ...inputStyle, resize:'vertical' }} />
      <button type="submit" style={{ marginTop: '20px', padding: '10px', background: '#1f93ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Anfrage absenden</button>
    </form>
  );
}

export default PostForm;

