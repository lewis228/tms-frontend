import { Loader2Icon } from "lucide-react";

export default function GlobalLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2Icon className="text-muted-foreground size-8 animate-spin" />
    </div>
  );
}
