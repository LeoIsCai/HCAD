function Dashboard({ user, onLogout }) {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to your Dashboard, {user}!</h1>
      <p>You are now logged in.</p>
      <button onClick={onLogout} style={{ marginTop: "1rem" }}>
        Log Out
      </button>
    </div>
  );
}

export default Dashboard;