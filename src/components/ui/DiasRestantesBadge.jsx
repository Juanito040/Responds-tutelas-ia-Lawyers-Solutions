import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";

export default function DiasRestantesBadge({ dias }) {
  if (dias <= 0) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 700, background: "#F3F4F6", color: "#6B7280", border: "1px solid #D1D5DB" }}>
        <XCircle style={{ width: "11px", height: "11px" }} />
        VENCIDA
      </span>
    );
  }
  if (dias <= 3) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 700, background: "#fef2f2", color: "#C0392B", border: "1px solid #fecaca" }}>
        <AlertTriangle style={{ width: "11px", height: "11px" }} />
        {dias}d — URGENTE
      </span>
    );
  }
  if (dias <= 5) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 700, background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }}>
        <Clock style={{ width: "11px", height: "11px" }} />
        {dias}d hábiles
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 700, background: "#EEF4F1", color: "#1B3528", border: "1px solid #9BBFAC" }}>
      <Clock style={{ width: "11px", height: "11px" }} />
      {dias}d hábiles
    </span>
  );
}
