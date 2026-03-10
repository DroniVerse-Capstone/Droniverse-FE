
import SystemHeader from "@/components/layouts/system/SystemHeader";
import SystemSidebar from "@/components/layouts/system/SystemSidebar";

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <SystemSidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden bg-greyscale-800">
          <SystemHeader />
          <div className="min-w-0 flex-1 p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}