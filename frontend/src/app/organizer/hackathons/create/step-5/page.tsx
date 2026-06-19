"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function CreateHackathonStep5() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setShowOverlay(true);
    }, 1500);
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-desktop py-stack-lg w-full">
      {/* Stepper Container */}
      <div className="flex items-center justify-between mb-stack-lg max-w-3xl mx-auto">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            <span className="material-symbols-outlined text-sm">check</span>
          </div>
          <span className="text-xs font-label-sm text-outline">Details</span>
        </div>
        <div className="h-[1px] flex-1 bg-outline-variant mx-4"></div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            <span className="material-symbols-outlined text-sm">check</span>
          </div>
          <span className="text-xs font-label-sm text-outline">Challenges</span>
        </div>
        <div className="h-[1px] flex-1 bg-outline-variant mx-4"></div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            <span className="material-symbols-outlined text-sm">check</span>
          </div>
          <span className="text-xs font-label-sm text-outline">Rubrics</span>
        </div>
        <div className="h-[1px] flex-1 bg-outline-variant mx-4"></div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            <span className="material-symbols-outlined text-sm">check</span>
          </div>
          <span className="text-xs font-label-sm text-outline">Reviewers</span>
        </div>
        <div className="h-[1px] flex-1 bg-outline-variant mx-4"></div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-tertiary text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-tertiary/20">5</div>
          <span className="text-xs font-label-sm text-tertiary font-bold">Publish</span>
        </div>
      </div>

      {/* Page Title Area */}
      <div className="mb-stack-lg text-center">
        <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Publish Summary</h2>
        <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">Review your hackathon configuration before going live. All settings except core dates can be modified after publishing.</p>
      </div>

      {/* Summary Content (Bento Style) */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Section: Basic Info */}
        <div className="col-span-12 lg:col-span-8 bg-white/70 backdrop-blur-md rounded-[24px] p-8 relative overflow-hidden shadow-[0_10px_30px_-10px_rgba(214,203,191,0.3)] border border-outline-variant">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <span className="material-symbols-outlined text-[120px] text-primary">info</span>
          </div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Basic Info</h3>
              <p className="text-sm text-on-surface-variant">Core identity and scheduling</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant hover:bg-surface-variant transition-colors group">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary">edit</span>
              <span className="text-sm font-label-md text-on-surface">Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-label-sm uppercase tracking-wider text-outline mb-1">Hackathon Name</label>
                <p className="text-body-lg font-bold text-on-surface">NexusAI Innovation Summit 2024</p>
              </div>
              <div>
                <label className="block text-xs font-label-sm uppercase tracking-wider text-outline mb-1">Tagline</label>
                <p className="text-body-md text-on-surface-variant italic">"Bridging the gap between human creativity and synthetic intelligence."</p>
              </div>
              <div>
                <label className="block text-xs font-label-sm uppercase tracking-wider text-outline mb-1">Registration Timeline</label>
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                  <span>Oct 15 — Nov 01, 2024</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-label-sm uppercase tracking-wider text-outline mb-1">Theme Color</label>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-tertiary"></div>
                  <span className="text-sm font-mono text-on-surface">#3B4ED6 (Indigo)</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-label-sm uppercase tracking-wider text-outline mb-1">Participant Limit</label>
                <p className="text-body-md text-on-surface">500 Total Hackers</p>
              </div>
              <div>
                <label className="block text-xs font-label-sm uppercase tracking-wider text-outline mb-1">Visibility</label>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/20 text-on-primary-container rounded-full border border-primary-container/30">
                  <span className="material-symbols-outlined text-[16px]">public</span>
                  <span className="text-xs font-label-sm">Public Listing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Media Preview */}
        <div className="col-span-12 lg:col-span-4 bg-white/70 backdrop-blur-md rounded-[24px] overflow-hidden group shadow-[0_10px_30px_-10px_rgba(214,203,191,0.3)] border border-outline-variant">
          <div className="h-full min-h-[240px] relative">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Hero banner" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1eTeCfBKA6YHWIq9uR3aezWb3zdh8pwM2K-7zUIU02PI8MPBVGv1pTCeAVbVS8oV5OP89fla_RNcCZLzGZlDNd8BAt489Ocqma0CcDLZO6bw0bt0klf4vlwOOR6dMVl3180e_t9PWU9QRC7-TyiRLGXjucgZQbNhO0EPyAMWJXoVHCrlafORjSmiV_ozmc-ROzhY0Zt7_S75Zyu-wVwVMrbHJ9sRbQ7D6PgCllK1OqMtI7WRWSwoaK2I4Nx7KeZ0A1PjqoXB7HMk"/>
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h4 className="font-headline-sm text-headline-sm">Event Cover</h4>
              <p className="text-sm opacity-80">Banner-1920x1080.png</p>
            </div>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors">
              <span className="material-symbols-outlined">fullscreen</span>
            </button>
          </div>
        </div>

        {/* Section: Problem Statements */}
        <div className="col-span-12 md:col-span-6 bg-white/70 backdrop-blur-md rounded-[24px] p-8 shadow-[0_10px_30px_-10px_rgba(214,203,191,0.3)] border border-outline-variant">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Problem Statements</h3>
            <button className="text-primary hover:underline font-label-md text-label-md">Edit All</button>
          </div>
          <ul className="space-y-4">
            <li className="p-4 rounded-xl border border-outline-variant bg-white/40 flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container">eco</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Green Ledger</h4>
                <p className="text-sm text-on-surface-variant">Carbon tracking via decentralized infrastructure.</p>
              </div>
            </li>
            <li className="p-4 rounded-xl border border-outline-variant bg-white/40 flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-tertiary-container/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary">neurology</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Synapse API</h4>
                <p className="text-sm text-on-surface-variant">Low-latency mental workload assessment models.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Section: Rubrics & Scoring */}
        <div className="col-span-12 md:col-span-6 bg-surface-container-low backdrop-blur-md rounded-[24px] p-8 shadow-[0_10px_30px_-10px_rgba(214,203,191,0.3)] border border-outline-variant">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Rubrics</h3>
            <button className="text-primary hover:underline font-label-md text-label-md">Edit Rubrics</button>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-label-md text-on-surface">Technical Complexity</span>
                <span className="font-bold text-primary">40%</span>
              </div>
              <div className="h-2 w-full bg-outline-variant rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[40%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-label-md text-on-surface">Innovation & UX</span>
                <span className="font-bold text-primary">35%</span>
              </div>
              <div className="h-2 w-full bg-outline-variant rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[35%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-label-md text-on-surface">Market Readiness</span>
                <span className="font-bold text-primary">25%</span>
              </div>
              <div className="h-2 w-full bg-outline-variant rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[25%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Reviewers */}
        <div className="col-span-12 bg-white/70 backdrop-blur-md rounded-[24px] p-8 shadow-[0_10px_30px_-10px_rgba(214,203,191,0.3)] border border-outline-variant">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Reviewers (4)</h3>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant hover:bg-surface-variant transition-colors group">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span className="text-sm font-label-md">Manage Panel</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Dr. Aris Thorne", role: "CTO, Neuralink", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpnaGhWw3PrD3xfTC4rNW-b3DzInyuO2Ofvsv6Rsn1CTmMobKoxMwjia4IuYvJJRfGiSKKMQkBa-qV0vNLFFOIbFMvoJzp0pB0rUxcOE9iHshZRNUD50cpu5cbT7PW2dEtnvmj2VAFhx9Cq4EnnUu969SbIMDKsytpvr3O3fS9eONrwc1Euh5Qj6G9V919TnFmaqH-ehH_lwegrnWbw8tr5JtiTIjY1UKbiqbWbebBeKUrAFHP5eyU6H2McrP95l78r152fBdvW3Q" },
              { name: "Elara Vance", role: "Design Lead, Figma", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJlMRQrX0DqTIm95uGc3_seP_Teog02frqC6sH_qIgXXkfyfR2UOHBxl6W7z12GvLOpINDVDQ45yNxKr8WGMX3lpQaCP7IpQLUv_wydjtv0-f_gjd-HjxlwFV78XUB3cmnY4N5UgusX5ao1mhvFxr-gZjpd3h32IgOmJHcYC6NkWmsEGw5sYimFF02YJFzXRdV0X1DceNQ4huCDQ3P-66R-W79j3ydnRnhCB4JmXXqeODLVZSdgh-zrOEI_YDdP5vt4pNlSr9WUr0" },
              { name: "Marcus Chen", role: "Venture Partner", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCn7U10vg9wj9-sBIcmUfVfFYcrEtGikAvWbz6wY1PmtmLCK_aUFx6OIn8tYzNPnY_qMoRC8GUYJ50tGxAIlLIV5Hh61irLQ9Lc1xD5SY0-xNovYGeXRJ-9-QKp9TDuWxSBQ6z66Et0pvTWmFDFz4OhIkACaEfowSA0WMr_qxBEnKyvuhzwbQOr_UWSpx3rsMn12YKaT2xyuJL3ygiSCfRrO_NBURbfwW1liD6xRhA8_2_0HNAk758VuK5UaPhrDqt5e71gQAjCiPo" },
              { name: "Sarah Jenkins", role: "Staff Eng, Google", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIu75tm2jm3gqsm8oRViRhTHS8IObGJTb3x9hTyvxhfGkrcfwiYF1FCk5xOV79WoN514US52nnlV05ES8bnqvi2Jph3PKnjC2sQYqzWDUXsxt4T4p1LNozSm5unB6cfGe565XsRa3IT4BMdDJO5YLyaDZ6Bdf0Z-s73Ub49PbBKOMDLw8TWEzi0QvSEAvad0Ie1vOtN0qaF6WE2_3DvsHz9F_few2LkJwv861wS8yGpkmwcK9ayQAsor7lbCriCmfw6NwebR6wsmQ" },
            ].map((reviewer, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-outline-variant/50 hover:bg-white transition-all">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                  <img className="w-full h-full object-cover" alt={reviewer.name} src={reviewer.img}/>
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-on-surface truncate">{reviewer.name}</p>
                  <p className="text-xs text-on-surface-variant">{reviewer.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-stack-lg pt-stack-md border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px] text-primary">verified_user</span>
          <p className="text-sm">By publishing, you agree to the <Link href="#" className="underline font-bold">Organizer Terms of Service</Link>.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link href="/organizer/hackathons/create/step-4" className="w-full md:w-auto">
            <button className="w-full md:w-auto px-margin-mobile md:px-8 py-3 rounded-full border border-outline text-on-surface-variant font-label-md hover:bg-surface-variant transition-all">
              Previous Step
            </button>
          </Link>
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className={`w-full md:w-auto px-margin-mobile md:px-12 py-3 rounded-full bg-tertiary text-white font-bold font-label-md shadow-xl shadow-tertiary/20 hover:scale-[1.02] active:scale-95 transition-all ${isPublishing ? 'animate-pulse' : ''}`}
          >
            {isPublishing ? 'Publishing...' : 'Publish Hackathon'}
          </button>
        </div>
      </div>

      {/* Overlay Notification */}
      {showOverlay && (
        <div className="fixed inset-0 bg-surface/80 backdrop-blur-md z-[100] flex items-center justify-center transition-opacity duration-500">
          <div className="text-center p-stack-lg max-w-md">
            <div className="w-24 h-24 bg-primary text-white rounded-full mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-primary/30">
              <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-2">It's Official!</h2>
            <p className="text-body-lg text-on-surface-variant mb-8">NexusAI Innovation Summit 2024 is now live and accepting registrations.</p>
            <div className="flex flex-col gap-3">
              <Link href="/organizer/dashboard" className="w-full">
                <button className="w-full px-8 py-3 bg-primary text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all">
                  Go to Dashboard
                </button>
              </Link>
              <button className="text-primary font-label-md hover:underline mt-2">Share Live Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
