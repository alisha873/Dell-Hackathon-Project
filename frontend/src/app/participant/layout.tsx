import ParticipantTopNav from "@/components/ParticipantTopNav";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen font-body-md text-body-md overflow-x-hidden">
      <ParticipantTopNav />
      {children}
    </div>
  );
}
