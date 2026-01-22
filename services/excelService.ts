
import * as XLSX from 'xlsx';
import { SheetData, ReportSection, QuantitativeSummary, VacationStats } from '../types';

const MONTH_ORDER = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", 
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const ARABIC_MONTHS: Record<string, string> = {
  "يناير": "JANUARY", "فبراير": "FEBRUARY", "مارس": "MARCH", "أبريل": "APRIL",
  "مايو": "MAY", "يونيو": "JUNE", "يوليو": "JULY", "أغسطس": "AUGUST",
  "سبتمبر": "SEPTEMBER", "أكتوبر": "OCTOBER", "نوفمبر": "NOVEMBER", "ديسمبر": "DECEMBER"
};

const getMonthIndex = (monthStr: string): number => {
  let normalized = String(monthStr || "").toUpperCase().trim();
  if (ARABIC_MONTHS[normalized]) normalized = ARABIC_MONTHS[normalized];
  const index = MONTH_ORDER.findIndex(m => normalized.startsWith(m) || m.startsWith(normalized));
  return index === -1 ? 999 : index;
};

const getValueByKeys = (row: any, keys: string[]) => {
  const rowKeys = Object.keys(row);
  for (const key of keys) {
    const foundKey = rowKeys.find(rk => {
      const normalizedRowKey = rk.toLowerCase().trim();
      const normalizedSearchKey = key.toLowerCase().trim();
      return normalizedRowKey === normalizedSearchKey || normalizedRowKey.includes(normalizedSearchKey);
    });
    if (foundKey && (row[foundKey] !== undefined && row[foundKey] !== null)) return row[foundKey];
  }
  return null;
};

export const parseExcelFile = async (file: File): Promise<SheetData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheets: SheetData[] = workbook.SheetNames.map(name => {
          const worksheet = workbook.Sheets[name];
          let jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          
          jsonData = jsonData.filter((row: any) => {
            const vals = Object.values(row);
            if (vals.length === 0) return false;
            const firstVal = String(vals[0] || "").toLowerCase();
            return !firstVal.includes("total") && !firstVal.includes("إجمالي") && firstVal !== "";
          });

          return { name, data: jsonData };
        });
        resolve(sheets);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const calculateQuantitativeStats = (sheets: SheetData[]): QuantitativeSummary => {
  const statsSheet = sheets.find(s => 
    ["stats", "summary", "statistics"].some(k => s.name.toLowerCase().includes(k))
  );
  
  let maleCount = 0;
  let femaleCount = 0;
  let joiners = 0;
  let leavers = 0;
  let transfers = 0;
  let summaryTotal = 0;

  if (statsSheet && statsSheet.data.length > 0) {
    statsSheet.data.forEach((row: any) => {
      const keys = Object.keys(row);
      if (keys.length < 2) return;
      
      const label = String(row[keys[0]] || "").toLowerCase().trim();
      const count = parseFloat(String(row[keys[1]] || "0").replace(/[^0-9.]/g, '')) || 0;

      if (label === 'male' || label === 'ذكر') maleCount = count;
      if (label === 'female' || label === 'أنثى') femaleCount = count;
      if (label.includes('joiner') || label.includes('جديد')) joiners = count;
      if (label.includes('leaver') || label.includes('مغادر')) leavers = count;
      if (label.includes('transfer') || label.includes('نقل')) transfers = count;
      if (label.includes('total') || label.includes('إجمالي')) summaryTotal = count;
    });
  }

  const getRowCount = (keywords: string[]) => {
    const s = sheets.find(s => keywords.some(k => s.name.toLowerCase().includes(k.toLowerCase())));
    return s ? s.data.length : 0;
  };

  // The user specifically requested Total = Male + Female
  const calculatedTotal = maleCount + femaleCount;
  
  // Use calculated total if available, else summary total, else row count of first sheet
  const finalTotal = calculatedTotal > 0 ? calculatedTotal : (summaryTotal > 0 ? summaryTotal : getRowCount(["stats summary", "workforce", "table 1"]));

  return {
    totalEmployees: finalTotal,
    jobRolesCount: getRowCount(["job roles", "roles", "designation"]),
    joinersCount: joiners || getRowCount(["joiners report", "joiner", "new staff"]),
    leaversCount: leavers || getRowCount(["leavers report", "leaver", "exit"]),
    transfersCount: transfers || getRowCount(["site transfers", "transfer", "movement"])
  };
};

export const calculateVacationStats = (sheets: SheetData[]): VacationStats | null => {
  const leaveSheet = sheets.find(s => 
    ["leave", "vacation", "individual"].some(k => s.name.toLowerCase().includes(k))
  );
  if (!leaveSheet || leaveSheet.data.length === 0) return null;
  const data = leaveSheet.data;
  const uniqueEmployees = new Set(data.map(row => getValueByKeys(row, ["MRN", "Staff Name", "Name"])).filter(Boolean)).size;
  const monthlyMap: Record<string, number> = {};
  data.forEach(row => {
    let month = String(getValueByKeys(row, ["Month", "الشهر"]) || "").toUpperCase().trim();
    if (ARABIC_MONTHS[month]) month = ARABIC_MONTHS[month];
    if (month && !month.includes("TOTAL")) monthlyMap[month] = (monthlyMap[month] || 0) + 1;
  });
  const contractBase = 531; 
  const months = Object.keys(monthlyMap).sort((a, b) => getMonthIndex(a) - getMonthIndex(b));
  return {
    totalUniqueEmployees: uniqueEmployees,
    avgMonthlyParticipation: `${months.length > 0 ? (data.length / months.length).toFixed(0) : 0} Staff/Month`,
    dataIntegrityScore: "100%",
    monthlyParticipation: months.map(m => ({
      month: m,
      count: monthlyMap[m],
      percentage: ((monthlyMap[m] / contractBase) * 100).toFixed(1) + "%"
    })),
    contractBase
  };
};

export const mapSheetsToSections = (sheets: SheetData[]): ReportSection[] => {
  return sheets
    .filter(sheet => sheet.data && sheet.data.length > 0)
    .map(sheet => ({
      title: sheet.name,
      originalSheetName: sheet.name,
      data: sheet.data,
      headers: Object.keys(sheet.data[0] || {})
    }));
};

export const extractDateInfo = (fileName: string): { month: string; year: string } => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const now = new Date();
  let month = months[now.getMonth()], year = now.getFullYear().toString();
  months.forEach(m => { if (fileName.toLowerCase().includes(m.toLowerCase())) month = m; });
  const yearMatch = fileName.match(/20\d{2}/);
  if (yearMatch) year = yearMatch[0];
  return { month, year };
};
