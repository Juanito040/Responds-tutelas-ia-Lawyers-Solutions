import Link from "next/link";
import { FolderOpen } from "lucide-react";

export default function EmptyState({ title, description, actionLabel, actionHref }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8 text-primary-300" />
      </div>
      <h3 className="text-lg font-semibold text-primary-500 mb-2">{title}</h3>
      {description && <p className="text-muted text-sm mb-6 max-w-xs">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary btn">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
