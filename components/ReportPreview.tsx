
import React from 'react';
import { ReportData, ReportSection } from '../types';

interface ReportPreviewProps {
  report: ReportData;
  onSummaryChange?: (newSummary: string) => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ report, onSummaryChange }) => {
  const preparerText = `Prepared by: ${report.preparedBy}`;

  // Helper to determine if a section should be shown as a dedicated data page
  const isDisplayableSection = (name: string) => {
    const n = name.toLowerCase();
    return n.includes("stats") || n.includes("summary") || n.includes("roles") || 
           n.includes("joiner") || n.includes("leaver") || n.includes("transfer") ||
           n.includes("leave") || n.includes("vacation") || n.includes("إجازات") || n.includes("اجازات");
  };

  if (report.type === 'vacation') {
    return (
      <div className="flex flex-col items-center bg-gray-200 p-12 min-h-screen font-sans">
        <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] mb-12 overflow-hidden flex flex-col print:shadow-none print:m-0">
          <div className="bg-[#1e293b] text-white p-16 text-center">
            <h1 className="text-4xl font-black uppercase tracking-widest mb-4">Annual Vacation Report</h1>
            <p className="text-sm opacity-80 uppercase tracking-widest">Prepared for: Environmental Services Department</p>
            <p className="text-lg font-bold mt-2">FISCAL YEAR {report.reportYear || '2025'}</p>
          </div>
          <div className="p-[20mm] flex-1">
            <h3 className="text-sm font-black uppercase text-[#1e293b] border-b-2 border-[#1e293b] pb-2 mb-6">Key Performance Indicators</h3>
            <div className="bg-white border border-gray-200 mb-8">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-gray-100">
                    <tr className="bg-gray-50/50">
                      <td className="p-3 text-gray-700 border-r border-gray-100">Total Unique Employees with Leave</td>
                      <td className="p-3 font-bold text-blue-600">{report.vacationStats?.totalUniqueEmployees}</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-gray-700 border-r border-gray-100">Average Monthly Participation</td>
                      <td className="p-3 font-bold text-blue-600">{report.vacationStats?.avgMonthlyParticipation}</td>
                    </tr>
                  </tbody>
                </table>
            </div>
            <h3 className="text-sm font-black uppercase text-[#1e293b] border-b-2 border-[#1e293b] pb-2 mb-6">Monthly Leave Participation</h3>
            <div className="bg-white border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#1e40af] text-white">
                      <th className="p-3 font-bold uppercase">Reporting Month</th>
                      <th className="p-3 font-bold uppercase text-right">Count</th>
                      <th className="p-3 font-bold uppercase text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 uppercase">
                    {report.vacationStats?.monthlyParticipation.map((item, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 text-gray-700 font-medium">{item.month}</td>
                        <td className="p-3 font-black text-[#1e40af] text-right">{item.count}</td>
                        <td className="p-3 text-gray-600 text-right">{item.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
          <div className="p-8 text-center text-[10px] text-gray-400 border-t border-gray-100 italic">Page 1</div>
        </div>

        {/* Vacation Data Pages */}
        {report.sections.map((section, sIdx) => (
          <div key={sIdx} className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[25mm] mb-12 relative overflow-hidden print:shadow-none print:m-0">
            <h3 className="text-sm font-black uppercase border-b border-black mb-4">{section.title}</h3>
            <div className="border border-gray-300">
              <table className="w-full text-left text-[9px] border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold">
                    {section.headers.map((h, i) => <th key={i} className="p-1.5 border border-slate-600">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="uppercase">
                  {section.data.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-gray-200">
                      {section.headers.map((h, cIdx) => <td key={cIdx} className="p-1.5 border-r border-gray-100">{row[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-gray-200 p-12 min-h-screen font-serif">
      {/* Cover Page */}
      <div className="bg-white shadow-2xl w-[210mm] h-[297mm] p-[25mm] flex flex-col justify-between mb-12 overflow-hidden print:shadow-none print:m-0">
        <div className="mt-48 text-center">
          <h1 className="text-5xl font-bold text-black border-b-4 border-black pb-8 uppercase tracking-tighter">
            Monthly Workforce Audit Report
          </h1>
          <div className="mt-12">
            <h2 className="text-3xl text-gray-800 font-semibold uppercase">{report.reportMonth} {report.reportYear}</h2>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm border-t pt-12">
          <p className="font-bold text-black uppercase tracking-widest">{report.preparedBy}</p>
        </div>
      </div>

      {/* Summary Metrics Page */}
      {report.stats && (
        <div className="bg-white shadow-2xl w-[210mm] h-[297mm] p-[25mm] mb-12 relative overflow-hidden print:shadow-none print:m-0">
          <h3 className="text-2xl font-bold border-b-2 border-black pb-3 mb-12 uppercase tracking-tighter">
            Workforce Metrics Overview
          </h3>
          <div className="grid grid-cols-2 gap-8 mt-12">
            {[
              { label: "Total Workforce", val: report.stats.totalEmployees, sub: "Male + Female Count" },
              { label: "New Joiners", val: report.stats.joinersCount, sub: "Current Month Arrivals" },
              { label: "Staff Leavers", val: report.stats.leaversCount, sub: "Current Month Exits" },
              { label: "Site Transfers", val: report.stats.transfersCount, sub: "Internal Movements" }
            ].map((m, idx) => (
              <div key={idx} className="border-2 border-black p-8 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{m.label}</span>
                <span className="text-6xl font-black text-black">{m.val}</span>
                <span className="text-[10px] mt-4 font-bold text-gray-400 uppercase">{m.sub}</span>
              </div>
            ))}
          </div>
          <p className="mt-12 text-[10px] text-gray-400 italic text-center uppercase tracking-widest">
            * This summary is derived from combined male and female reporting data.
          </p>
          <div className="absolute bottom-[25mm] left-[25mm] right-[25mm] text-center text-gray-400 text-[10px] border-t pt-4">Page 2</div>
        </div>
      )}

      {/* Show all relevant sheets as data pages (Stats, Roles, Joiners, Leavers, Transfers, Vacations) */}
      {report.sections.filter(s => isDisplayableSection(s.originalSheetName)).map((section, sIdx) => (
        <div key={sIdx} className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[25mm] mb-12 relative overflow-hidden print:shadow-none print:m-0">
          <div className="border border-black bg-neutral-50 p-4 mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-black">{section.title.toUpperCase()}</h3>
          </div>
          <div className="border border-gray-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-800 text-white font-bold uppercase text-[8px]">
                  {section.headers.map((h, i) => <th key={i} className="p-2 border border-neutral-600">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {section.data.map((row, rIdx) => (
                  <tr key={rIdx} className={`border-b border-gray-300 bg-white`}>
                    {section.headers.map((h, cIdx) => (
                      <td key={cIdx} className="py-1.5 px-2 text-[9px] border-r border-gray-200 last:border-r-0 uppercase">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Executive Summary Page */}
      <div className="bg-white shadow-2xl w-[210mm] h-[297mm] p-[25mm] mb-12 relative overflow-hidden print:shadow-none print:m-0">
        <h3 className="text-2xl font-bold border-b-2 border-black pb-3 mb-8 uppercase tracking-tighter">Executive Summary</h3>
        <textarea
          className="w-full h-[180mm] text-gray-900 leading-relaxed text-lg text-justify bg-transparent border-none focus:ring-0 resize-none p-0 outline-none"
          value={report.executiveSummary}
          onChange={(e) => onSummaryChange?.(e.target.value)}
        />
        <div className="absolute bottom-[25mm] left-[25mm] right-[25mm] text-center text-gray-400 text-[10px] border-t pt-4">Final Page</div>
      </div>
    </div>
  );
};

export default ReportPreview;
