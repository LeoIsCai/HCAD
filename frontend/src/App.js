import { useState } from "react";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <div className="App">
      {user ? (
        <>
          <h1>Welcome, {user}!</h1>
          <button onClick={handleLogout}>Log Out</button>
          {/* Your main app goes here */}
        </>
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
  );
}

export default App;
