import { Loader2Icon } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
    </div>
  );
}
