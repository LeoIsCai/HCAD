import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Account erstellt! Du kannst dich jetzt einloggen.");
        navigate("/"); 
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Fehler beim Registrieren:", err);
      alert("Registrierung fehlgeschlagen – bitte Konsole prüfen.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Registrieren</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Username:</label><br />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="z.B. leo"
            required
          />
        </div>
        <br />
        <div>
          <label>Passwort:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            required
          />
        </div>
        <br />
        <button type="submit">Account erstellen</button>
      </form>
      <p>
        Bereits registriert?{" "}
        <button 
          onClick={() => navigate("/")} 
          style={{ color: "blue", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
        >
          Hier einloggen
        </button>.
      </p>
    </div>
  );
}

export default Register;
   