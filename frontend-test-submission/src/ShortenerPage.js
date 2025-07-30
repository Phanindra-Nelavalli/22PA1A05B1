import React, { useState } from "react";
import axios from "axios";

function ShortenerPage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortcode, setShortcode] = useState("");
  const [shortUrls, setShortUrls] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShorten = async () => {
    if (!originalUrl || !shortcode) {
      setError("Both URL and shortcode are required");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/shorten", {
        url: originalUrl,
        shortcode: shortcode,
        validity: 30,
      });

      const shortUrl = `http://localhost:5000/api/${shortcode}`;
      setShortUrls((prev) => [...prev, { originalUrl, shortUrl }]);
      setOriginalUrl("");
      setShortcode("");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔗 URL Shortener</h2>

        <input
          type="text"
          value={originalUrl}
          placeholder="Enter original URL"
          onChange={(e) => setOriginalUrl(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          value={shortcode}
          placeholder="Enter custom shortcode"
          onChange={(e) => setShortcode(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={handleShorten}
          disabled={loading}
          style={{
            ...styles.button,
            backgroundColor: loading ? "#ccc" : "#4f46e5",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Shortening..." : "Create Short URL"}
        </button>

        {error && <p style={styles.error}>{error}</p>}
      </div>

      {shortUrls.length > 0 && (
        <div style={styles.resultsContainer}>
          <h3 style={{ marginBottom: "1rem" }}>📄 Shortened URLs</h3>
          {shortUrls.map((item, index) => (
            <div key={index} style={styles.resultCard}>
              <p>
                <strong>Original:</strong>{" "}
                <a href={item.originalUrl} target="_blank" rel="noreferrer">
                  {item.originalUrl}
                </a>
              </p>
              <p>
                <strong>Short:</strong>{" "}
                <a href={item.shortUrl} target="_blank" rel="noreferrer">
                  {item.shortUrl}
                </a>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "720px",
    margin: "auto",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#f9fafb",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "1.2rem",
    color: "#1f2937",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "1rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "1rem",
  },
  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "bold",
    transition: "background 0.3s ease",
  },
  error: {
    color: "red",
    marginTop: "1rem",
  },
  resultsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  resultCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
};

export default ShortenerPage;
