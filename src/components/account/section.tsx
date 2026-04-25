import { cn } from "@/lib/utils";

export default function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-[20px] bg-snow-surface px-6 py-5", className)}
    >
      {children}
    </section>
  );
}
