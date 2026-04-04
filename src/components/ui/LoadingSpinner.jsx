export default function LoadingSpinner({ text = "Cargando..." }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "72px 0", gap: "18px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Tres puntos pulsantes */}
      <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: "7px", height: "7px",
            borderRadius: "9999px",
            background: "#1B3528",
            display: "inline-block",
            animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <p style={{
        fontSize: "12px", fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: "#A89E93",
      }}>
        {text}
      </p>
    </div>
  );
}
