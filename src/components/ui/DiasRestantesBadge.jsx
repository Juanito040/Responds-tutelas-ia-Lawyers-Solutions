import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";

export default function DiasRestantesBadge({ dias }) {
  if (dias <= 0) {
    return (
      <span className="badge badge-expired">
        <XCircle className="w-3 h-3" /> VENCIDA
      </span>
    );
  }
  if (dias <= 3) {
    return (
      <span className="badge badge-urgent">
        <AlertTriangle className="w-3 h-3" />
        {dias} día{dias === 1 ? "" : "s"} — URGENTE
      </span>
    );
  }
  if (dias <= 5) {
    return (
      <span className="badge badge-pending">
        <Clock className="w-3 h-3" /> {dias} días hábiles
      </span>
    );
  }
  return (
    <span className="badge badge-progress">
      <Clock className="w-3 h-3" /> {dias} días hábiles
    </span>
  );
}
