import Link from "next/link";
import { FolderOpen } from "lucide-react";

export default function EmptyState({ title, description, actionLabel, actionHref }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", textAlign: "center" }}>
      <FolderOpen style={{ width: "32px", height: "32px", color: "#9BBFAC", marginBottom: "16px" }} />
      <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "22px", fontWeight: 700, color: "#1A1A18", marginBottom: "8px" }}>{title}</h3>
      {description && (
        <p style={{ fontSize: "14px", color: "#7A7268", marginBottom: "24px", maxWidth: "280px", lineHeight: 1.6 }}>{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#1B3528", color: "#fff", padding: "10px 22px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
