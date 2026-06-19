"use client";

import Link from "next/link";

export default function HackathonsListPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-md text-[32px] text-primary font-bold">Your Hackathons</h2>
          <p className="text-on-surface-variant mt-2 text-md max-w-2xl">Manage all the hackathons you are organizing. View analytics, manage submissions, and review participant evaluations.</p>
        </div>
        <Link href="/organizer/hackathons/create/step-1">
          <button className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create New Hackathon
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hackathon Card 1 */}
        <Link href="/organizer/hackathons/winter-2024" className="block group">
          <div className="bg-white rounded-[24px] border border-outline-variant/30 p-6 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary-container/20 p-3 rounded-xl text-primary">
                <span className="material-symbols-outlined text-[32px]">event</span>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-[12px] font-bold rounded-full uppercase tracking-wider border border-green-200">Live</span>
            </div>
            <h4 className="font-headline-sm text-[20px] text-on-surface font-bold group-hover:text-primary transition-colors">Winter 2024 Tech Bloom</h4>
            <p className="text-[14px] text-on-surface-variant mt-2 mb-6">AI-driven solutions for a sustainable future.</p>
            
            <div className="mt-auto pt-6 border-t border-outline-variant/20 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">Participants</p>
                <p className="font-headline-sm text-[20px] text-on-surface font-bold">1,240</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">Submissions</p>
                <p className="font-headline-sm text-[20px] text-on-surface font-bold">852</p>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Hackathon Card 2 */}
        <Link href="/organizer/hackathons/global-ai-2024" className="block group">
          <div className="bg-white rounded-[24px] border border-outline-variant/30 p-6 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-secondary-container/20 p-3 rounded-xl text-secondary">
                <span className="material-symbols-outlined text-[32px]">rocket_launch</span>
              </div>
              <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-[12px] font-bold rounded-full uppercase tracking-wider border border-outline-variant/50">Upcoming</span>
            </div>
            <h4 className="font-headline-sm text-[20px] text-on-surface font-bold group-hover:text-primary transition-colors">Global AI Hackathon</h4>
            <p className="text-[14px] text-on-surface-variant mt-2 mb-6">Pushing the boundaries of generative models and creative engineering.</p>
            
            <div className="mt-auto pt-6 border-t border-outline-variant/20 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">Registered</p>
                <p className="font-headline-sm text-[20px] text-on-surface font-bold">450</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">Days Left</p>
                <p className="font-headline-sm text-[20px] text-on-surface font-bold">14</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
