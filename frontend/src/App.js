import { useState } from "react";
import Login from "./Login";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./Dashboard";
import Register from "./Register";

function App() {
  const [user, setUser] = useState(null);
  const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

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
      </Routes>
    </Router>
  );
}

export default App;