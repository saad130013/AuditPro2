
import React, { useState } from 'react';
import { Upload, FileText, Printer, Loader2, Trash2, FileSpreadsheet, Calendar, Users, ChevronLeft, Download } from 'lucide-react';
import { ReportData } from './types';
import { parseExcelFile, mapSheetsToSections, extractDateInfo, calculateQuantitativeStats, calculateVacationStats } from './services/excelService';
import { exportToPDF } from './services/exportService';
import ReportPreview from './components/ReportPreview';

type ActiveModule = 'home' | 'audit' | 'vacation';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('home');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const uploadedFiles = Array.from(event.target.files || []) as File[];
      if (uploadedFiles.length === 0) return;
      setFiles(uploadedFiles);
    } catch (err) {
      setError("Error selecting files.");
    }
  };

  const processReport = async (type: 'audit' | 'vacation') => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const officialDisclaimer = "Executive Summary\n\nThe information presented herein is based on data provided by Safari Company. The data has not been audited or approved by the Environmental Services Department and is provided for guidance purposes only and remains subject to review, amendment, and change.";

    try {
      const sheets = await parseExcelFile(files[0]);
      const { month, year } = extractDateInfo(files[0].name);

      if (type === 'vacation') {
        const vacationStats = calculateVacationStats(sheets);
        if (!vacationStats) {
          throw new Error("The uploaded file does not appear to contain valid vacation or leave records.");
        }
        const sections = mapSheetsToSections(sheets);
        setReport({
          type: 'vacation',
          fileName: files[0].name,
          reportMonth: month,
          reportYear: year,
          executiveSummary: officialDisclaimer,
          sections,
          preparedBy: "Layla Alotaibi",
          vacationStats
        });
      } else {
        const sections = mapSheetsToSections(sheets);
        const stats = calculateQuantitativeStats(sheets);
        
        // Use static official disclaimer instead of AI generation
        const executiveSummary = officialDisclaimer;

        setReport({
          type: 'audit',
          fileName: files[0].name,
          reportMonth: month,
          reportYear: year,
          executiveSummary,
          sections,
          preparedBy: "Layla Alotaibi",
          stats
        });
      }
    } catch (err: any) {
      setError(err.message || "An internal error occurred while processing the file.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (report) {
      exportToPDF(report);
    }
  };

  const reset = () => {
    setFiles([]);
    setReport(null);
    setError(null);
    setActiveModule('home');
  };

  const goBack = () => {
    setFiles([]);
    setError(null);
    setActiveModule('home');
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans">
      <nav className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between no-print sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileSpreadsheet size={20} />
          </div>
          <span className="font-black text-xl tracking-tight uppercase">AuditPro <span className="text-blue-400">Hub</span></span>
        </div>
        {report && (
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDownloadPDF}
              className="bg-emerald-600 hover:bg-emerald-700 transition-colors px-4 py-2 rounded-md text-xs font-bold uppercase flex items-center gap-2"
              title="Download PDF"
            >
              <Download size={14} /> <span className="hidden sm:inline">PDF</span>
            </button>
            <button 
              onClick={() => window.print()} 
              className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-md text-xs font-bold uppercase flex items-center gap-2"
              title="Print"
            >
              <Printer size={14} /> <span className="hidden sm:inline">Print</span>
            </button>
            <button onClick={reset} className="text-slate-400 hover:text-white transition-colors ml-2" title="Clear">
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </nav>

      <main className="flex-1 overflow-y-auto">
        {!report ? (
          <div className="max-w-5xl mx-auto py-16 px-6">
            {activeModule === 'home' ? (
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Management Reporting Portal</h1>
                  <p className="text-slate-500 max-w-2xl mx-auto">Select the type of report you wish to generate from your workforce data exports.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <button 
                    onClick={() => setActiveModule('audit')}
                    className="group bg-white p-8 rounded-3xl border-2 border-transparent hover:border-blue-500 shadow-xl transition-all text-left flex flex-col"
                  >
                    <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                      <Users size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Workforce Audit</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                      Analyze staffing levels, contract vs. actual counts, joiners, leavers, and nationality/gender distributions.
                    </p>
                    <div className="mt-auto text-blue-600 font-bold text-sm uppercase flex items-center gap-2">
                      Start Audit Module <span>→</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveModule('vacation')}
                    className="group bg-white p-8 rounded-3xl border-2 border-transparent hover:border-emerald-500 shadow-xl transition-all text-left flex flex-col"
                  >
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                      <Calendar size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Vacation Reporting</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                      Track annual leave records, monthly participation rates, and individual vacation durations.
                    </p>
                    <div className="mt-auto text-emerald-600 font-bold text-sm uppercase flex items-center gap-2">
                      Start Vacation Module <span>→</span>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <button 
                  onClick={goBack}
                  className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold uppercase text-xs"
                >
                  <ChevronLeft size={16} /> Back to Dashboard
                </button>

                <div className="bg-white rounded-3xl p-12 shadow-2xl border-2 border-slate-100 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 -mr-8 -mt-8 ${activeModule === 'audit' ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {activeModule === 'audit' ? <Users size={128} /> : <Calendar size={128} />}
                  </div>

                  <div className="relative z-10 text-center space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                      {activeModule === 'audit' ? 'Staff Audit Generation' : 'Vacation Data Processing'}
                    </h2>
                    <p className="text-slate-500">Please upload the Excel file containing the raw data for this period.</p>

                    <label className="block mt-8 cursor-pointer group">
                      <div className={`border-4 border-dashed rounded-2xl p-12 transition-colors ${activeModule === 'audit' ? 'border-blue-100 hover:border-blue-400 bg-blue-50/30' : 'border-emerald-100 hover:border-emerald-400 bg-emerald-50/30'}`}>
                        <Upload size={48} className={`mx-auto mb-4 ${activeModule === 'audit' ? 'text-blue-400' : 'text-emerald-400'}`} />
                        <span className="block font-bold text-slate-600 uppercase text-sm tracking-widest">
                          {files.length > 0 ? files[0].name : 'Click to Browse Files'}
                        </span>
                        <input type="file" className="hidden" accept=".xlsx" onChange={handleFileUpload} />
                      </div>
                    </label>

                    {error && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                        {error}
                      </div>
                    )}

                    {files.length > 0 && (
                      <button 
                        disabled={loading}
                        onClick={() => processReport(activeModule as 'audit' | 'vacation')}
                        className={`w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 ${activeModule === 'audit' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                      >
                        {loading ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
                        {loading ? 'Processing Data...' : 'Generate Official Report'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <ReportPreview report={report} onSummaryChange={(summary) => setReport({...report, executiveSummary: summary})} />
        )}
      </main>
    </div>
  );
};

export default App;
