
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, PageBreak } from 'docx';
import { ReportData } from '../types';

export const exportToPDF = (report: ReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const preparerText = `This report was prepared by ${report.preparedBy}.`;
  
  // Page 1: Cover
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(report.type === 'vacation' ? 'Annual Vacation Report' : (report.isComparison ? 'Comparative Workforce Audit Report' : 'Monthly Workforce Audit Report'), pageWidth / 2, 80, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(18);
  doc.text(`${report.reportMonth} ${report.reportYear}`, pageWidth / 2, 95, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text('Official Document | Confidential', pageWidth / 2, 110, { align: 'center' });

  // Page 2: Summary Stats (Special handling for each type)
  if (report.type === 'vacation' && report.vacationStats) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('Executive Summary & KPIs', 20, 30);

    const kpiData = [
      ['Total Unique Employees with Leave', report.vacationStats.totalUniqueEmployees],
      ['Average Monthly Participation', report.vacationStats.avgMonthlyParticipation],
      ['Data Integrity Score', report.vacationStats.dataIntegrityScore],
    ];

    autoTable(doc, {
      startY: 45,
      head: [['Key Performance Indicator', 'Value']],
      body: kpiData,
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85] },
      styles: { fontSize: 11, cellPadding: 6 },
    });

    doc.setFontSize(16);
    doc.text('Monthly Leave Participation', 20, (doc as any).lastAutoTable.finalY + 20);

    const monthlyData = report.vacationStats.monthlyParticipation.map(m => [
      m.month,
      `${m.count} Employees`,
      m.percentage
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 30,
      head: [['Reporting Month', 'Employee Count', `Percentage of Contract (${report.vacationStats.contractBase})`]],
      body: monthlyData,
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175] },
      styles: { fontSize: 10, cellPadding: 5 },
    });
  } else if (report.stats) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('Executive Quantitative Summary', 20, 30);

    const statsData = [
      ['Total Workforce', report.stats.totalEmployees],
      ['Job Roles Identified', report.stats.jobRolesCount],
      ['New Joiners', report.stats.joinersCount],
      ['Staff Leavers', report.stats.leaversCount],
      ['Internal Site Transfers', report.stats.transfersCount],
    ];

    autoTable(doc, {
      startY: 45,
      body: statsData,
      theme: 'grid',
      styles: { fontSize: 12, cellPadding: 8 },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: [240, 240, 240], width: 100 },
        1: { halign: 'center', fontSize: 16, fontStyle: 'bold' }
      }
    });
  }
  
  // Data Sections (Detailed Records)
  report.sections.forEach((section) => {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(section.title, 20, 30);
    
    if (section.data.length > 0) {
      autoTable(doc, {
        startY: 40,
        head: [section.headers],
        body: section.data.map(row => section.headers.map(h => String(row[h] || ""))),
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { top: 40 }
      });
    }
  });

  // Final Page: Executive Narrative
  doc.addPage();
  doc.setTextColor(0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Executive Summary & Auditor Analysis`, 20, 30);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const splitText = doc.splitTextToSize(report.executiveSummary, pageWidth - 40);
  doc.text(splitText, 20, 45);

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} | ${preparerText} | Confidential`, pageWidth / 2, 285, { align: 'center' });
  }

  const filePrefix = report.type === 'vacation' ? 'Vacation_Report' : 'Workforce_Audit';
  const fileName = `${filePrefix}_${report.reportMonth}_${report.reportYear}.pdf`;
  doc.save(fileName);
};

export const exportToDocx = async (report: ReportData) => {
  // Simplified docx implementation for this context
  const preparerText = `This report was prepared by ${report.preparedBy}.`;
  
  const children: any[] = [
    new Paragraph({
      text: report.type === 'vacation' ? "Annual Vacation Report" : "Monthly Workforce Audit Report",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 400 },
    }),
    new Paragraph({
      text: `${report.reportMonth} ${report.reportYear}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  ];

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileName = `Report_${report.reportMonth}.docx`;
  link.download = fileName;
  link.click();
};
