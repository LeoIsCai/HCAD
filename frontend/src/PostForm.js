import React, { useState } from 'react';
import './post_form.css';

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
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anliegen, adresse, telefon, name, datumzeit, beschreibung }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      const { id } = await res.json();
      const newReq = {
        id, username: user, anliegen, adresse, telefon, name, datumzeit, beschreibung,
        timestamp: new Date().toISOString(), answers: []
      };
      setRequests([newReq, ...requests]);
      setAnliegen('');
      setAdresse('');
      setTelefon('');
      setName('');
      setDatumzeit('');
      setBeschreibung('');
      onSubmit();
    } catch (err) {
      console.error(err);
      alert('Anfrage konnte nicht erstellt werden: ' + err.message);
    }
  };

  return (
    <form className="postform-form" onSubmit={handleSubmitRequest}>
      <label className="postform-label">Anliegen</label>
      <input
        type="text"
        className="postform-input"
        value={anliegen}
        onChange={e => setAnliegen(e.target.value)}
        placeholder="Einkaufshilfe"
        required
      />

      <label className="postform-label">Adresse</label>
      <input
        type="text"
        className="postform-input"
        value={adresse}
        onChange={e => setAdresse(e.target.value)}
        placeholder="Straße, Hausnummer, PLZ, Ort"
        required
      />

      <label className="postform-label">Telefonnummer</label>
      <input
        type="tel"
        className="postform-input"
        value={telefon}
        onChange={e => setTelefon(e.target.value)}
        placeholder="0123456789"
        required
      />

      <label className="postform-label">Name</label>
      <input
        type="text"
        className="postform-input"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Vor- und Nachname"
        required
      />

      <label className="postform-label">Datum/Zeit</label>
      <input
        type="datetime-local"
        className="postform-input"
        value={datumzeit}
        onChange={e => setDatumzeit(e.target.value)}
        required
      />

      <label className="postform-label">Beschreibung</label>
      <textarea
        className="postform-textarea"
        value={beschreibung}
        onChange={e => setBeschreibung(e.target.value)}
        rows={3}
        required
      />

      <button type="submit" className="postform-submit">
        Anfrage absenden
      </button>
    </form>
  );
}

export default PostForm;