import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ text = "Cargando..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      <p className="text-muted text-sm">{text}</p>
    </div>
  );
}
