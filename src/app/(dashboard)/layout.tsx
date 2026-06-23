import { Sidebar, MobileTabBar } from "@/components/layout";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        {children}
      </div>
      <MobileTabBar />
    </div>
  );
}
