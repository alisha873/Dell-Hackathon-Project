import Sidebar from "@/components/Sidebar";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full pl-64">
        <main className="min-h-screen w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
