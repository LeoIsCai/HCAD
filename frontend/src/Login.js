import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API}/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      onLogin(data.user);
      navigate("/dashboard");
    } else {
      alert(data.message);
    }
  };

  return (
    <>
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      /><br />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      /><br />
      <button type="submit">Login</button>
    </form>
    <p style={{ marginTop: "1rem" }}>
      Noch keinen Account?{" "}
      <Link to="/register" style={{ color: "blue", textDecoration: "underline" }}>
        Hier einen Account erstellen
      </Link>
      .
    </p>
    </>
  );
}

export default Login;