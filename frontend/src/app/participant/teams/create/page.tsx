"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Participant = {
  id: string;
  name?: string;
  avatar?: string;
  declared_skills?: string[];
  skill_vector?: Record<string, number>;
}

function buildRequiredVector(skills: string[]) {
  return skills.reduce((acc, skill) => {
    acc[skill.toLowerCase().replace(/\s+/g, '_')] = 1;
    return acc;
  }, {} as Record<string, number>);
}

function calculateRecruitMatch(participantVector: Record<string, number>, requiredVector: Record<string, number>) {
  let score = 0;
  let maxPossible = 0;
  
  for (const [skill, weight] of Object.entries(requiredVector)) {
    maxPossible += weight;
    if (participantVector[skill]) {
      score += participantVector[skill] * weight;
    }
  }
  
  if (maxPossible === 0) return 0;
  return Math.round((score / maxPossible) * 100);
}

export default function CreateTeam() {
  const [teamSize, setTeamSize] = useState(4);
  const [activeTab, setActiveTab] = useState("Invite Friends");
  const [teamName, setTeamName] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>(["Python", "UI/UX"]);
  const [newSkill, setNewSkill] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateTeam = async () => {
    try {
      setIsCreating(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = {
        name: teamName || "Unnamed Team",
        member_ids: session?.user?.id ? [session.user.id] : []
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/teams/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push("/participant/teams/workspace");
      } else {
        console.error("Failed to create team");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const [recruits, setRecruits] = useState<Participant[]>([]);
  const [loadingRecruits, setLoadingRecruits] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    setLoadingRecruits(true);
    fetch(`${apiUrl}/participants/`)
      .then(async (r) => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json(); })
      .then((data) => setRecruits(data || []))
      .catch((e) => console.error("Failed to load participants:", e))
      .finally(() => setLoadingRecruits(false));
  }, []);

  const currentRequiredVector = buildRequiredVector(requiredSkills);

  const sortedRecruits = [...recruits].map(p => ({
    ...p,
    matchScore: calculateRecruitMatch(p.skill_vector || {}, currentRequiredVector)
  })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return (
    <>
      <main className="max-w-[1280px] mx-auto px-6 py-stack-lg pb-32">
        {/* Header Section */}
        <section className="mb-stack-lg text-center md:text-left">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-sm">Architect Your Squad</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Define your mission and find the perfect collaborators to bring your vision to life.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-md items-start">
          {/* Left Column: Team Architecting */}
          <div className="lg:col-span-7 space-y-stack-md">
            {/* Team Identity Card */}
            <div className="bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant/20 shadow-[0_20px_40px_-15px_rgba(214,203,191,0.4)]">
              <h2 className="font-headline-sm text-[24px] text-primary mb-6">Team Identity</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Team Name</label>
                  <input 
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-tertiary focus:border-transparent outline-none transition-all font-body-md" 
                    placeholder="e.g. Project Verdant" 
                    type="text" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Team Description</label>
                  <textarea className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-tertiary focus:border-transparent outline-none transition-all font-body-md" placeholder="Describe your team's mission, culture, and goals..." rows={4}></textarea>
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Problem Statement Selection</label>
                  <select className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-tertiary outline-none font-body-md appearance-none">
                    <option>AI for Carbon Sequestration</option>
                    <option>Decentralized Energy Grids</option>
                    <option>Ethical Data Markets</option>
                    <option>Sustainable Urban Mobility</option>
                  </select>
                </div>
              </div>
            </div>

            
            {/* Required Skills Module */}
            <div className="bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant/20 shadow-[0_20px_40px_-15px_rgba(214,203,191,0.4)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-headline-sm text-[24px] text-primary">Required Skills</h2>
                <div className="flex gap-2 items-center w-full sm:w-auto">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const skill = newSkill.trim();
                        if (skill && !requiredSkills.includes(skill)) {
                          setRequiredSkills([...requiredSkills, skill]);
                        }
                        setNewSkill('');
                      }
                    }}
                    className="w-full sm:w-72 bg-white border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-tertiary outline-none"
                    placeholder="Add a new skill"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const skill = newSkill.trim();
                      if (!skill) return;
                      if (!requiredSkills.includes(skill)) {
                        setRequiredSkills([...requiredSkills, skill]);
                      }
                      setNewSkill('');
                    }}
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    Add Skill
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {requiredSkills.length === 0 ? (
                  <div className="text-on-surface-variant">No skills added yet. Add a skill to define your team’s needs.</div>
                ) : (
                  <div className="space-y-3">
                    {requiredSkills.map((skill) => (
                      <div key={skill} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant/10 gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary text-[18px]">{skill.charAt(0).toUpperCase()}</span>
                          <div>
                            <p className="font-label-md font-bold text-on-surface">{skill}</p>
                            <p className="text-[12px] text-on-surface-variant">This skill is required for your team.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[12px] uppercase tracking-wider text-on-surface-variant font-bold">Required</span>
                          <button
                            type="button"
                            onClick={() => setRequiredSkills(requiredSkills.filter((s) => s !== skill))}
                            className="text-on-surface-variant hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-[0_20px_40px_-15px_rgba(214,203,191,0.4)] overflow-hidden">
              <div className="flex border-b border-outline-variant/10">
                {["Invite Friends", "By Email", "Requests Sent"].map((tab) => (
                  <button 
                    key={tab}
                    className={`flex-1 py-3 font-label-sm transition-colors ${
                      activeTab === tab ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-stack-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                      </div>
                      <span className="font-label-md font-bold text-on-surface">sarah.j@tech.io</span>
                    </div>
                    <span className="px-2 py-1 bg-secondary-container/30 text-secondary text-[10px] font-bold rounded-full">Invited</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                      </div>
                      <span className="font-label-md font-bold text-on-surface">marcus_v@ucla.edu</span>
                    </div>
                    <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-[10px] font-bold rounded-full">Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Intelligence & Recruitment */}
          <aside className="lg:col-span-5 space-y-stack-md">
            {/* Team Health & Skill Gap Analysis */}
            <div className="bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant/20 shadow-[0_20px_40px_-15px_rgba(214,203,191,0.4)]">
              <h2 className="font-headline-sm text-[24px] text-primary mb-6">Readiness Analysis</h2>
              <div className="flex items-center justify-between mb-8">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-surface-container-high" cx="18" cy="18" fill="transparent" r="16" stroke="currentColor" strokeWidth="2.5"></circle>
                    <circle className="text-primary" cx="18" cy="18" fill="transparent" r="16" stroke="currentColor" strokeDasharray="100 100" strokeDashoffset="35" strokeLinecap="round" strokeWidth="2.5"></circle>
                    <text className="text-[8px] font-bold fill-primary rotate-90 origin-center" textAnchor="middle" x="18" y="21">65%</text>
                  </svg>
                </div>
                <div className="flex-1 ml-6">
                  <p className="font-label-md text-on-surface-variant mb-1">Coverage Score</p>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-secondary"></span>
                    <span className="font-label-md font-bold text-on-surface">Forming Stage</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-3">Current Members</p>
                  <div className="flex -space-x-3">
                    <img className="w-10 h-10 rounded-full border-2 border-white object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVy5KoRSnIDJytOfYh6f5b8jSt-NzIQkXHQAMZKM58R4GqZ8BLUUQ7jlaaHBNn0tdRKn34Hh2QvoVkt57XWeQFXT67eYj9Ue7ZPsltIYZzQzgq0NbWlJwk71eFWXIOmKYJixoB1E3saeevLzTj4PEZpRhXwbW3eeqGdD4rhDkAZIr_Dv4lKtFyL4O0nKNSBhuOJivKVVMEVmqPl1SL_WFl_QG0097uYyT3Rv03PTpO4iAWwuv3IVq9qjT3BVoYe7qSbelQsHK8u3w" alt="Member 1" />
                    <img className="w-10 h-10 rounded-full border-2 border-white object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIFbJu0MS0mKNfCUUvZPsa-Itd1xSS7urJRM9GlRUMn1C2PH24-G0OV2wkY4v6rouLjgi6SOqnIT_-kP78W3dX9E6nP5i2rqlNdYEBi1AZ3QyfF37-dBySsXfi8UKOgRp0G-n17RR1J0nUMzUE2fwQv7RFdRrdlKpyR_qYQyXx7bUTu1Fl923G1bNvrTBZTgzcqKjLrQ_JhlfWyzDGZbMqSQOU2PVWEqSd-VI22T2tijpL3LunDuhsu1ffF55PINl5ATMiuOBD-Ls" alt="Member 2" />
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface-variant">+2</div>
                  </div>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-3">Missing Critical Roles</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-error-container/20 text-error text-[12px] font-bold rounded-full border border-error/10">Lead Backend</span>
                    <span className="px-3 py-1 bg-error-container/20 text-error text-[12px] font-bold rounded-full border border-error/10">Data Scientist</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recruitment Suggestions */}
            <div className="bg-surface-container-highest/30 rounded-xl p-stack-md border border-outline-variant/10 shadow-[0_20px_40px_-15px_rgba(214,203,191,0.4)]">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-tertiary">psychology</span>
                <h2 className="font-headline-sm text-[24px] text-primary">AI Matchmaking</h2>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
                {sortedRecruits.map((recruit) => (
                  <div key={recruit.id} className="bg-white p-4 rounded-xl border border-outline-variant/20 hover:border-primary/50 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-label-md font-bold text-on-surface">{recruit.name}</h3>
                        <p className="text-[12px] text-tertiary font-bold">{recruit.matchScore}% Match</p>
                      </div>
                      <button className="bg-primary text-white text-[12px] px-3 py-1.5 rounded-full font-bold hover:scale-105 transition-transform">Invite</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(recruit.declared_skills || (recruit as any).skills || []).map((skill) => (
                        <span key={skill} className="text-[10px] px-2 py-1 bg-surface-container-low rounded-md">{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruitment Panel */}
            
          </aside>
        </div>
      </main>

      {/* Footer/Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-lg border-t border-outline-variant/30 py-4 px-6 z-50">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">verified</span>
            <p className="font-label-md text-on-surface-variant">Your team blueprint is 65% complete. Ready for phase 1?</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link href="/participant/teams">
              <button className="w-full md:w-auto px-6 py-2.5 rounded-lg border border-outline-variant text-primary font-label-md font-bold hover:bg-surface-container-low transition-colors">
                Save Draft
              </button>
            </Link>
            <button className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-primary-container/20 text-on-primary-container font-label-md font-bold hover:bg-primary-container/40 transition-colors">
              Invite Participants
            </button>
            <button 
              onClick={handleCreateTeam}
              disabled={isCreating}
              className="flex-1 md:flex-none px-8 py-2.5 rounded-lg bg-primary text-white font-label-md font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Team"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
