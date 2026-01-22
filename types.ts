
export interface ReportSection {
  title: string;
  originalSheetName: string;
  data: any[];
  headers: string[];
}

export interface QuantitativeSummary {
  totalEmployees: number;
  jobRolesCount: number;
  joinersCount: number;
  leaversCount: number;
  transfersCount: number;
}

export interface VacationStats {
  totalUniqueEmployees: number;
  avgMonthlyParticipation: string;
  dataIntegrityScore: string;
  monthlyParticipation: {
    month: string;
    count: number;
    percentage: string;
  }[];
  contractBase: number;
}

export interface ReportData {
  type: 'audit' | 'vacation';
  fileName: string;
  reportMonth: string;
  reportYear: string;
  executiveSummary: string;
  sections: ReportSection[];
  preparedBy: string;
  isComparison?: boolean;
  stats?: QuantitativeSummary;
  vacationStats?: VacationStats;
}

export interface SheetData {
  name: string;
  data: any[];
}

export type AuditMode = 'single' | 'comparison';
