import { useState, useEffect } from "preact/hooks";

const DEV_PASSWORD = import.meta.env.PUBLIC_DEV_PASSWORD || "";
const API_BASE = import.meta.env.PUBLIC_API_BASE || ""; 

export default function Menu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState({
    total_users: 0,
    total_visits: 0,
    papers_processed: 0,
    last_update: "-",
    unique_ips: [],
  });
  const [helpOpen, setHelpOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const convertToGeorgianTime = (utcString) => {
    try {
      if (!utcString || utcString === "-") return "-";
      const cleaned = utcString.replace(" UTC", "");
      const [datePart, timePart] = cleaned.split(", ");
      if (!datePart || !timePart) return utcString;
      const [day, monthStr, year] = datePart.split(" ");
      const [hour, minute] = timePart.split(":");
      const monthMap = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
      };
      const month = monthMap[monthStr];
      if (month === undefined) return utcString;

      const date = new Date(Date.UTC(
        parseInt(year),
        month,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      ));

      return date.toLocaleString("en-GB", {
        timeZone: "Asia/Tbilisi",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return utcString;
    }
  };

  const fetchTrackedStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats/track`);
      if (!res.ok) throw new Error("Failed to fetch tracked stats");
      const data = await res.json();

      if (data.last_update && data.last_update !== "-") {
        data.last_update = convertToGeorgianTime(data.last_update);
      }
      setStats(data);
    } catch (e) {
      console.warn("Error fetching tracked stats:", e);
    }
  };

  useEffect(() => {
    fetchTrackedStats();
  }, []);

  const loginDev = async () => {
    if (password.trim() === DEV_PASSWORD) {
      setShowLogin(false);
      setShowStats(true);

      try {
        const res = await fetch(`${API_BASE}/api/stats`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();

        if (data.last_update && data.last_update !== "-") {
          data.last_update = convertToGeorgianTime(data.last_update);
        }

        setStats(data);
      } catch (e) {
        alert("Error fetching stats.");
      }
    } else {
      alert("Incorrect password!");
    }
  };

  const resetStats = async () => {
    if (!confirm("Are you sure you want to reset all stats? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/reset-stats`, {
        method: "POST",
        headers: {
          "x-dev-password": DEV_PASSWORD,
        },
      });
      if (!res.ok) throw new Error("Failed to reset stats");
      const data = await res.json();
      if (data.last_update && data.last_update !== "-") {
        data.last_update = convertToGeorgianTime(data.last_update);
      }
      setStats(data);
      alert("Stats have been reset.");
    } catch (e) {
      alert("Error resetting stats.");
    }
  };

  return (
    <>
      <div id="menu-container">
        <div id="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div
          id="help-toggle"
          title="How to use?"
          onClick={() => setHelpOpen(!helpOpen)}
          aria-label="Toggle Help"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setHelpOpen(!helpOpen);
          }}
        >
          ?
        </div>

        {menuOpen && (
          <div id="menu-options">
            <a
              href="https://github.com/aurumz-rgb"
              target="_blank"
              rel="noopener noreferrer"
              class="menu-link"
            >
              Support
            </a>

            <button onClick={() => setInfoOpen(!infoOpen)}>Info</button>

            <div id="dev-login">
              <button onClick={() => setShowLogin(!showLogin)}>Developer</button>

              {showLogin && (
                <div id="dev-login-form">
                  <input
                    type="password"
                    value={password}
                    onInput={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        loginDev();
                      }
                    }}
                  />
                  <button onClick={loginDev}>Login</button>
                </div>
              )}

              {showStats && (
                <div
                  id="dev-stats"
                  style={{ fontSize: "14px", color: "#444", lineHeight: 1.5 }}
                >
                  <h3>Backend Stats</h3>
                  <p>
                    <strong>Total Unique Users:</strong>{" "}
                    {stats.total_users !== undefined ? stats.total_users : 0}
                  </p>
                  <p>
                    <strong>Total Visits:</strong>{" "}
                    {stats.total_visits !== undefined ? stats.total_visits : 0}
                  </p>
                  <p>
                    <strong>Papers Processed:</strong>{" "}
                    {stats.papers_processed !== undefined ? stats.papers_processed : 0}
                  </p>
                  <p>
                    <strong>Last Update:</strong>{" "}
                    {stats.last_update !== undefined ? stats.last_update : "-"}
                  </p>
                  <button
                    style={{
                      marginTop: "12px",
                      padding: "6px 10px",
                      background: "#f5f5f5",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "red",
                      fontWeight: "bold",
                    }}
                    onClick={resetStats}
                  >
                    Reset Stats
                  </button>
                  <button
                    style={{
                      marginTop: "12px",
                      padding: "6px 10px",
                      background: "#f5f5f5",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    onClick={() => {
                      setShowStats(false);
                      setShowLogin(true);
                    }}
                  >
                    ← Back
                  </button>
                </div>
              )}
            </div>

            <button
              style={{
                marginTop: "12px",
                padding: "8px 12px",
                background: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onClick={() => setMenuOpen(false)}
            >
              ← Back
            </button>
          </div>
        )}

        {helpOpen && (
          <div
            id="menu-options"
            style={{
              position: "fixed",
              top: "60px",
              right: "20px",
              left: "auto",
              marginTop: 0,
              width: "260px",
              zIndex: 1300,
            }}
          >
            <h3>How to use?</h3>
            <p>Welcome to AccessPaper! How to get your research articles:</p>
            <p>
              <ol style={{ paddingLeft: "20px", marginBottom: "4px" }}>
                <li style={{ marginBottom: "8px" }}>
                  Enter your paper's DOI into the search box.
                </li>
                <li style={{ marginBottom: "8px" }}>
                  AccessPaper will instantly check for free, legal full-text
                  versions of the paper.
                </li>
                <li style={{ marginBottom: "8px" }}>
                  If available, download the article immediately.
                </li>
              </ol>
            </p>
            <button
              style={{
                marginTop: "12px",
                padding: "8px 12px",
                background: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onClick={() => setHelpOpen(false)}
            >
              ← Back
            </button>
          </div>
        )}

        {infoOpen && (
          <div
            id="menu-options"
            style={{
              position: "fixed",
              top: "60px",
              left: "20px",
              right: "auto",
              marginTop: 0,
              width: "300px",
              zIndex: 1300,
            }}
          >
            <h3>Where we look:</h3>
            <p>
              To find free articles, AccessPaper searches multiple trusted
              sources including:
            </p>
            <ul style={{ fontSize: "0.9rem",paddingLeft: "20px", marginBottom: "4px" }}>
              <li style={{ marginBottom: "10px" }}>
                Open Access repositories through Unpaywall
              </li>
              <li style={{ marginBottom: "10px" }}>
                Preprint servers like arXiv, bioRxiv, and medRxiv
              </li>
              <li style={{ marginBottom: "10px" }}>
                Academic aggregators such as CORE, Zenodo, and Figshare
              </li>
              <li style={{ marginBottom: "10px" }}>
                Funded research archives like PubMed Central and EuropePMC
              </li>
            </ul>
            <p style={{ marginTop: "32px" }}>
              For detailed information, visit our GitHub repository or contact
              support via the Support link.
            </p>
            <button
              style={{
                marginTop: "12px",
                padding: "8px 12px",
                background: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onClick={() => setInfoOpen(false)}
            >
              ← Back
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          
          #menu-container { position: fixed; top: 20px; left: 20px; z-index: 1200; }
          #hamburger { cursor: pointer; width: 25px; height: 20px; display: flex; flex-direction: column; justify-content: space-between; padding: 6px; border-radius: 6px; }
          #hamburger span { display: block; height: 4px; background: #333; border-radius: 2px; }
          #help-toggle { position: fixed; top: 20px; right: 20px; width: 32px; height: 32px; border-radius: 50%; background: #fff; color: #222; font-weight: 700; font-size: 20px; line-height: 32px; text-align: center; cursor: pointer; user-select: none; transition: background-color 0.25s ease, color 0.25s ease; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: none; }
          #help-toggle:hover, #help-toggle:focus { background-color: #e8f0fe; color: #0a66c2; outline: none; }
          #menu-options { margin-top: 12px; background: #fff; border-radius: 10px; padding: 16px 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.07); width: 220px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; user-select: none; font-weight: 500; position: relative; }
          #menu-options a, #menu-options button { display: block; width: 100%; padding: 8px 12px; box-sizing: border-box; margin-bottom: 12px; background: none; border: none; text-align: left; cursor: pointer; font-size: 16px; color: #222; text-decoration: none; border-radius: 6px; transition: background-color 0.25s ease, color 0.25s ease; font-weight: 500; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .menu-link { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: 500; color: #222; padding: 8px 12px; border-radius: 6px; transition: background-color 0.25s ease, color 0.25s ease; text-decoration: none; display: block; box-sizing: border-box; margin-bottom: 12px; }
          .menu-link:hover { color: #0a66c2; background-color: #e8f0fe; }
          #menu-options a:first-child, #menu-options button:first-child { margin-top: 0; }
          #menu-options a:last-child, #menu-options button:last-child { margin-bottom: 0; }
          #menu-options a:hover, #menu-options button:hover { color: #0a66c2; background-color: #e8f0fe; }
          #dev-login-form input { width: 100%; padding: 10px 14px; margin-bottom: 10px; box-sizing: border-box; border: 1.5px solid #ccc; border-radius: 8px; font-size: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; transition: border-color 0.25s ease; }
          #dev-login-form input:focus { outline: none; border-color: #0a66c2; box-shadow: 0 0 6px rgba(10,102,194,0.3); }
          #dev-stats { font-size: 14px; color: #444; font-weight: 400; line-height: 1.5; }
          #menu-options h3 { margin-top: 0; margin-bottom: 8px; font-weight: 600; font-size: 18px; color: #222; }
          #menu-options p { font-size: 14px; line-height: 1.5; color: #444; margin-bottom: 8px; }

          
          @media (max-width: 768px) {
            #menu-options { width: 90vw; max-width: 300px; padding: 14px 16px; }
            #help-toggle { width: 28px; height: 28px; font-size: 18px; line-height: 28px; }
            #hamburger { width: 22px; height: 18px; }
            #hamburger span { height: 3px; }
            #dev-login-form input { font-size: 14px; padding: 8px 12px; }
            #menu-options h3 { font-size: 16px; }
            #menu-options p, #dev-stats { font-size: 13px; }
            #menu-options a, #menu-options button, .menu-link { font-size: 15px; padding: 6px 10px; }
          }

          @media (max-width: 480px) {
            #menu-container { top: 12px; left: 12px; }
            #help-toggle { top: 12px; right: 12px; width: 26px; height: 26px; font-size: 16px; line-height: 26px; }
            #menu-options { width: 95vw; max-width: 260px; padding: 12px 14px; }
            #hamburger { width: 20px; height: 16px; }
            #hamburger span { height: 2.5px; }
            #dev-login-form input { font-size: 13px; padding: 6px 10px; }
            #menu-options h3 { font-size: 15px; }
            #menu-options p, #dev-stats { font-size: 12px; }
            #menu-options a, #menu-options button, .menu-link { font-size: 14px; padding: 5px 8px; }
          }
        `}
      </style>
    </>
  );
}
