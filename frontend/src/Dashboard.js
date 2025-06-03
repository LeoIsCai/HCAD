import { Link } from "react-router-dom";
import Board from "./Board";
import { useState, useEffect } from "react";

function Dashboard({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);

  const [anliegen, setAnliegen]         = useState("");
  const [adresse, setAdresse]           = useState("");
  const [telefon, setTelefon]           = useState("");
  const [name, setName]                 = useState("");
  const [datumzeit, setDatumzeit]       = useState("");
  const [beschreibung, setBeschreibung] = useState("");

  const [answerTexts, setAnswerTexts] = useState({});

  const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${API}/requests`, {
          method: "GET",
          credentials: "include",
        });
        if (res.status === 401) {
          window.location.href = "/";
          return;
        }
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error("Fehler beim Laden der Anfragen:", err);
        alert("Anfragen konnten nicht geladen werden.");
      } finally {
        setLoadingReqs(false);
      }
    };
    fetchRequests();
  }, [API]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!(anliegen && adresse && telefon && name && datumzeit && beschreibung)) {
      alert("Bitte fülle alle Felder aus.");
      return;
    }
    try {
      const payload = { anliegen, adresse, telefon, name, datumzeit, beschreibung };
      const res = await fetch(`${API}/requests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      const result = await res.json(); // enthält { message, id }

      // Optimistische Aktualisierung: neuen Request-Objekt zusammenbasteln
      const newReq = {
        id: result.id,
        username: user,
        anliegen,
        adresse,
        telefon,
        name,
        datumzeit,
        beschreibung,
        timestamp: new Date().toISOString(),
        answers: []  // noch leer
      };
      setRequests([newReq, ...requests]);

      // Formular zurücksetzen
      setAnliegen("");
      setAdresse("");
      setTelefon("");
      setName("");
      setDatumzeit("");
      setBeschreibung("");
    } catch (err) {
      console.error("Fehler beim Erstellen der Anfrage:", err);
      alert("Anfrage konnte nicht erstellt werden: " + err.message);
    }
  };

  const handleSubmitAnswer = async (reqId) => {
    const content = answerTexts[reqId] ? answerTexts[reqId].trim() : "";
    if (!content) {
      alert("Antwort darf nicht leer sein.");
      return;
    }
    try {
      const res = await fetch(`${API}/requests/${reqId}/answers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      // Optimistische Aktualisierung: Antwort in das passende requests-Objekt "hineinpushen"
      const updatedRequests = requests.map((req) => {
        if (req.id === reqId) {
          const newAnswer = {
            username: user,
            content,
            timestamp: new Date().toISOString(),
          };
          return {
            ...req,
            answers: [newAnswer, ...req.answers] // neue Antwort vorne anhängen
          };
        }
        return req;
      });
      setRequests(updatedRequests);

      // Antwort‐Textfeld leeren
      setAnswerTexts((prev) => ({
        ...prev,
        [reqId]: "",
      }));
    } catch (err) {
      console.error("Fehler beim Erstellen der Antwort:", err);
      alert("Antwort konnte nicht erstellt werden: " + err.message);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Willkommen, {user}!</h1>

      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/dashboard" style={{ marginRight: "1rem" }}>
          Dashboard
        </Link>
        <Link to="/account" style={{ marginRight: "1rem" }}>
          Mein Account
        </Link>
        <button onClick={onLogout}>Log Out</button>
      </nav>

      {/* -------------------- A: Dein Dashboard‐Inhalt -------------------- */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>Deine Übersichten</h2>
        <p>…Hier stehen deine Dashboard‐Inhalte…</p>
      </div>

      {/* -------------------- B: Hilfe‐Anfrage erstellen  -------------------- */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>Hilfe‐Anfrage erstellen</h2>
        <form onSubmit={handleSubmitRequest} style={{ marginBottom: "1rem" }}>
          {/* Anliegen */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Anliegen:</label><br />
            <input
              type="text"
              value={anliegen}
              onChange={(e) => setAnliegen(e.target.value)}
              placeholder="z.B. Einkaufshilfe"
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Adresse */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Adresse:</label><br />
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Straße, Hausnummer, PLZ, Ort"
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Telefonnummer */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Telefonnummer:</label><br />
            <input
              type="tel"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              placeholder="z.B. 0123456789"
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Name */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Name:</label><br />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vor- und Nachname"
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Datum/Zeit */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Datum/Zeit:</label><br />
            <input
              type="datetime-local"
              value={datumzeit}
              onChange={(e) => setDatumzeit(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Beschreibung */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Beschreibung:</label><br />
            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Bitte genauer beschreiben, worum es geht…"
              rows={3}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <button type="submit" style={{ marginTop: "0.5rem" }}>
            Anfrage absenden
          </button>
        </form>
      </div>

      {/* -------------------- C: Liste aller Anfragen (inkl. Antworten/Formulare) -------------------- */}
      <div>
        <h2>Offene Anfragen</h2>
        {loadingReqs ? (
          <p>Anfragen laden…</p>
        ) : requests.length === 0 ? (
          <p>Keine Anfragen vorhanden.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {requests.map((req) => (
              <li
                key={req.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "0.75rem",
                  marginBottom: "1rem",
                  borderRadius: "6px",
                }}
              >
                {/* — Haupt‐Daten der Anfrage — */}
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>{req.anliegen}</strong>{" "}
                  <span style={{ color: "#888", fontSize: "0.9rem" }}>
                    ({new Date(req.datumzeit).toLocaleString()})
                  </span>
                  <p style={{ margin: "0.5rem 0" }}>
                    <em>Von:</em> {req.name} &bull;{" "}
                    <em>Tel.:</em> {req.telefon} <br />
                    <em>Adresse:</em> {req.adresse}
                  </p>
                  <p>{req.beschreibung}</p>
                  <p style={{ color: "#aaa", fontSize: "0.8rem" }}>
                    Erfasst: {new Date(req.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* — Bereits vorhandene Antworten unter dieser Anfrage — */}
                <div style={{ marginTop: "0.75rem", paddingLeft: "1rem" }}>
                  <h3 style={{ marginBottom: "0.5rem" }}>Antworten</h3>
                  {req.answers.length === 0 ? (
                    <p style={{ color: "#666" }}>Keine Antworten bisher.</p>
                  ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {req.answers.map((ans, idx) => (
                        <li
                          key={idx}
                          style={{
                            border: "1px solid #ddd",
                            background: "#fafafa",
                            padding: "0.5rem",
                            marginBottom: "0.5rem",
                            borderRadius: "4px",
                          }}
                        >
                          <strong>{ans.username}</strong>{" "}
                          <span style={{ color: "#888", fontSize: "0.8rem" }}>
                            {new Date(ans.timestamp).toLocaleString()}
                          </span>
                          <p style={{ margin: "0.5rem 0 0 0" }}>{ans.content}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* — Formular für neue Antwort unter dieser Anfrage — */}
                <div style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
                  <textarea
                    value={answerTexts[req.id] || ""}
                    onChange={(e) =>
                      setAnswerTexts((prev) => ({
                        ...prev,
                        [req.id]: e.target.value,
                      }))
                    }
                    placeholder="Hier deine Antwort schreiben…"
                    rows={2}
                    style={{ width: "100%", padding: "0.5rem" }}
                  />
                  <button
                    onClick={() => handleSubmitAnswer(req.id)}
                    style={{ marginTop: "0.25rem" }}
                  >
                    Antwort absenden
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;