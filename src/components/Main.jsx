import { useState, useEffect, useRef } from "preact/hooks";
import lottie from "lottie-web";
import animationData from "../assets/lottie4.json";

function LottieAnimation({ loop = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop,
      autoplay: true,
      animationData,
    });
    return () => anim.destroy();
  }, [loop]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "300px",
        maxWidth: 500,
        margin: "90px auto 0 auto",
      }}
    />
  );
}

export default function Main() {
  const fullText = "Access Paper";
  const [displayedText, setDisplayedText] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [mode, setMode] = useState("input");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    setDisplayedText(fullText);
    setFadeIn(true);
  }, []);

  const handleSearch = async () => {
    const doi = searchQuery.trim();
    if (!doi) {
      alert("Please enter a DOI.");
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const response = await fetch("https://accesspaper-backend.fly.dev/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doi }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

      const data = await response.json();

      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs);
      } else {
        setLogs((prev) => [...prev, "No detailed logs returned from backend."]);
      }

      setResults(data);
      setMode("results");
    } catch (error) {
      alert(`Search failed: ${error.message}`);
      setLogs((prev) => [...prev, `Error: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setMode("input");
    setSearchQuery("");
    setResults(null);
    setLogs([]);
  };

  return (
    <main
      id="main-container"
      role="main"
      aria-label="Access Paper Search"
      style={{
        position: "relative",
        zIndex: 2, 
        maxWidth: "650px",
        margin: mode === "results" ? "40px auto" : "80px auto",
        padding: "0 20px 50px 20px",
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        color: "#1a1a1a",
      }}
    >
      {mode === "input" && (
        <>
          <div
            style={{
              height: "180px",
              marginBottom: "20px",
              opacity: fadeIn ? 1 : 0,
              transition: "opacity 1s ease",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LottieAnimation loop={true} />
          </div>

          <h1
            id="fadein-title"
            aria-live="polite"
            aria-atomic="true"
            style={{
              fontWeight: 800,
              color: "#0a66c2",
              fontSize: "3.5rem",
              textAlign: "center",
              marginBottom: "16px",
              letterSpacing: "-0.5px",
              opacity: fadeIn ? 1 : 0,
              transition: "opacity 1.8s ease",
            }}
          >
            {displayedText}
          </h1>

          <p
            id="tagline"
            style={{
              fontSize: "1.2rem",
              color: "#4b4b4bff",
              marginBottom: 36,
              textAlign: "center",
              maxWidth: "500px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            Discover research effortlessly. Instant access to papers with one DOI.
          </p>

          <div
            id="search-bar"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 0,
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
            }}
          >
            <input
              type="text"
              placeholder="Enter DOI (e.g., 10.1038/s41586-020-2649-2)"
              value={searchQuery}
              onInput={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              aria-label="DOI input"
              disabled={loading}
              spellCheck="false"
              autoComplete="off"
              style={{
                flex: 1,
                padding: "14px 18px",
                fontSize: "1rem",
                border: "1px solid #ccc",
                borderRight: "none",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.border = "1.7px solid #0a66c2")}
              onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              aria-label="Search button"
              type="button"
              style={{
                padding: "14px 24px",
                fontSize: "1rem",
                backgroundColor: "#0a66c2",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.25s ease",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = "#084a9c";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#0a66c2";
              }}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {showLogs && logs.length > 0 && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                background: "#1e1e1e",
                color: "#d1d1d1",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontFamily: "monospace",
                maxHeight: "150px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          )}
        </>
      )}

      {mode === "results" && results && typeof results === "object" && (
        <section
          id="paper-info"
          style={{
            marginTop: 0,
            padding: "24px 28px",
            borderRadius: 10,
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            animation: "fadeIn 0.4s ease",
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              color: "#0a66c2",
              marginBottom: 20,
              fontSize: "1.8rem",
              textAlign: "center",
            }}
          >
            Paper Details
          </h2>

          {results.metadata?.title && (
            <p style={{ fontSize: "1.05rem", marginBottom: 12 }}>
              <strong>Title:</strong> {results.metadata.title}
            </p>
          )}
          {results.metadata?.journal && (
            <p style={{ fontSize: "1.05rem", marginBottom: 12 }}>
              <strong>Journal:</strong> {results.metadata.journal}
            </p>
          )}
          {results.metadata?.year && (
            <p style={{ fontSize: "1.05rem", marginBottom: 12 }}>
              <strong>Year:</strong> {results.metadata.year}
            </p>
          )}
          {results.metadata?.corresponding_email && (
            <p style={{ fontSize: "1.05rem", marginBottom: 12 }}>
              <strong>Corresponding Email:</strong>{" "}
              {results.metadata.corresponding_email}
            </p>
          )}

          {results.pdf_link && (
            <p style={{ marginTop: 20 }}>
              <a
                href={results.pdf_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "12px 20px",
                  backgroundColor: "#0a66c2",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: 6,
                  textDecoration: "none",
                  transition: "background-color 0.25s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#084a9c")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#0a66c2")
                }
              >
                Download PDF
              </a>
            </p>
          )}

          {results.source && (
            <p style={{ marginTop: 16, fontStyle: "italic", color: "#666" }}>
              Source: {results.source}
            </p>
          )}

          {results.message && (
            <p style={{ marginTop: 12, fontStyle: "italic", color: "#666" }}>
              {results.message}
            </p>
          )}

          <button
            onClick={handleBack}
            type="button"
            style={{
              marginTop: 32,
              width: "100%",
              padding: "14px",
              backgroundColor: "#f2f2f2",
              color: "#0a66c2",
              fontWeight: 600,
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: 6,
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#e9e9e9";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#f2f2f2";
            }}
          >
            ← Back to Search
          </button>
        </section>
      )}

      <style>
        {`
        /* Responsiveness */
        @media (max-width: 700px) {
          #fadein-title { font-size: 2.5rem !important; }
          #tagline { font-size: 1rem !important; }
          #search-bar input { font-size: 0.9rem !important; padding: 12px 14px !important; }
          #search-bar button { font-size: 0.9rem !important; padding: 12px 18px !important; }
          #paper-info h2 { font-size: 1.5rem !important; }
          #paper-info p { font-size: 0.95rem !important; }
        }
        @media (max-width: 480px) {
          #fadein-title { font-size: 2rem !important; }
          #tagline { font-size: 0.9rem !important; }
          #search-bar { flex-direction: column; }
          #search-bar input { width: 100%; border-right: 1px solid #ccc; margin-bottom: 8px; }
          #search-bar button { width: 100%; }
          #paper-info { padding: 16px 20px !important; }
        }
        `}
      </style>
    </main>
  );
}
