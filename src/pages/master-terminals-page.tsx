import TerminalList from "@/components/terminal/terminal-list";

export default function MasterTerminalsPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">터미널 (Terminals)</h1>
      <TerminalList />
    </div>
  );
}
