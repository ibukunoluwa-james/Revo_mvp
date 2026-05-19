import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar variant="agent" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 bg-rg-page p-6">{children}</main>
      </div>
    </div>
  );
}
