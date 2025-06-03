// frontend/src/Account.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Account({ user, onLogout }) {
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/user`, {
          method: "GET",
          credentials: "include",
        });
        if (res.status === 401) {
          navigate("/");
          return;
        }
        const data = await res.json();
        if (data.email) setEmail(data.email);
        if (data.fullname) setFullname(data.fullname);
        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden des Profils:", err);
        alert("Konnte Profil nicht laden.");
      }
    };
    fetchProfile();
  }, [API, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {};
      if (email) payload.email = email;
      if (fullname) payload.fullname = fullname;
      if (password) payload.password = password;

      const res = await fetch(`${API}/user`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      const data = await res.json();
      alert(data.message); 

      if (password) {
        onLogout();
        navigate("/"); 
      }
    } catch (err) {
      console.error("Fehler beim Speichern des Profils:", err);
      alert("Profil konnte nicht gespeichert werden: " + err.message);
    }
  };

  if (loading) return <p>Lade Profil…</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Mein Account</h2>
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Vollständiger Name:</label><br />
          <input
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Max Mustermann"
          />
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Passwort ändern:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Neues Passwort (leer lassen, wenn nicht ändern)"
          />
        </div>
        <button type="submit" style={{ marginRight: "1rem" }}>
          Speichern
        </button>
        <button
          type="button"
          onClick={() => {
            onLogout();
            navigate("/");
          }}
        >
          Abmelden
        </button>
      </form>
    </div>
  );
}

export default Account;
