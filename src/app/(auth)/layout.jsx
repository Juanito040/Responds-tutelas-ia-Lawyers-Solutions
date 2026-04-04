const animStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ── Auth form styles ─────────────────────────────────────────────── */
  .focus-field { position: relative; }
  .focus-bar {
    position: absolute; bottom: 0; left: 0;
    height: 2px; width: 0;
    background: #1B3528;
    transition: width 0.3s ease;
  }
  .focus-field:focus-within .focus-bar { width: 100%; }

  .auth-input {
    height: 52px;
    width: 100%;
    border: none;
    background: #EDE8E1;
    padding: 0 16px;
    color: #1A1A18;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    display: block;
    transition: background 0.15s;
  }
  .auth-input:hover  { background: #D8D2CA; }
  .auth-input::placeholder { color: #8A8680; }
  .auth-input-pr     { padding-right: 50px; }
  .auth-input-err    { background: #fff1f2 !important; }

  .auth-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #4A6A58;
    margin-bottom: 8px;
  }
  .auth-btn {
    background: linear-gradient(135deg, #1B3528 0%, #2A5240 100%);
    color: white;
    height: 52px;
    width: 100%;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 15px;
    letter-spacing: 0.02em;
    transition: box-shadow 0.2s, opacity 0.2s;
    margin-top: 8px;
  }
  .auth-btn:hover:not(:disabled)  { box-shadow: 0 6px 24px rgba(27,53,40,0.35); transform: translateY(-1px); }
  .auth-btn:active:not(:disabled) { transform: scale(0.98) translateY(0); box-shadow: none; }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .auth-server-err {
    background: #fef2f2;
    border-left: 3px solid #ef4444;
    color: #b91c1c;
    padding: 10px 14px;
    font-size: 14px;
    margin-bottom: 16px;
  }
  .auth-field-err {
    font-size: 12px;
    color: #ef4444;
    margin-top: 5px;
  }
  .auth-spin {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .auth-divider-line { flex: 1; height: 1px; background: #D8D2CA; }
  .auth-divider-text {
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: #8A8680;
  }
  .auth-secondary-btn {
    display: flex;
    height: 48px;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: 1px solid #D8D2CA;
    font-weight: 600;
    color: #1A1A18;
    text-decoration: none;
    font-size: 14px;
    transition: background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease;
    margin-top: 20px;
    font-family: 'DM Sans', sans-serif;
  }
  .auth-secondary-btn:hover  { background: #EDE8E1; transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,0.07); }
  .auth-secondary-btn:active { transform: scale(0.98); box-shadow: none; }
`;

export default function AuthLayout({ children }) {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: animStyles }} />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Columna izquierda: formulario ────────────────────────── */}
        <div className="md:w-2/5"
             style={{ width: "100%", display: "flex", flexDirection: "column", background: "#F7F3EE", overflow: "hidden" }}>

          {/* Form area — scroll aquí */}
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 32px" }}>
            <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
              {children}
            </div>
          </div>

          {/* Footer */}
          <div style={{ flexShrink: 0, padding: "14px 32px", display: "flex", alignItems: "center", gap: "20px", borderTop: "1px solid #D8D2CA", fontSize: "12px", color: "#8A8680" }}>
            <span style={{ opacity: 0.7 }}>© 2025 TutelaIA · JuanDevs</span>
            <a href="#" style={{ color: "#8A8680", textDecoration: "none" }}>Privacidad</a>
            <a href="#" style={{ color: "#8A8680", textDecoration: "none" }}>Términos</a>
          </div>
        </div>

        {/* ── Columna derecha: imagen de fondo ──────────────────────── */}
        <div className="hidden md:flex md:w-3/5"
             style={{ position: "relative", overflow: "hidden", flexDirection: "column", justifyContent: "flex-end", padding: "48px" }}>

          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/Fondo.png')", backgroundSize: "cover", backgroundPosition: "center top" }} />

          {/* Gradiente fusión — izquierda blanca */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #F7F3EE 0%, rgba(247,243,238,0) 16%)" }} />

          {/* Overlay oscuro */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(10,20,15,0.50)" }} />

          {/* Quote card */}
          <div style={{ position: "relative", zIndex: 10, marginBottom: "120px" }}>
            <div style={{
              padding: "28px 32px",
              background: "rgba(10,20,15,0.55)",
              backdropFilter: "blur(12px)",
              borderLeft: "3px solid #A8895A",
            }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#d2b049ff", marginBottom: "14px" }}>
                Inteligencia Artificial Jurídica
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "28px", fontWeight: 700, color: "white", lineHeight: 1.3, fontStyle: "italic", marginBottom: 0 }}>
                "Contesta tutelas en minutos, no en horas."
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
