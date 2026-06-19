"use client";

import { useState } from "react";

export default function HackathonRegistrations() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      <style jsx>{`
        .organic-shadow { box-shadow: 0 20px 30px -10px rgba(214, 203, 191, 0.4); }
      `}</style>

      {/* Header Section */}
      <section className="mb-12">
        <h1 className="font-headline-md text-[32px] text-on-surface mb-2 font-bold">Registrations</h1>
        <p className="font-body-md text-[16px] text-on-surface-variant max-w-2xl">Manage and verify applicant data for the upcoming winter hackathon. Use the risk score to identify potential duplicate accounts.</p>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[24px] organic-shadow border border-outline-variant/30 group hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <span className="material-symbols-outlined">group_add</span>
            </div>
            <span className="text-[12px] text-primary font-bold">+12% vs last week</span>
          </div>
          <p className="font-label-md text-[14px] text-on-surface-variant uppercase tracking-widest font-medium">Total Registrations</p>
          <h3 className="font-headline-md text-[32px] font-bold mt-1">1,240</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] organic-shadow border border-outline-variant/30 group hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
          <p className="font-label-md text-[14px] text-on-surface-variant uppercase tracking-widest font-medium">Approved</p>
          <h3 className="font-headline-md text-[32px] font-bold mt-1">850</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] organic-shadow border border-outline-variant/30 group hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-tertiary-container/30 rounded-xl text-tertiary">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          <p className="font-label-md text-[14px] text-on-surface-variant uppercase tracking-widest font-medium">Pending Review</p>
          <h3 className="font-headline-md text-[32px] font-bold mt-1">378</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] organic-shadow border border-error-container/50 group hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-error-container/50 rounded-xl text-error">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <span className="text-[12px] text-error font-bold">Action Needed</span>
          </div>
          <p className="font-label-md text-[14px] text-on-surface-variant uppercase tracking-widest font-medium">Duplicate Flags</p>
          <h3 className="font-headline-md text-[32px] font-bold mt-1 text-error">12</h3>
        </div>
      </section>

      {/* Main Content Layout (Flex for Sidebar) */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 overflow-hidden min-w-0">
          {/* Filter Bar */}
          <div className="flex items-center gap-6 mb-6 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span><span className="text-label-sm text-[12px] font-bold">842 Verified</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary"></span><span className="text-label-sm text-[12px] font-bold">378 Pending</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-error"></span><span className="text-label-sm text-[12px] font-bold">12 High Risk</span></div>
          </div>
          
          <div className="bg-surface-container rounded-[24px] p-4 mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="relative mr-2">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input className="pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-full text-[12px] font-medium focus:ring-1 focus:ring-primary outline-none w-80" placeholder="Search Name, Email, College, GitHub..." type="text"/>
              </div>
              <span className="text-[14px] font-bold text-on-surface-variant ml-2">Filters:</span>
              <select className="bg-white border border-outline-variant rounded-full text-[12px] font-medium px-4 py-2 outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                <option>Status: All</option>
                <option>Status: Approved</option>
                <option>Status: Pending</option>
              </select>
              <select className="bg-white border border-outline-variant rounded-full text-[12px] font-medium px-4 py-2 outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                <option>Risk: All</option>
                <option>Risk: High</option>
                <option>Risk: Low</option>
              </select>
              <select className="bg-white border border-outline-variant rounded-full text-[12px] font-medium px-4 py-2 outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                <option>College: All</option>
                <option>Stanford University</option>
                <option>MIT</option>
              </select>
            </div>
            <button className="ml-auto text-primary font-bold text-[12px] hover:underline">Clear All</button>
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-outline-variant/30">
              <span className="text-[12px] font-bold text-on-surface-variant">Bulk:</span>
              <button className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[12px] font-bold hover:bg-primary hover:text-white transition-all">Approve</button>
              <button className="px-3 py-1 bg-error/10 text-error rounded-full text-[12px] font-bold hover:bg-error hover:text-white transition-all">Reject</button>
              <button className="px-3 py-1 border border-outline-variant text-on-surface-variant rounded-full text-[12px] font-bold hover:bg-white transition-all">Export</button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-[24px] organic-shadow border border-outline-variant/30 overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant font-medium">Name</th>
                  <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant font-medium">College</th>
                  <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant font-medium">Contact</th>
                  <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant font-medium">Verification</th>
                  <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant font-medium">Risk Score</th>
                  <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant font-medium">Status</th>
                  <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                <tr className="hover:bg-surface-container-lowest transition-colors cursor-pointer group" onClick={() => setDrawerOpen(true)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container/30 overflow-hidden ring-2 ring-primary/20 shrink-0">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATwcA3gydufntwyYcntq0vXlY517-r1Yo8G-sAkGVBFrBEcGnDHJqxDYG8CSrb2D9CFgGTQEUvEtGiHVxxB2mvgRtzXAg2LGJqJEcD9_6r2mZmCLKkld5btOF5FS5jDfcikEUaYYMB-ED_6HoDxrf2DctYIJX8V18U5JEXZgmjjaPhNhyCpZOC3gTgZd3MTpzcEO2HvlXZuIPDvKlHQFAX84nuMqRU_Z7NINuLNyztIg_kUe5bS_--f4rpy75jYlOJ6-vR5ockiGo" alt="Applicant" />
                      </div>
                      <div>
                        <p className="font-label-md text-[14px] font-bold">Alex Chen</p>
                        <p className="text-[12px] text-on-surface-variant">alex.c@stanford.edu</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-label-md text-[14px]">Stanford University</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 text-primary">
                      <span className="material-symbols-outlined text-[20px] cursor-pointer hover:opacity-70">mail</span>
                      <span className="material-symbols-outlined text-[20px] cursor-pointer hover:opacity-70">code</span>
                      <span className="material-symbols-outlined text-[20px] cursor-pointer hover:opacity-70">link</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                      <span className="text-[12px] font-bold text-primary whitespace-nowrap">Face ID Match</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-bold text-error whitespace-nowrap">92% Similarity</span>
                      <div className="w-12 h-1.5 bg-outline-variant rounded-full overflow-hidden shrink-0">
                        <div className="bg-error h-full w-[92%]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-secondary-container/50 text-on-secondary-container text-[12px] font-bold rounded-full whitespace-nowrap">Pending Review</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-surface-container rounded-full text-primary" title="View Profile"><span className="material-symbols-outlined text-[20px]">visibility</span></button>
                      <button className="p-2 hover:bg-surface-container rounded-full text-primary" title="Review Resume"><span className="material-symbols-outlined text-[20px]">description</span></button>
                      <button className="p-2 hover:bg-surface-container rounded-full text-error" title="View Duplicate Analysis"><span className="material-symbols-outlined text-[20px]">analytics</span></button>
                    </div>
                  </td>
                </tr>
                {/* Second Row */}
                <tr className="hover:bg-surface-container-lowest transition-colors cursor-pointer group" onClick={() => setDrawerOpen(true)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container/30 overflow-hidden ring-2 ring-primary/20 shrink-0">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB22dF10e1pJhval4Ud-6xyD8z9VUhhuY2owf6RX5wQeozg_mslSjxHOOz4yVj2k_4C4teHoCzgg0Ry96XKI-S2T8KinE9kkKVi3zTWB7QAMo3KqnVEcB6i9h_aIekHnOP4J8KpXcuC17iENSwEfLEljNyNG1Q3lTgCU86xBVTvVsijyzdv8XHD-KjtULLySyYCVPpo5AMjfzT-pWNofh8D3pVMVgjNvMU7PBfe-hgPBn6iKR3yKX5XLckFln3qPIuPQdlt1zh1-dg" alt="Applicant" />
                      </div>
                      <div>
                        <p className="font-label-md text-[14px] font-bold">Maya Rodriguez</p>
                        <p className="text-[12px] text-on-surface-variant">maya.r@mit.edu</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-label-md text-[14px]">MIT</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 text-primary">
                      <span className="material-symbols-outlined text-[20px] cursor-pointer hover:opacity-70">mail</span>
                      <span className="material-symbols-outlined text-[20px] cursor-pointer hover:opacity-70">code</span>
                      <span className="material-symbols-outlined text-[20px] cursor-pointer hover:opacity-70">link</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                      <span className="text-[12px] font-bold text-primary whitespace-nowrap">Face ID Match</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-bold text-on-surface-variant whitespace-nowrap">4% Similarity</span>
                      <div className="w-12 h-1.5 bg-outline-variant rounded-full overflow-hidden shrink-0">
                        <div className="bg-primary h-full w-[4%]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[12px] font-bold rounded-full whitespace-nowrap">Approved</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-4 py-1.5 border border-primary text-primary rounded-full text-[14px] font-medium hover:bg-primary hover:text-on-primary transition-all">Review</button>
                  </td>
                </tr>
                {/* Dummy row 1 */}
                <tr className="hover:bg-surface-container-lowest transition-colors cursor-pointer group opacity-70">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest shrink-0"></div>
                      <div>
                        <p className="font-label-md text-[14px] font-bold">Liam Smith</p>
                        <p className="text-[12px]">l.smith@berkeley.edu</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-label-md text-[14px]">UC Berkeley</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 text-primary/40">
                      <span className="material-symbols-outlined">mail</span>
                      <span className="material-symbols-outlined">code</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[12px] text-outline font-medium">Skipped</td>
                  <td className="px-6 py-4 font-label-md text-[14px]">12%</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[12px] font-bold rounded-full">Approved</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-4 py-1.5 border border-outline-variant text-outline rounded-full text-[14px] font-medium">Review</button>
                  </td>
                </tr>
                {/* Dummy row 2 */}
                <tr className="hover:bg-surface-container-lowest transition-colors cursor-pointer group opacity-70">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest shrink-0"></div>
                      <div>
                        <p className="font-label-md text-[14px] font-bold">Saira Khan</p>
                        <p className="text-[12px]">s.khan@oxford.ac.uk</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-label-md text-[14px]">Oxford University</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 text-primary/40">
                      <span className="material-symbols-outlined">mail</span>
                      <span className="material-symbols-outlined">code</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[12px] text-primary font-medium">Verified</td>
                  <td className="px-6 py-4 font-label-md text-[14px]">21%</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-[12px] font-bold rounded-full">Pending</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-4 py-1.5 border border-outline-variant text-outline rounded-full text-[14px] font-medium">Review</button>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div className="p-6 bg-surface-container-low flex justify-between items-center border-t border-outline-variant">
              <p className="font-label-sm text-[12px] text-on-surface-variant font-medium">Showing 1-10 of 1,240 registrations</p>
              <div className="flex gap-2">
                <button className="p-2 border border-outline-variant rounded-full hover:bg-white transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
                <button className="px-4 py-2 bg-primary text-on-primary rounded-full text-[12px] font-bold">1</button>
                <button className="px-4 py-2 border border-outline-variant rounded-full text-[12px] font-bold hover:bg-white transition-colors">2</button>
                <button className="px-4 py-2 border border-outline-variant rounded-full text-[12px] font-bold hover:bg-white transition-colors">3</button>
                <button className="p-2 border border-outline-variant rounded-full hover:bg-white transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
              </div>
            </div>
          </div>
        </div>

        {/* Duplicate Detection Panel (Sidebar) */}
        <aside className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
          <div className="bg-error-container/20 border border-error/20 p-6 rounded-[24px] xl:sticky xl:top-24">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-error">
                <span className="material-symbols-outlined">security</span>
                <h4 className="font-headline-sm text-[24px] font-bold">Risk Analysis</h4>
              </div>
              <div className="text-right">
                <p className="text-[20px] font-bold text-error">92/100</p>
                <p className="text-[10px] text-error uppercase font-bold">Confidence</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error">person</span>
                </div>
                <div>
                  <p className="text-[14px] font-bold">Alex Chen</p>
                  <p className="text-[12px] text-error">High Duplicate Risk</p>
                </div>
              </div>
              
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Match Sources</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg border border-error/10">
                  <span className="text-[12px] font-medium">Resume Match</span>
                  <span className="px-2 py-0.5 bg-error text-white text-[10px] rounded-full">92%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg border border-error/10">
                  <span className="text-[12px] font-medium">GitHub Match</span>
                  <span className="px-2 py-0.5 bg-error text-white text-[10px] rounded-full">High</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg border border-outline-variant/30">
                  <span className="text-[12px] font-medium">College Match</span>
                  <span className="px-2 py-0.5 bg-outline-variant text-on-surface-variant text-[10px] rounded-full">None</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg border border-outline-variant/30">
                  <span className="text-[12px] font-medium">Email Match</span>
                  <span className="px-2 py-0.5 bg-outline-variant text-on-surface-variant text-[10px] rounded-full">None</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
              <p className="text-[14px] font-medium italic text-on-surface mb-3">"Flag for manual review. High probability of cross-submission across regional chapters."</p>
              <button className="w-full py-2 bg-error text-on-primary rounded-xl text-[14px] font-medium hover:bg-error/90 transition-colors">Flag as Duplicate</button>
            </div>
            <button className="w-full py-2 border border-outline text-on-surface-variant rounded-xl text-[14px] font-medium hover:bg-white transition-colors">Whitelist Participant</button>
          </div>
        </aside>
      </div>

      {/* Participant Details Drawer (Overlay) */}
      <div className={`fixed inset-0 z-50 ${drawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div 
          className={`absolute inset-0 bg-on-surface/20 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setDrawerOpen(false)}
        ></div>
        
        <div className={`absolute right-0 top-0 h-screen w-full sm:w-[480px] bg-white shadow-2xl transition-transform duration-500 ease-in-out p-8 flex flex-col ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-start mb-8">
            <button className="p-2 hover:bg-surface-container rounded-full transition-colors" onClick={() => setDrawerOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex gap-2">
              <button className="px-6 py-2 border border-outline text-on-surface-variant rounded-full text-[14px] font-medium">Reject</button>
              <button className="px-6 py-2 bg-primary text-on-primary rounded-full text-[14px] font-medium shadow-lg shadow-primary/20">Approve</button>
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 rounded-[32px] overflow-hidden mb-4 ring-4 ring-surface-container">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5yvDqg6JpNKK0DUsHPsfv48pcVmMHxLG711gnPaHTubnW7CVPGfTCzctD_hMKsYieDO3coE6cTpk4_KKkoJoExQhweZjucfrjmm6WAPFd224942oUsKuweUR1q6WVyaWICh7GcZRvU6_tqUlZGsHBZrV0vDQaoncX7Mi0fMSAqYdKykKG7QMHAeV_nL5TBsGBcfPH7xGgYSQCL37cYW-FU-4QyB3Q4afh0Td5t1OD8gHa2KbIW17ZEWPrQCcRTT_tIpSBvGiCsso" alt="Student" />
            </div>
            <h3 className="font-headline-md text-[32px] font-bold">Alex Chen</h3>
            <p className="text-on-surface-variant text-[14px] font-medium">Stanford University • Computer Science</p>
            <div className="flex gap-3 mt-4">
              <span className="px-3 py-1 bg-secondary-container/50 text-on-secondary-container rounded-full text-[12px] font-bold">Python</span>
              <span className="px-3 py-1 bg-secondary-container/50 text-on-secondary-container rounded-full text-[12px] font-bold">React</span>
              <span className="px-3 py-1 bg-secondary-container/50 text-on-secondary-container rounded-full text-[12px] font-bold">Solidity</span>
            </div>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-surface-container-low p-5 rounded-[24px]">
              <h4 className="text-[14px] font-bold mb-4 uppercase tracking-widest text-on-surface-variant">Verification Status</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                  <span className="text-[14px] font-medium">Face ID Check</span>
                  <span className="text-primary font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">check_circle</span> Match Found</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                  <span className="text-[14px] font-medium">Email Verification</span>
                  <span className="text-primary font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">check_circle</span> Verified</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[14px] font-medium">Resume Parsing</span>
                  <span className="text-on-surface-variant font-bold">Parsed Successfully</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-[14px] font-bold mb-4 uppercase tracking-widest text-on-surface-variant">Registration Timeline</h4>
              <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/30">
                <div className="flex gap-4 items-start relative">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10"><span className="material-symbols-outlined text-white text-[14px]">check</span></div>
                  <div><p className="text-[12px] font-bold">Registered</p><p className="text-[10px] text-on-surface-variant">Oct 24, 2023 • 14:20</p></div>
                </div>
                <div className="flex gap-4 items-start relative">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10"><span className="material-symbols-outlined text-white text-[14px]">check</span></div>
                  <div><p className="text-[12px] font-bold">Email Verified</p><p className="text-[10px] text-on-surface-variant">Oct 24, 2023 • 14:22</p></div>
                </div>
                <div className="flex gap-4 items-start relative">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10"><span className="material-symbols-outlined text-white text-[14px]">check</span></div>
                  <div><p className="text-[12px] font-bold">Face ID Match</p><p className="text-[10px] text-on-surface-variant">Oct 24, 2023 • 14:25</p></div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-[14px] font-bold mb-4 uppercase tracking-widest text-on-surface-variant">Resume Preview</h4>
              <div className="w-full aspect-[3/4] bg-surface-container rounded-[24px] border border-outline-variant overflow-hidden relative group">
                <img className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC230ro6jsi1MIdo6_FinpA_mYipP7VxM33ssVBfPz94Tn94jqUpzP1zXkPyG1fsS7Ehm0j0Rru-j7MkLV3TU-cn4qOI_Grc5ZaCR_FnH0OnCcgj-Tq3ujlshhaDaR8UlpDF3gWqi4_8vI95AI-t1v-6nBksWyHXZJ9e9X_TZVPZr0awPlAdq-9Nw78h1XW2PYRY3pMkkapbjZU99L04uxYF26ZjGl30_lqVa6zr67P9Uu-sAR1u-QEsAAXxTetZp9d8n-Gi-m20y4" alt="Resume" />
                <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="material-symbols-outlined text-white text-4xl">visibility</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-[14px] font-bold mb-4 uppercase tracking-widest text-on-surface-variant">Social Links</h4>
              <div className="grid grid-cols-2 gap-4">
                <a className="flex items-center gap-3 p-3 bg-white border border-outline-variant rounded-xl hover:border-primary transition-colors" href="#">
                  <span className="material-symbols-outlined text-primary">terminal</span>
                  <span className="text-[12px] font-bold">GitHub</span>
                </a>
                <a className="flex items-center gap-3 p-3 bg-white border border-outline-variant rounded-xl hover:border-primary transition-colors" href="#">
                  <span className="material-symbols-outlined text-primary">share</span>
                  <span className="text-[12px] font-bold">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
