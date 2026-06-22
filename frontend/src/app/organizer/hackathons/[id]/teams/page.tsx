"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function HackathonTeams() {
  const params = useParams();
  const [teams, setTeams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    Promise.all([
      fetch(`${apiUrl}/teams/`).then(res => res.json()),
      fetch(`${apiUrl}/submissions/`).then(res => res.json())
    ])
      .then(([teamsData, submissionsData]) => {
        setTeams(teamsData);
        setSubmissions(submissionsData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load teams/submissions", err);
        setIsLoading(false);
      });

    // Simple micro-interaction for hover states on metrics
    document.querySelectorAll('.bento-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            (card as HTMLElement).style.borderColor = 'rgba(73, 99, 95, 0.4)';
        });
        card.addEventListener('mouseleave', () => {
            (card as HTMLElement).style.borderColor = 'rgba(193, 200, 198, 0.2)';
        });
    });
  }, []);

  const totalTeams = teams.length;
  const recruiting = teams.filter(t => (t.member_ids?.length || 0) < 4).length;
  const complete = teams.filter(t => (t.member_ids?.length || 0) >= 4).length;
  const totalSubmissions = submissions.length;
  const missingSkills = teams.filter(t => (t.coverage_score || 0) < 50).length;
  const submissionPercentage = totalTeams ? Math.round((totalSubmissions / totalTeams) * 100) : 0;

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
      <style jsx>{`
        .bento-card {
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        .bento-card:hover {
            transform: translateY(-4px);
        }
      `}</style>
      
      {/* Page Header */}
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h3 className="font-headline-md text-[32px] font-bold">Team Management Portal</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              if (confirm("Run AI Team Formation to group unassigned participants for this hackathon?")) {
                try {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                  const res = await fetch(`${apiUrl}/teams/form`, { 
                    method: "POST",
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ team_size: 4 })
                  });
                  if (res.ok) alert("Team formation started in background!");
                  else alert("Failed to start team formation.");
                } catch (e) {
                  alert("Error triggering formation.");
                }
              }
            }}
            className="border-2 border-secondary/20 text-secondary px-4 py-2 rounded-xl flex items-center gap-2 text-[14px] font-bold hover:bg-secondary/5 transition-colors">
            <span className="material-symbols-outlined text-[20px]">group_add</span>
            AI Team Assembly
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Total Teams</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-on-surface">{isLoading ? "-" : totalTeams}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Recruiting</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-secondary">{isLoading ? "-" : recruiting}</span>
            <span className="text-[12px] text-secondary/60 font-bold">Open</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Complete</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-primary">{isLoading ? "-" : complete}</span>
            <span className="text-[12px] text-primary/60 font-bold">Ready</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Missing Skills</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-error">{isLoading ? "-" : missingSkills}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Submissions</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-on-surface">{isLoading ? "-" : totalSubmissions}</span>
            <span className="text-[12px] text-primary font-bold">{submissionPercentage}%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Pending Review</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-tertiary">{isLoading ? "-" : totalSubmissions}</span>
            <span className="text-[12px] text-tertiary/60 font-bold">New</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Content Column */}
        <div className="xl:col-span-9 space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input className="w-full bg-surface-container-low border-none rounded-xl pl-10 py-3 text-[14px] font-medium focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Search Team Name, Member, or Problem Statement..." type="text"/>
            </div>
            <select className="bg-surface-container-low border-none rounded-xl px-4 py-3 text-[14px] font-medium focus:ring-2 focus:ring-primary/20 text-on-surface-variant cursor-pointer">
              <option>All Statuses</option>
              <option>Healthy</option>
              <option>Recruiting</option>
              <option>At Risk</option>
            </select>
            <select className="bg-surface-container-low border-none rounded-xl px-4 py-3 text-[14px] font-medium focus:ring-2 focus:ring-primary/20 text-on-surface-variant cursor-pointer">
              <option>All Problem Statements</option>
              <option>Sustainability Tech</option>
              <option>Circular Economy</option>
              <option>Urban Agri-tech</option>
            </select>
            <button className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">tune</span>
            </button>
          </div>


          {/* Main Team Table */}
          <div className="bg-white rounded-[24px] border border-outline-variant/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/20">
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Team Name</th>
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Members</th>
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Coverage</th>
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Problem Statement</th>
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Health</th>
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Reviewer</th>
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {isLoading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-5 text-center text-on-surface-variant text-sm">Loading teams...</td>
                    </tr>
                  )}
                  {!isLoading && teams.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-5 text-center text-on-surface-variant text-sm">No teams have been formed yet.</td>
                    </tr>
                  )}
                  {!isLoading && teams.map(t => {
                    const memberCount = t.member_ids?.length || 0;
                    const coverageScore = Math.round(t.coverage_score || 0);
                    const healthStatus = memberCount >= 4 ? 'Healthy' : memberCount > 0 ? 'Recruiting' : 'At Risk';
                    const healthColor = healthStatus === 'Healthy' ? 'bg-primary' : healthStatus === 'Recruiting' ? 'bg-secondary' : 'bg-error';
                    const healthBg = healthStatus === 'Healthy' ? 'bg-primary/10 text-primary' : healthStatus === 'Recruiting' ? 'bg-secondary-container/30 text-on-secondary-container' : 'bg-error-container/30 text-error';
                    const initials = t.name ? t.name.charAt(0).toUpperCase() : '?';
                    
                    const teamSubmission = submissions.find(s => s.team_id === t.team_id);

                    return (
                      <tr key={t.team_id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary-container/20 text-primary flex items-center justify-center font-bold">{initials}</div>
                            <span className="font-bold text-on-surface">{t.name || 'Unnamed Team'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-on-surface font-medium text-[14px]">{memberCount}/4</span>
                            <div className="flex -space-x-2">
                              {Array.from({ length: Math.min(memberCount, 4) }).map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded-full border border-white bg-slate-300 flex items-center justify-center overflow-hidden">
                                  <span className="material-symbols-outlined text-[12px] text-white">person</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 w-16 bg-surface-container-highest rounded-full overflow-hidden shrink-0">
                              <div className={`h-full w-[${coverageScore}%]`} style={{ backgroundColor: coverageScore > 50 ? '#49635F' : '#BA1A1A', width: `${coverageScore}%` }}></div>
                            </div>
                            <span className={`text-[12px] font-bold ${coverageScore > 50 ? 'text-primary' : 'text-error'}`}>{coverageScore}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[14px] font-medium text-on-surface-variant truncate block max-w-[140px]" title={teamSubmission?.title || 'No submission'}>{teamSubmission?.title || 'Pending Submission'}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`${healthBg} px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit whitespace-nowrap`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${healthColor}`}></span>
                            {healthStatus}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-[12px] font-bold ${teamSubmission ? 'text-on-surface-variant' : 'text-error italic'}`}>{teamSubmission ? 'Pending Assignment' : 'Unassigned'}</span>
                        </td>
                        <td className="px-6 py-5">
                          <button className="text-primary hover:underline font-bold text-[12px]">Manage</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
              <span className="text-[12px] font-bold text-on-surface-variant">Showing 1-{Math.min(teams.length, 10)} of {teams.length} teams</span>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg hover:bg-surface-container-low"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                <button className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded-lg text-[14px] font-medium">1</button>
                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg hover:bg-surface-container-low text-[14px] font-medium">2</button>
                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg hover:bg-surface-container-low text-[14px] font-medium">3</button>
                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg hover:bg-surface-container-low"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Panel (Insights) */}
        <aside className="xl:col-span-3 space-y-6">
          {/* Team Health Analysis */}
          <div className="bg-white p-6 rounded-[24px] border border-outline-variant/20 shadow-sm">
            <h5 className="font-headline-sm text-[24px] font-bold mb-4">Ecosystem Health</h5>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">diversity_3</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] font-bold text-on-surface-variant">Skill Diversity</span>
                    <span className="text-[12px] font-bold">High (84%)</span>
                  </div>
                  <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[84%]"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined">hourglass_empty</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] font-bold text-on-surface-variant">Waitlisted Members</span>
                    <span className="text-[12px] font-bold">42 People</span>
                  </div>
                  <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[60%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>


</aside>
          {/* Pro-Tip Card */}
          

      {/* Floating Action Button (for global action) */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <button className="w-14 h-14 bg-tertiary text-on-tertiary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group relative">
          <span className="material-symbols-outlined text-3xl">chat</span>
          <span className="absolute right-full mr-4 bg-surface text-on-surface px-3 py-1 rounded shadow text-[12px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Contact All Leads</span>
        </button>
      </div>
    </div>
    </div>
  );
}
