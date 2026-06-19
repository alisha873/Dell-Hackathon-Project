import ReviewerTopNav from "@/components/ReviewerTopNav";

export default function ReviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface min-h-screen font-body-md text-body-md overflow-x-hidden">
      <ReviewerTopNav />
      {/* SideNavBar is hidden on desktop for the evaluation center, so we'll omit it from layout and put it in specific pages if needed */}
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
}
