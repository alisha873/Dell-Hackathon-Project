import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#04201d] rounded-r-[32px] flex flex-col py-stack-md px-4 shadow-lg z-30">
      <div className="mb-stack-lg px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
        </div>
        <div>
          <h1 className="font-headline-sm text-[24px] font-bold text-white leading-tight">HackFlow</h1>
          <p className="font-label-sm text-[12px] text-white/70">Organizer Portal</p>
        </div>
      </div>
      <nav className="flex-1 space-y-2">
        <Link href="/organizer/dashboard" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-md text-label-md">Dashboard</span>
        </Link>
        <Link href="/organizer/hackathons" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
          <span className="material-symbols-outlined">event_available</span>
          <span className="font-label-md text-label-md">Hackathons</span>
        </Link>
        <Link href="/organizer/registrations" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
          <span className="material-symbols-outlined">group</span>
          <span className="font-label-md text-label-md">Participants</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
          <span className="material-symbols-outlined">folder_open</span>
          <span className="font-label-md text-label-md">Resources</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">Settings</span>
        </Link>
      </nav>
      <div className="mt-auto px-2 pb-4">
        <Link href="/organizer/hackathons/create/step-1" className="block w-full">
          <button className="w-full bg-[#163a35] text-white rounded-xl font-bold py-4 flex items-center justify-center gap-2 shadow-sm transform scale-100 hover:scale-[1.02] active:scale-95 duration-150 ease-in-out">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            Create Hackathon
          </button>
        </Link>
        <div className="mt-stack-lg border-t border-white/10 pt-4 space-y-2">
          <Link href="#" className="flex items-center gap-3 px-4 py-2 text-white/80 text-label-md hover:bg-white/10 rounded-xl transition-all">
            <span className="material-symbols-outlined">contact_support</span>
            Support
          </Link>
          <Link href="/" className="flex items-center gap-3 px-4 py-2 text-white/80 text-label-md hover:bg-white/10 rounded-xl transition-all">
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </Link>
        </div>
      </div>
    </aside>
  );
}
