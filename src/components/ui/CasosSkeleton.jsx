/* Bloque de placeholder con efecto shimmer */
function Bone({ width = "100%", height = "12px", style = {} }) {
  return (
    <div style={{
      width, height,
      background: "linear-gradient(90deg, #EBE5DC 25%, #F7F3EE 50%, #EBE5DC 75%)",
      backgroundSize: "600px 100%",
      animation: "shimmer 1.4s infinite linear",
      flexShrink: 0,
      ...style,
    }} />
  );
}

/* Una fila skeleton que replica la estructura de CasoRow */
function SkeletonRow() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "14px",
      padding: "15px 0", borderBottom: "1px solid #D8D2CA",
    }}>
      {/* Dot urgencia */}
      <Bone width="7px" height="7px" style={{ borderRadius: "9999px", flexShrink: 0 }} />

      {/* Contenido */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Bone width="55%" height="13px" style={{ marginBottom: "6px" }} />
            <Bone width="38%" height="11px" />
          </div>
          {/* Badge días */}
          <Bone width="64px" height="22px" style={{ flexShrink: 0 }} />
        </div>
        {/* Metadatos: tipo, estado, fecha */}
        <div style={{ display: "flex", gap: "14px" }}>
          <Bone width="60px" height="10px" />
          <Bone width="72px" height="10px" />
          <Bone width="90px" height="10px" />
        </div>
      </div>

      {/* Arrow */}
      <Bone width="13px" height="13px" style={{ flexShrink: 0 }} />
    </div>
  );
}

export default function CasosSkeleton({ rows = 6 }) {
  return (
    <div style={{ paddingTop: "8px" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
