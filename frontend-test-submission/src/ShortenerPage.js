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
        validity: 30, // days
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
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2>URL Shortener</h2>

      <input
        type="text"
        value={originalUrl}
        placeholder="Enter original URL"
        onChange={(e) => setOriginalUrl(e.target.value)}
        style={{ width: "100%", padding: "10px", margin: "8px 0" }}
      />

      <input
        type="text"
        value={shortcode}
        placeholder="Enter custom shortcode"
        onChange={(e) => setShortcode(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
      />

      <button
        onClick={handleShorten}
        disabled={loading}
        style={{ padding: "10px 20px" }}
      >
        {loading ? "Shortening..." : "Create Short URL"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr />

      <h3>Shortened URLs:</h3>
      <ul>
        {shortUrls.map((item, index) => (
          <li key={index}>
            <strong>Original:</strong>{" "}
            <a href={item.originalUrl} target="_blank" rel="noreferrer">
              {item.originalUrl}
            </a>
            <br />
            <strong>Short:</strong>{" "}
            <a href={item.shortUrl} target="_blank" rel="noreferrer">
              {item.shortUrl}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShortenerPage;
