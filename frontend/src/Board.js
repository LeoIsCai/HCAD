// frontend/src/Board.js
import { useState, useEffect } from "react";

function Board() {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);

  const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API}/posts`, {
          method: "GET",
          credentials: "include",
        });
        if (res.status === 401) {
          
          window.location.href = "/";
          return;
        }
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Fehler beim Laden der Posts:", err);
        alert("Konnte Beiträge nicht laden.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) {
      alert("Beitrag darf nicht leer sein.");
      return;
    }
    try {
      const res = await fetch(`${API}/posts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      const newPost = {
        username: "Du",
        content: newContent,
        timestamp: new Date().toISOString(),
      };
      setPosts([newPost, ...posts]);
      setNewContent(""); // Eingabefeld leeren
    } catch (err) {
      console.error("Fehler beim Erstellen des Posts:", err);
      alert("Post konnte nicht erstellt werden: " + err.message);
    }
  };

  if (loading) return <p>Beiträge laden…</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Community-Board</h2>

      {/* Formular zum Erstellen eines neuen Beitrags */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Hier deinen Beitrag schreiben…"
          rows={3}
          style={{ width: "100%", padding: "0.5rem" }}
          required
        />
        <button type="submit" style={{ marginTop: "0.5rem" }}>
          Beitrag posten
        </button>
      </form>

      {/* Anzeige aller Posts */}
      {posts.length === 0 ? (
        <p>Keine Beiträge vorhanden.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {posts.map((post, index) => (
            <li
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "0.5rem",
                marginBottom: "0.5rem",
                borderRadius: "4px",
              }}
            >
              <strong>{post.username}</strong>{" "}
              <span style={{ color: "#888", fontSize: "0.9rem" }}>
                {new Date(post.timestamp).toLocaleString()}
              </span>
              <p style={{ marginTop: "0.5rem" }}>{post.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Board;
