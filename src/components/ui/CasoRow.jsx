"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DiasRestantesBadge from "@/components/ui/DiasRestantesBadge";

const T = { ink: "#1A1A18", border: "#D8D2CA", muted: "#7A7268", light: "#A89E93" };

export default function CasoRow({ caso, index }) {
  return (
    <Link
      href={`/casos/${caso.id}`}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 0",
        borderTop: index === 0 ? `1px solid ${T.border}` : "none",
        borderBottom: `1px solid ${T.border}`,
        textDecoration: "none",
        gap: "16px",
        transition: "padding-left 0.18s cubic-bezier(0.4,0,0.2,1)",
      }}
      onMouseEnter={e => { e.currentTarget.style.paddingLeft = "6px"; }}
      onMouseLeave={e => { e.currentTarget.style.paddingLeft = "0px"; }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: "14px", fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "2px" }}>
          {caso.accionante}
        </p>
        <p style={{ fontSize: "12px", color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          vs. {caso.accionado}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <DiasRestantesBadge dias={caso.diasRestantes} />
        <ArrowRight style={{ width: "13px", height: "13px", color: T.light }} />
      </div>
    </Link>
  );
}
