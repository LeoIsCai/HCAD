import { useState, useEffect } from "react";
import Login from "./Login";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./Dashboard";
import Register from "./Register";
import Account from "./Account";
import Board from "./Board";

function App() {
  const [user, setUser] = useState(null);
  const API = process.env.REACT_APP_API_URL || "http://localhost:3000";

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${API}/check-login`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.logged_in) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Fehler beim Prüfen des Logins:", err);
      }
    };
    checkLogin();
  }, [API]);

  const handleLogout = async () => {
    await fetch(`${API}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        {/* ② Login-Route */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />
          }
        />

        {/* ③ Registrierungs-Route */}
        <Route 
          path="/register" 
          element={<Register />} 
        />

        {/* ④ Dashboard-Route */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/account"
          element={
            user ? (
              <Account user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
      
    </Router>
  );
}

export default App;