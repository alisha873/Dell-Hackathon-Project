import Link from "next/link";
import Image from "next/image";

export default function ReviewerTopNav() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-margin-desktop h-16 bg-surface shadow-sm transition-all duration-200">
      <div className="flex items-center gap-8">
        <span className="text-headline-sm font-headline-sm font-bold text-primary tracking-tight">DevFlow Judge</span>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/reviewer/evaluation" className="text-label-md font-label-md text-primary border-b-2 border-primary pb-1">Submissions</Link>
          <Link href="/reviewer/rankings" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors">Rankings</Link>
          <Link href="/reviewer/guide" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors">Judging Guide</Link>
          <Link href="/reviewer/chat" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors">Live Chat</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        </button>
        <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant">settings</span>
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-container">
          <img className="w-full h-full object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7HUyaXazbIEZHeACIJIUfNqE3zEWtGf5ZHOqkYGbTFLgrYaR1168CB3PqV22aw-5w33qxkXNQdYTfPTsIxq__aRdWyMnynaUVhIBg5jQtO4Fh61Mj7911GoFVSjYjMDEPuNqmAtLzY9GwyD3Rhjfgrvc9jJtiBKixD_cMmm5FSrvWXb3pHAh32mCYlUOP5-wWHRTSoRbKSia1hRosLkmBKmv0tNBQm1gr59unbwZ7wgTVJAXPaOVipSMd4iEg6tfeUzoWWnxyu84" alt="Judge Profile" />
        </div>
      </div>
    </header>
  );
}
