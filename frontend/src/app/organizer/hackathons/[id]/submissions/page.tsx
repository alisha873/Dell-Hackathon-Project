"use client";

export default function HackathonSubmissions() {
  return (
    <div className="p-8 max-w-[1280px] mx-auto min-h-screen">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h3 className="font-headline-md text-[32px] font-bold">Submission Register</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Side: Main Column (Submissions & Table) */}
        <div className="xl:col-span-9 space-y-12">
          {/* Metrics Row */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20 hover:-translate-y-1 transition-transform">
              <p className="text-[12px] font-bold text-outline uppercase tracking-wider mb-1">Total</p>
              <p className="text-[32px] font-bold text-primary">112</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20 hover:-translate-y-1 transition-transform">
              <p className="text-[12px] font-bold text-outline uppercase tracking-wider mb-1">Submitted</p>
              <p className="text-[32px] font-bold text-primary">86</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20 hover:-translate-y-1 transition-transform">
              <p className="text-[12px] font-bold text-outline uppercase tracking-wider mb-1">Draft</p>
              <p className="text-[32px] font-bold text-secondary">24</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20 hover:-translate-y-1 transition-transform">
              <p className="text-[12px] font-bold text-outline uppercase tracking-wider mb-1">Review</p>
              <p className="text-[32px] font-bold text-primary">18</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20 hover:-translate-y-1 transition-transform">
              <p className="text-[12px] font-bold text-outline uppercase tracking-wider mb-1">Evaluated</p>
              <p className="text-[32px] font-bold text-tertiary">12</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20 hover:-translate-y-1 transition-transform">
              <p className="text-[12px] font-bold text-error uppercase tracking-wider mb-1">Late</p>
              <p className="text-[32px] font-bold text-error">4</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20 hover:-translate-y-1 transition-transform">
              <p className="text-[12px] font-bold text-outline uppercase tracking-wider mb-1">Unassigned</p>
              <p className="text-[32px] font-bold text-primary">12</p>
            </div>
          </section>

          {/* Featured Submissions Row */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h3 className="font-headline-sm text-[24px] font-bold text-on-surface">Submission Highlights</h3>
              <a className="text-primary text-[14px] font-bold flex items-center gap-1 hover:underline cursor-pointer">
                View all analytics <span className="material-symbols-outlined text-[14px]">north_east</span>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-[24px] shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">Evaluated</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[32px] font-bold text-primary leading-none">9.2</span>
                    <span className="text-[10px] text-outline font-bold mt-1">Avg Score</span>
                  </div>
                </div>
                <h4 className="font-headline-sm text-[20px] font-bold mb-1">Carbon Tracker</h4>
                <p className="text-[14px] text-outline font-medium mb-6">Team EcoStream</p>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/20">
                  <img className="w-8 h-8 rounded-full border border-outline-variant/50 shrink-0 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB82qfMTaW5mRmxE8WmMk3yTahoxHDVH9ljwYxjfrRPu5u4022KLOO2CvApJy2c_l8d-d9948wdlIDWMTuCXv83Ap3HBjs5cWlQI9VGkoG6opk6CyRyUcO2mJz3PrKgjtAZ7fmQadaHoqR5LJ996lQRQRMZ5Amz9nVjEZ1zQQRFt6KPZyW0n5RIZ4alL-OHbmxo01Wvi3nciLNkY8y_t0P6ku2u3IwRYWUPzKlcFJVbMN5OFgVV7ouiV5ecGiSRf5PXQE_5UbuH5Jk" alt="Reviewer" />
                  <div className="flex flex-col">
                    <span className="text-[12px] text-outline font-medium">Reviewer</span>
                    <span className="text-[14px] font-bold">Dr. Aris Thorne</span>
                  </div>
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-white p-6 rounded-[24px] shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">Under Review</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[32px] font-bold text-tertiary leading-none">8.8</span>
                    <span className="text-[10px] text-outline font-bold mt-1">Curr. Avg</span>
                  </div>
                </div>
                <h4 className="font-headline-sm text-[20px] font-bold mb-1">AI Soil Health</h4>
                <p className="text-[14px] text-outline font-medium mb-6">Team TerraMind</p>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/20">
                  <img className="w-8 h-8 rounded-full border border-outline-variant/50 shrink-0 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQHBtwoJxsqTT9NV0kwdwFMg2BYbo_NgxQKORiBSuAFbpYsBP6Yn2kdow1vWWain3H4RzaoE0a3Aw1BTDenpI90K_eCAOE1tqoE6-gabC91KTtXHbaGI2ADtBRek9r2s9OJeUuGUQF2a06cJHvlpQCrCGQyeeROPF9kyh6XKK2lD9o-y0AxqH97UlFRm6Px1lcwzQqmXoyzzwU9e-swSDxzIn0nq-zPZ51BDZcuenugoFNOy4r-DECikbz4LShcv92dDGi4ln--WI" alt="Reviewer" />
                  <div className="flex flex-col">
                    <span className="text-[12px] text-outline font-medium">Reviewer</span>
                    <span className="text-[14px] font-bold">Sarah Jenkins</span>
                  </div>
                </div>
              </div>
              {/* Card 3 */}
              <div className="bg-white p-6 rounded-[24px] shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">Evaluated</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[32px] font-bold text-primary leading-none">9.5</span>
                    <span className="text-[10px] text-outline font-bold mt-1">Avg Score</span>
                  </div>
                </div>
                <h4 className="font-headline-sm text-[20px] font-bold mb-1">AquaFlow IoT</h4>
                <p className="text-[14px] text-outline font-medium mb-6">Team HydroPulse</p>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/20">
                  <img className="w-8 h-8 rounded-full border border-outline-variant/50 shrink-0 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC08LfaSrL3zYyBfe5EMpJTRv5k1e7a6MZSVwmES3eBi7ynIGWtZd23CPDndKjAaBhwAgjHcs-2x5bRLY942IwndqlCLZDN91qVJk31xVNHstb23oHKOs6IiiX-exfCLIl_CCz25UXgXfs-Tf-xfUey4jNWx_7lfis3hd7KnokDL4H0gvc_J6IL8bMkf0gixGJdilDS3CY6WQaei73ha85r6zGkScM9g8ECQLVxEq07TooaQS68AS0l-7fPwzLG-IXP925KgvBzT-A" alt="Reviewer" />
                  <div className="flex flex-col">
                    <span className="text-[12px] text-outline font-medium">Reviewer</span>
                    <span className="text-[14px] font-bold">Marc Vasseur</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Submissions Table Section */}
          <section className="bg-white rounded-[32px] shadow-sm border border-outline-variant/20 overflow-hidden">
            <div className="p-8 border-b border-outline-variant/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                    <input className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/50 rounded-full text-[14px] font-medium focus:ring-1 focus:ring-primary outline-none w-64 md:w-80 transition-all" placeholder="Search team or project..." type="text"/>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-full text-[14px] font-medium hover:bg-surface-variant/10 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    Status
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-full text-[14px] font-medium hover:bg-surface-variant/10 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">assignment</span>
                    Problem
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-full text-[14px] font-medium hover:bg-surface-variant/10 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">person_search</span>
                    Reviewer
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead className="bg-surface-container-low/50">
                  <tr className="text-[12px] font-bold text-outline uppercase tracking-wider border-b border-outline-variant/20">
                    <th className="px-8 py-4">Team Name</th>
                    <th className="px-6 py-4">Project Name</th>
                    <th className="px-6 py-4">Problem Statement</th>
                    <th className="px-6 py-4">Links</th>
                    <th className="px-6 py-4">Submission Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Current Score</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {/* Row 1 */}
                  <tr className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-[14px] text-on-surface">EcoStream</div>
                      <div className="text-[10px] text-primary bg-primary/5 inline-block px-1.5 py-0.5 rounded font-bold mt-1">Sustainability</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-[14px] text-on-surface">Carbon Tracker</div>
                      <div className="text-[12px] text-outline font-medium italic truncate max-w-[120px] mt-1">Real-time logistics monitoring</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[12px] text-outline font-medium">Supply chain carbon footprint reduction</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform text-[20px]">code</span>
                        <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform text-[20px]">visibility</span>
                        <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform text-[20px]">description</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[14px] font-medium">Nov 22, 11:45 PM</div>
                      <div className="text-[10px] text-outline font-medium mt-1">2 hours before deadline</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary">EVALUATED</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-[14px] text-primary">9.2</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-primary cursor-pointer text-[20px]" title="Open GitHub">terminal</span>
                        <span className="material-symbols-outlined text-primary cursor-pointer text-[20px]" title="View Demo">monitor</span>
                        <span className="material-symbols-outlined text-primary cursor-pointer text-[20px]" title="View Evaluation">assignment</span>
                      </div>
                    </td>
                  </tr>
                  {/* Row 2 */}
                  <tr className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-[14px] text-on-surface">TerraMind</div>
                      <div className="text-[10px] text-primary bg-primary/5 inline-block px-1.5 py-0.5 rounded font-bold mt-1">Agriculture</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-[14px] text-on-surface">AI Soil Health</div>
                      <div className="text-[12px] text-outline font-medium italic truncate max-w-[120px] mt-1">Deep learning for crops</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[12px] text-outline font-medium">Automated nutrient analysis</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform text-[20px]">code</span>
                        <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform text-[20px]">visibility</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[14px] font-medium">Nov 23, 01:20 AM</div>
                      <div className="text-[10px] text-error font-bold italic mt-1">LATE (+1.3h)</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-error/10 text-error">LATE</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[12px] text-outline font-medium">Pending</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-primary cursor-pointer text-[20px]" title="Open GitHub">terminal</span>
                        <span className="material-symbols-outlined text-primary cursor-pointer text-[20px]" title="View Demo">monitor</span>
                        <span className="material-symbols-outlined text-primary cursor-pointer text-[20px]" title="View Evaluation">assignment</span>
                      </div>
                    </td>
                  </tr>
                  {/* Row 3 */}
                  <tr className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-[14px] text-on-surface">HydroPulse</div>
                      <div className="text-[10px] text-primary bg-primary/5 inline-block px-1.5 py-0.5 rounded font-bold mt-1">Water Systems</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-[14px] text-on-surface">AquaFlow IoT</div>
                      <div className="text-[12px] text-outline font-medium italic truncate max-w-[120px] mt-1">Decentralized sensors</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[12px] text-outline font-medium">Real-time water quality monitoring</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform text-[20px]">code</span>
                        <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform text-[20px]">description</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[14px] font-medium">Nov 22, 10:15 PM</div>
                      <div className="text-[10px] text-outline font-medium mt-1">On-time</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-tertiary/10 text-tertiary uppercase">Under Review</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-[14px] text-tertiary">8.5</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-primary cursor-pointer text-[20px]" title="Open GitHub">terminal</span>
                        <span className="material-symbols-outlined text-primary cursor-pointer text-[20px]" title="View Demo">monitor</span>
                        <span className="material-symbols-outlined text-primary cursor-pointer text-[20px]" title="View Evaluation">assignment</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-surface-container-lowest flex justify-between items-center border-t border-outline-variant/10">
              <span className="text-[14px] font-medium text-outline">Showing 1-10 of 112 submissions</span>
              <div className="flex gap-2">
                <button className="p-2 border border-outline-variant/30 rounded-lg hover:bg-surface-variant/10 disabled:opacity-30 flex items-center justify-center" disabled>
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button className="p-2 border border-outline-variant/30 rounded-lg hover:bg-surface-variant/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Insights Panel */}
        <aside className="xl:col-span-3 space-y-6">
          {/* Evaluation Progress */}
          <section className="bg-white p-6 rounded-[24px] shadow-sm border border-outline-variant/20 flex flex-col items-center">
            <h4 className="font-headline-sm text-[20px] font-bold mb-6 w-full text-left">Evaluation Progress</h4>
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-surface-variant/30" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="transparent" stroke="currentColor" strokeWidth="3"></path>
                <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="transparent" stroke="currentColor" strokeDasharray="12, 100" strokeLinecap="round" strokeWidth="3"></path>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[24px] font-bold">12%</span>
                <span className="text-[10px] text-outline uppercase font-bold">Done</span>
              </div>
            </div>
            <p className="text-[14px] font-medium text-outline text-center">12 out of 112 projects have final scores recorded.</p>
          </section>

          {/* Pending Reviews */}
          <section className="bg-white p-6 rounded-[24px] shadow-sm border border-outline-variant/20">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-headline-sm text-[20px] font-bold">Pending Reviews</h4>
              <span className="text-[14px] font-bold text-primary">18/112</span>
            </div>
            <div className="w-full bg-surface-variant/30 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-primary h-full w-[16%]"></div>
            </div>
            <p className="text-[11px] font-medium text-outline">Targeting completion by EOD Tomorrow.</p>
          </section>

          {/* Late Submissions */}
          <section className="bg-white p-6 rounded-[24px] shadow-sm border border-outline-variant/20">
            <h4 className="font-headline-sm text-[20px] font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">warning</span>
              Late Submissions
            </h4>
            <ul className="space-y-3">
              <li className="flex justify-between items-center p-2 rounded-lg hover:bg-error/5 transition-colors cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-bold text-[14px]">NeuralNet</span>
                  <span className="text-[10px] font-medium text-outline">Submitted +2.4h</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">arrow_forward</span>
              </li>
              <li className="flex justify-between items-center p-2 rounded-lg hover:bg-error/5 transition-colors cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-bold text-[14px]">AquaLoop</span>
                  <span className="text-[10px] font-medium text-outline">Submitted +1.1h</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">arrow_forward</span>
              </li>
            </ul>
          </section>

          {/* Teams Without Submission */}
          <section className="bg-surface-container-low p-6 rounded-[24px] shadow-sm border border-outline-variant/10">
            <h4 className="font-headline-sm text-[20px] font-bold mb-4">Missing Activity</h4>
            <p className="text-[12px] font-medium text-outline mb-4">Teams registered but yet to upload any files.</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-outline-variant/10">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-[12px] font-bold shrink-0">SL</div>
                <span className="text-[14px] font-bold">SkyLink</span>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-outline-variant/10">
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed text-[12px] font-bold shrink-0">BP</div>
                <span className="text-[14px] font-bold">BioPulse</span>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-outline-variant/10">
                <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed text-[12px] font-bold shrink-0">UG</div>
                <span className="text-[14px] font-bold">UrbanGrid</span>
              </div>
            </div>
            <button className="w-full mt-4 text-primary text-[12px] font-bold py-2 hover:underline">Nudge all teams</button>
          </section>
        </aside>
      </div>
    </div>
  );
}
