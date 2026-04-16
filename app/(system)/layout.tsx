
import SystemHeader from "@/components/layouts/system/SystemHeader";
import SystemSidebar from "@/components/layouts/system/SystemSidebar";

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen">
      <div className="flex h-screen">
        <SystemSidebar />
        <main className="flex h-screen min-w-0 flex-1 flex-col overflow-y-auto bg-greyscale-800">
          <SystemHeader />
          <div className="min-w-0 flex-1 overflow-x-hidden p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}