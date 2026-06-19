"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function OrganizerTeams() {
  useEffect(() => {
    // Simple micro-interaction for hover states on metrics
    document.querySelectorAll('.bento-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        (card as HTMLElement).style.borderColor = 'rgba(73, 99, 95, 0.4)';
        (card as HTMLElement).style.transform = 'translateY(-4px)';
      });
      card.addEventListener('mouseleave', () => {
        (card as HTMLElement).style.borderColor = 'rgba(193, 200, 198, 0.2)';
        (card as HTMLElement).style.transform = 'translateY(0)';
      });
    });
  }, []);

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
      <style jsx>{`
        .bento-card {
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
      `}</style>
      
      {/* Page Header */}
      <div className="mb-12 flex justify-between items-end">
        <div>
          <p className="font-label-md text-[14px] text-primary tracking-widest uppercase mb-2">Management Console</p>
          <h3 className="font-headline-md text-[32px]">Teams Ecosystem</h3>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-outline-variant/30 text-on-surface-variant px-4 py-2 rounded-xl flex items-center gap-2 font-label-md hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Advanced Filters
          </button>
          <button className="bg-primary text-on-primary px-5 py-2 rounded-xl flex items-center gap-2 font-label-md shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create Team
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant font-label-sm uppercase mb-2 text-[12px]">Total Teams</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-on-surface">124</span>
            <span className="text-[12px] text-primary">+12%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant font-label-sm uppercase mb-2 text-[12px]">Recruiting</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-secondary">38</span>
            <span className="text-[12px] text-secondary/60">Open</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant font-label-sm uppercase mb-2 text-[12px]">Complete</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-primary">86</span>
            <span className="text-[12px] text-primary/60">Ready</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant font-label-sm uppercase mb-2 text-[12px]">Missing Skills</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-error">14</span>
            <span className="text-[12px] text-error/60">Urgent</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant font-label-sm uppercase mb-2 text-[12px]">Submissions</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-on-surface">42</span>
            <span className="text-[12px] text-primary">34%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant font-label-sm uppercase mb-2 text-[12px]">Pending Review</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-tertiary">29</span>
            <span className="text-[12px] text-tertiary/60">New</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Content Column */}
        <div className="md:col-span-9 space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input className="w-full bg-surface-container-low border-none rounded-xl pl-10 py-3 text-[14px] focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Search Team Name, Member, or Problem Statement..." type="text" />
            </div>
            <select className="bg-surface-container-low border-none rounded-xl px-4 py-3 text-[14px] focus:ring-2 focus:ring-primary/20 text-on-surface-variant">
              <option>All Statuses</option>
              <option>Healthy</option>
              <option>Recruiting</option>
              <option>At Risk</option>
            </select>
            <select className="bg-surface-container-low border-none rounded-xl px-4 py-3 text-[14px] focus:ring-2 focus:ring-primary/20 text-on-surface-variant">
              <option>All Problem Statements</option>
              <option>Sustainability Tech</option>
              <option>Circular Economy</option>
              <option>Urban Agri-tech</option>
            </select>
            <button className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">tune</span>
            </button>
          </div>

          {/* Featured Team Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-[24px] border border-outline-variant/20 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4"><span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Featured</span></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">eco</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-[24px] leading-tight">Green Ledger</h4>
                  <p className="text-[12px] text-on-surface-variant">Circular Economy</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[11px]">
                  <span className="text-on-surface-variant">Reviewer:</span>
                  <span className="font-bold">Sarah J.</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-on-surface-variant">Status:</span>
                  <span className="text-primary font-bold">Submitted</span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-label-sm text-[12px] text-on-surface-variant">Coverage</span>
                    <span className="text-label-sm text-[12px] font-bold text-primary">94%</span>
                  </div>
                  <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '94%' }}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-3">
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGQfV_lpUGAxNghwOcbvD05yQQzpOixOHOuZsPkbLEIv2eUZjJKg7pXjGS2pB0D8KOCdphpZeBdWX52rlFTldaUkKZnDy1RkS1ZRhoXrU8oW-ZIxO4Tkdy6fZA1BZ54l4b0QHZDzS33x1KJie1BS694uooIg732aojO2qztj8WYiC6sHScGequBkjWlh-icMQsFllcU-xGgVwJ_3RsFGBPWw-GENeKsZQULu3Wm4MLG6yHFMb4-A1iA3ujxy936fupkaEJ4I4G8-k" alt="Avatar" />
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC140TnSrthwFKePMO9zuVwI_0Rr-FJ-Jb1UJlmIzqIqX3sfq974eq3oDtopWgU7Ho9VFCBl2zJJ5Kg5gus2DfDC5ZRSNxlnWyIQWzptDtjsAT3RKi7qiW6nniT3V-Epjk8ivFCWv1kNw8oPevp3XetqBJVCLJbQwQERda5PRvw3euzp_DWw_z2tyiF3AUAoKPUHh-aXs56p3Yowc1rouQeed6ljKEEiKSk-kDX8Wk9iCvT7Q0Goq-sR0AoZk6zZ_rokGBYV6ld2b4" alt="Avatar" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">+2</div>
                </div>
                <button className="text-primary font-bold text-[11px] hover:underline">View Team</button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-[24px] border border-outline-variant/20 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-3xl">electric_car</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-[24px] leading-tight">Volt Stream</h4>
                  <p className="text-[12px] text-on-surface-variant">Urban Agri-tech</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[11px]">
                  <span className="text-on-surface-variant">Reviewer:</span>
                  <span className="font-bold">Marcus K.</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-on-surface-variant">Status:</span>
                  <span className="text-secondary font-bold">Drafting</span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-label-sm text-[12px] text-on-surface-variant">Coverage</span>
                    <span className="text-label-sm text-[12px] font-bold text-secondary">72%</span>
                  </div>
                  <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-3">
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoH04CuL5b--4sUDKNcLXj-gK9CqxaA9j-MvtZCmCRHK6ksTHNaSRfhL5zfXxjBoXgDaTpCbMgjneupqxMo7OU6Rl0VwgjTbYL4tqnGxQi-t8RMBzQlIwpwAyenUEMlD_QhcHyRFQ6nP0tkp0s_GaRyXEs6dDsJtLhWKmKy8qOqLoCbtJqbQ8XlLlWX3gx-F8_QenUlqanizfRY52nLpJXkHoMBVnxbETT07Yj9_4GY812ihHg4E-yCHvSV2x0Gz81Wv0gfb2ocOA" alt="Avatar" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container">+1</div>
                </div>
                <button className="text-primary font-bold text-[11px] hover:underline">View Team</button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-[24px] border border-outline-variant/20 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-3xl">psychology</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-[24px] leading-tight">Mind Meld</h4>
                  <p className="text-[12px] text-on-surface-variant">Sustainability Tech</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[11px]">
                  <span className="text-on-surface-variant">Reviewer:</span>
                  <span className="font-bold">Unassigned</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-on-surface-variant">Status:</span>
                  <span className="text-tertiary font-bold">In Review</span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-label-sm text-[12px] text-on-surface-variant">Coverage</span>
                    <span className="text-label-sm text-[12px] font-bold text-tertiary">88%</span>
                  </div>
                  <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary" style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-3">
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqZSCAcVoWVEnbXmZseHMNWKH824Nrek4hj2IGDB3Na6X4U3dfPCRcymkVZy4I0KKR2ThNeCuqUYmokcsiR7pjgIsXIEAjPRvk2SoE_omk4aOxTZetIvwLtmQrkD9Cqvv71kjBJ0GyZUH3_ziGwF0kq5XQn_J6ESEkdzbcZoBJyHKnHH477N6boXJZcxbAOhAwcggTJrSCv4imLbJujA-wGNDT22hsbuUBGXYB8yvNpzaTS48w10KJwm4az3fOVean1Kn9iDrekxc" alt="Avatar" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-tertiary-container flex items-center justify-center text-[10px] font-bold">+3</div>
                </div>
                <button className="text-primary font-bold text-[11px] hover:underline">View Team</button>
              </div>
            </div>
          </div>

          {/* Main Team Table */}
          <div className="bg-white rounded-[24px] border border-outline-variant/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/20">
                    <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant uppercase tracking-wider">Team Name</th>
                    <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant uppercase tracking-wider">Members</th>
                    <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant uppercase tracking-wider">Coverage Score</th>
                    <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant uppercase tracking-wider">Problem Statement</th>
                    <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant uppercase tracking-wider">Reviewer Assigned</th>
                    <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant uppercase tracking-wider">Submission Status</th>
                    <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant uppercase tracking-wider">Team Health</th>
                    <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {/* Row 1 */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary-container/20 text-primary flex items-center justify-center font-bold">A</div>
                        <span className="font-bold text-on-surface">AquaLoop</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface font-medium">4/5</span>
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border border-white bg-slate-200"></div>
                          <div className="w-6 h-6 rounded-full border border-white bg-slate-300"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 w-16 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '82%' }}></div>
                        </div>
                        <span className="text-[12px] font-bold text-primary">82%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[14px] text-on-surface-variant truncate block max-w-[140px]">Water Recycling AI</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[12px] text-on-surface-variant">Marcus Weber</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-[11px] font-bold">Submitted</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-secondary-container/30 text-on-secondary-container px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>Recruiting
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">visibility</span></button>
                        <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">person_add</span></button>
                        <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">description</span></button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Row 2 */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-tertiary-container/20 text-tertiary flex items-center justify-center font-bold">B</div>
                        <span className="font-bold text-on-surface">BioTrace</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface font-medium">5/5</span>
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border border-white bg-slate-200"></div>
                          <div className="w-6 h-6 rounded-full border border-white bg-slate-300"></div>
                          <div className="w-6 h-6 rounded-full border border-white bg-slate-400"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 w-16 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '98%' }}></div>
                        </div>
                        <span className="text-[12px] font-bold text-primary">98%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[14px] text-on-surface-variant truncate block max-w-[140px]">Carbon Tracker IoT</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[12px] text-on-surface-variant">Dr. Sarah Chen</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-tertiary/10 text-tertiary px-2 py-1 rounded-full text-[11px] font-bold">Under Review</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Healthy
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">visibility</span></button>
                        <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">person_add</span></button>
                        <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">description</span></button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-error-container/20 text-error flex items-center justify-center font-bold">X</div>
                        <span className="font-bold text-on-surface">X-Grid</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface font-medium">2/5</span>
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border border-white bg-slate-200"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 w-16 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-error" style={{ width: '34%' }}></div>
                        </div>
                        <span className="text-[12px] font-bold text-error">34%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[14px] text-on-surface-variant truncate block max-w-[140px]">Smart Grid Optimization</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-surface-container-highest text-on-surface-variant px-2 py-1 rounded-full text-[11px] font-bold italic">Unassigned</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-surface-container-highest text-on-surface-variant px-2 py-1 rounded-full text-[11px] font-bold">Draft</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-error-container/30 text-error px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>At Risk
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">visibility</span></button>
                        <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">person_add</span></button>
                        <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">description</span></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
              <span className="text-[12px] text-on-surface-variant">Showing 1-10 of 124 teams</span>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg hover:bg-surface-container-low"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                <button className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded-lg">1</button>
                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg hover:bg-surface-container-low">2</button>
                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg hover:bg-surface-container-low">3</button>
                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg hover:bg-surface-container-low"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Panel (Insights) */}
        <aside className="md:col-span-3 space-y-6">
          {/* Team Health Analysis */}
          <div className="bg-white p-6 rounded-[24px] border border-outline-variant/20 shadow-sm">
            <h5 className="font-headline-sm text-[24px] mb-4">Ecosystem Health</h5>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">diversity_3</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] text-on-surface-variant">Skill Diversity</span>
                    <span className="text-[12px] font-bold">High (84%)</span>
                  </div>
                  <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '84%' }}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">hourglass_empty</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] text-on-surface-variant">Waitlisted Members</span>
                    <span className="text-[12px] font-bold">42 People</span>
                  </div>
                  <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Insights List */}
          <div className="bg-white p-6 rounded-[24px] border border-outline-variant/20 shadow-sm">
            <h5 className="font-label-md text-[14px] font-bold uppercase tracking-widest text-on-surface-variant mb-6 border-b border-outline-variant/10 pb-4">Urgent Attention</h5>
            <div className="space-y-6">
              {/* Section: Needing Members */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h6 className="font-bold text-[14px]">Open Roles</h6>
                  <span className="text-secondary font-bold text-[12px]">12 Teams</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 p-2 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer group">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-1.5"></div>
                    <div>
                      <p className="text-[14px] font-bold group-hover:text-primary">Data Dynamics</p>
                      <p className="text-[11px] text-on-surface-variant">Needs: Backend Engineer, ML Specialist</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-2 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer group">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-1.5"></div>
                    <div>
                      <p className="text-[14px] font-bold group-hover:text-primary">Solar Sync</p>
                      <p className="text-[11px] text-on-surface-variant">Needs: UI Designer</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Section: Missing Submissions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h6 className="font-bold text-[14px]">Incomplete Data</h6>
                  <span className="text-error font-bold text-[12px]">8 Teams</span>
                </div>
                <div className="p-3 bg-error-container/10 border border-error/10 rounded-xl">
                  <p className="text-[12px] text-on-surface-variant leading-relaxed mb-2">The following teams are missing <span className="font-bold text-error">Problem Statements</span> and cannot be assigned reviewers.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white border border-outline-variant/20 px-2 py-1 rounded text-[10px] font-bold">Team Alpha</span>
                    <span className="bg-white border border-outline-variant/20 px-2 py-1 rounded text-[10px] font-bold">Orbit-X</span>
                    <span className="bg-white border border-outline-variant/20 px-2 py-1 rounded text-[10px] font-bold">EcoWave</span>
                  </div>
                </div>
              </div>

              {/* Section: Reviewer Load */}
              <div>
                <h6 className="font-bold text-[14px] mb-3">Reviewer Load</h6>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[12px]">
                    <span>Avg. Teams / Reviewer</span>
                    <span className="font-bold">4.2</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span>Unassigned Teams</span>
                    <span className="text-error font-bold">18</span>
                  </div>
                  <button className="w-full mt-2 py-2 border border-tertiary/30 text-tertiary rounded-xl font-bold text-[12px] hover:bg-tertiary/5 transition-colors">
                    Auto-Balance Reviews
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pro-Tip Card */}
          <div className="bg-primary p-6 rounded-[24px] text-on-primary shadow-xl shadow-primary/10 relative overflow-hidden">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-[32px] mb-4">lightbulb</span>
              <h6 className="font-headline-sm text-[20px] mb-2 leading-tight">Matchmaking Insight</h6>
              <p className="text-[12px] opacity-90 leading-relaxed mb-4">We found 8 registered developers with ML skills who haven't joined a team yet. "AquaLoop" is currently looking for exactly that profile.</p>
              <button className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-[12px] hover:bg-surface-container-low transition-colors">Run Matchmaker</button>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
              <span className="material-symbols-outlined text-[160px]">insights</span>
            </div>
          </div>
        </aside>
      </div>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <button className="w-14 h-14 bg-tertiary text-on-tertiary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group">
          <span className="material-symbols-outlined text-3xl">chat</span>
          <span className="absolute right-full mr-4 bg-surface text-on-surface px-3 py-1 rounded shadow text-[12px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Contact All Leads</span>
        </button>
      </div>
    </div>
  );
}
