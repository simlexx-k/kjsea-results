// app/page.tsx
'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Printer, Search, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { StudentResult } from '@/app/types';
import { ResultsTable } from '@/app/components/ResultsTable';

const SUBJECT_MAP: Record<string, string> = {
  "901": "English",
  "902": "Kiswahili",
  "903": "Mathematics",
  "905": "Integrated Science",
  "906": "Agriculture",
  "907": "Social Studies",
  "908": "Christian Religious Education",
  "911": "Creative Arts & Sports",
  "912": "Pre‑technical Studies",
};

export default function Home() {
  const [inputData, setInputData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);

  const handleProcess = async () => {
    setIsLoading(true);
    setLogs([]);

    // Parse input lines
    const lines = inputData.trim().split('\n');
    const students = lines
      .map((line) => {
        // Remove extra spaces
        const cleanLine = line.trim();
        if (!cleanLine) return null;

        // Try to find assessment number (starts with letter, followed by 8+ digits)
        const assessmentMatch = cleanLine.match(/([A-Z]\d{8,})/i);

        if (assessmentMatch) {
          const assessmentNumber = assessmentMatch[0];
          // Name is everything else, cleaned up
          const name = cleanLine.replace(assessmentNumber, '').replace(/[,;]/g, ' ').trim();
          return { assessmentNumber, name };
        }

        // Fallback to comma split if no regex match (legacy support)
        const parts = cleanLine.split(',');
        if (parts.length >= 2) {
          return {
            assessmentNumber: parts[0].trim(),
            name: parts.slice(1).join(' ').trim()
          };
        }
        return null;
      })
      .filter(Boolean);

    if (students.length === 0) {
      alert('Please enter valid data.');
      setIsLoading(false);
      return;
    }

    setLogs((prev) => [...prev, `Preparing to process ${students.length} records...`]);

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students }),
      });

      if (!response.ok) throw new Error('Failed to process data');

      const { data } = await response.json();
      setResults(data);
      setLogs((prev) => [...prev, `Received ${data.length} results.`]);

      // CSV download
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'knec_results.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLogs((prev) => [...prev, `Download started!`]);
    } catch (error) {
      console.error(error);
      setLogs((prev) => [...prev, `Error: Failed to fetch results.`]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportPdf = () => {
    const schoolName = results[0]?.centreName || 'KNEC KJSEA RESULTS 2025';
    const now = new Date();
    const w = window.open('', '_blank');
    if (!w) return;

    // Calculate Stats
    const totalCandidates = results.length;
    const boys = results.filter(r => r.gender?.trim().toUpperCase() === 'M').length;
    const girls = results.filter(r => r.gender?.trim().toUpperCase() === 'F').length;

    let totalEE = 0;
    let totalME = 0;
    let totalAE = 0;
    let totalBE = 0;

    const subjectStats = Object.entries(SUBJECT_MAP).map(([code, name]) => {
      let ee = 0, me = 0, ae = 0, be = 0;
      const scores = results.map(r => {
        const subj = r.subjects?.find(s => s.subjectCode === code);
        if (subj) {
          const grade = subj.subjectGrade?.trim().toUpperCase() || '';
          if (grade.startsWith('EE')) ee++;
          else if (grade.startsWith('ME')) me++;
          else if (grade.startsWith('AE')) ae++;
          else if (grade.startsWith('BE')) be++;
        }
        return subj ? parseFloat(subj.subjectPoints) : null;
      }).filter((s): s is number => s !== null && !isNaN(s));

      totalEE += ee;
      totalME += me;
      totalAE += ae;
      totalBE += be;

      const count = scores.length;
      const mean = count > 0 ? scores.reduce((a, b) => a + b, 0) / count : 0;

      return { name, count, mean, ee, me, ae, be };
    }).filter(s => s.count > 0);

    const styles = `
      <style>
        * { box-sizing: border-box; }
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: #1e293b; line-height: 1.5; }
        .report { padding: 40px; width: 100%; }
        
        /* Header */
        .header { display:flex; align-items:center; justify-content:space-between; border-bottom: 3px solid #1e40af; padding-bottom: 16px; margin-bottom: 24px; }
        .title { font-size: 24px; font-weight: 800; color: #1e40af; letter-spacing: -0.025em; }
        .meta { color:#64748b; font-size:12px; font-weight: 500; }
        
        /* Section Titles */
        .section-title { font-size: 14px; font-weight: 700; margin-top: 32px; margin-bottom: 12px; text-transform: uppercase; color: #334155; letter-spacing: 0.05em; border-left: 4px solid #1e40af; padding-left: 8px; }
        
        /* Tables */
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
        th, td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
        th { text-align:left; background:#f1f5f9; font-weight: 700; color: #334155; white-space: nowrap; text-transform: uppercase; font-size: 10px; letter-spacing: 0.025em; }
        tr:nth-child(even) { background-color: #f8fafc; }
        td.center, th.center { text-align: center; }
        td.right, th.right { text-align: right; }
        
        /* Stats Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .stat-card { border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; background: #ffffff; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); position: relative; overflow: hidden; }
        .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: #cbd5e1; }
        .stat-card.blue::before { background: #3b82f6; }
        .stat-card.green::before { background: #22c55e; }
        .stat-card.amber::before { background: #f59e0b; }
        .stat-card.red::before { background: #ef4444; }
        
        .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .stat-value { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px; }
        
        /* Colors */
        .text-green { color: #16a34a; }
        .text-blue { color: #2563eb; }
        .text-amber { color: #d97706; }
        .text-red { color: #dc2626; }
        .bg-green-soft { background-color: #f0fdf4; }
        .bg-blue-soft { background-color: #eff6ff; }
        .bg-amber-soft { background-color: #fffbeb; }
        .bg-red-soft { background-color: #fef2f2; }

        /* Footer */
        .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color:#64748b; display:flex; justify-content: space-between; align-items: center; }
        .footer-brand { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #334155; }
        .footer-brand img { height: 24px; width: 24px; object-fit: contain; }
        
        @media print { 
            .no-print { display:none; } 
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .report { padding: 0; }
        }
      </style>
    `;

    const subjectHeaders = Object.values(SUBJECT_MAP).map(name => `<th class="center">${name}</th>`).join('');

    const tableHead = `
      <tr>
        <th>Assessment #</th>
        <th>Name</th>
        <th>Gender</th>
        ${subjectHeaders}
        <th class="center">Arts & Sports</th>
        <th class="center">Social Science</th>
        <th class="center">STEM</th>
      </tr>`;

    const tableRows = results.map(r => {
      const subjectCells = Object.keys(SUBJECT_MAP).map(code => {
        const subj = r.subjects?.find(s => s.subjectCode === code);
        let gradeClass = '';
        if (subj?.subjectGrade?.startsWith('EE')) gradeClass = 'text-green font-bold';
        else if (subj?.subjectGrade?.startsWith('ME')) gradeClass = 'text-blue font-bold';
        else if (subj?.subjectGrade?.startsWith('AE')) gradeClass = 'text-amber font-bold';
        else if (subj?.subjectGrade?.startsWith('BE')) gradeClass = 'text-red font-bold';

        return `<td class="center ${gradeClass}">${subj ? `${subj.subjectGrade} <span style="font-weight:normal;color:#64748b;font-size:0.9em">(${subj.subjectPoints})</span>` : '-'}</td>`;
      }).join('');

      return `
      <tr>
        <td style="font-family:monospace;color:#475569;">${r.input_assessment}</td>
        <td style="font-weight:600;color:#1e293b;">${r.input_name}</td>
        <td class="center">${r.gender || '-'}</td>
        ${subjectCells}
        <td class="center font-bold">${r.artsAndSportsPathway || '-'}</td>
        <td class="center font-bold">${r.socialSciencePathway || '-'}</td>
        <td class="center font-bold">${r.stemPathway || '-'}</td>
      </tr>`;
    }).join('');

    const subjectStatsRows = subjectStats.map(s => `
        <tr>
            <td style="font-weight:600;">${s.name}</td>
            <td class="center">${s.count}</td>
            <td class="center ${s.ee > 0 ? 'text-green font-bold bg-green-soft' : 'text-slate-400'}">${s.ee}</td>
            <td class="center ${s.me > 0 ? 'text-blue font-bold bg-blue-soft' : 'text-slate-400'}">${s.me}</td>
            <td class="center ${s.ae > 0 ? 'text-amber font-bold bg-amber-soft' : 'text-slate-400'}">${s.ae}</td>
            <td class="center ${s.be > 0 ? 'text-red font-bold bg-red-soft' : 'text-slate-400'}">${s.be}</td>
            <td class="right font-bold">${s.mean.toFixed(2)}</td>
        </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${schoolName}</title>
          ${styles}
        </head>
        <body>
          <div class="report">
            <div class="header">
              <div style="display:flex;align-items:center;gap:16px;">
                <div class="title">${schoolName}</div>
              </div>
              <div style="text-align:right;">
                <div class="meta" style="font-size:14px;color:#1e293b;font-weight:700;">KJSEA 2025 RESULTS</div>
                <div class="meta">Generated: ${now.toLocaleString()}</div>
              </div>
            </div>

            <div class="section-title">Summary Statistics</div>
            <div class="stats-grid">
                <div class="stat-card blue">
                    <div class="stat-label">Total Candidates</div>
                    <div class="stat-value" style="color:#2563eb;">${totalCandidates}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Boys</div>
                    <div class="stat-value">${boys}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Girls</div>
                    <div class="stat-value">${girls}</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-label">Exceeding (EE)</div>
                    <div class="stat-value" style="color:#16a34a;">${totalEE}</div>
                </div>
                <div class="stat-card blue">
                    <div class="stat-label">Meeting (ME)</div>
                    <div class="stat-value" style="color:#2563eb;">${totalME}</div>
                </div>
                <div class="stat-card amber">
                    <div class="stat-label">Approaching (AE)</div>
                    <div class="stat-value" style="color:#d97706;">${totalAE}</div>
                </div>
                <div class="stat-card red">
                    <div class="stat-label">Below (BE)</div>
                    <div class="stat-value" style="color:#dc2626;">${totalBE}</div>
                </div>
            </div>

            <div class="section-title">Detailed Results</div>
            <table>
              <thead>${tableHead}</thead>
              <tbody>${tableRows}</tbody>
            </table>

            <div class="section-title" style="page-break-before: auto;">Subject Performance</div>
            <table style="width: 100%;">
                <thead>
                    <tr>
                        <th style="width:30%;">Subject</th>
                        <th class="center">Candidates</th>
                        <th class="center" style="color:#16a34a;">EE</th>
                        <th class="center" style="color:#2563eb;">ME</th>
                        <th class="center" style="color:#d97706;">AE</th>
                        <th class="center" style="color:#dc2626;">BE</th>
                        <th class="right">Mean Score</th>
                    </tr>
                </thead>
                <tbody>
                    ${subjectStatsRows}
                </tbody>
            </table>

            <div class="footer">
              <div class="footer-brand">
                <img src="/icons/icon-192.png" alt="ShuleYangu" />
                <span>Generated by ShuleYangu Systems</span>
              </div>
              <div style="text-align:center;">
                <div>${now.getFullYear()} KNEC KJSEA Assessment Report</div>
                <div style="font-size:10px;margin-top:2px;">All rights reserved by KNEC</div>
              </div>
              <div style="font-size:10px;">Page 1 of 1</div>
            </div>
            <div class="no-print" style="margin-top:24px;text-align:center;">
              <button onclick="window.print()" style="padding:12px 24px;background:#1e40af;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);">Print / Save as PDF</button>
            </div>
          </div>
        </body>
      </html>`;

    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm print:hidden">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">KNEC Scraper</h1>
          </div>
          <div className="flex items-center gap-4">
            {results.length > 0 && (
              <Button
                onClick={exportPdf}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Report
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow w-full mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Input Section */}
          <div className="print:hidden">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Student Data Input</CardTitle>
                <CardDescription>
                  Paste your student list below. Supported formats: "Name AssessmentNumber" or "AssessmentNumber, Name".
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <textarea
                    className="w-full h-48 p-4 border border-slate-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                    placeholder={`Example:\nCAROLINE JEPCHUMBA A001376825\nBRANDON CHERUIYOT A000266384`}
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                  />
                  <Button
                    onClick={handleProcess}
                    disabled={isLoading || !inputData}
                    className={`w-full py-6 text-lg font-semibold shadow-md transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Fetch Results & Download CSV
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logs Section */}
          {logs.length > 0 && (
            <div className="print:hidden">
              <Card className="bg-slate-900 text-slate-50 border-slate-800">
                <CardContent className="p-4">
                  <div className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Section */}
          {results.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ResultsTable data={results} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} KNEC KJSEA Assessment Scraper. Built for educational data analysis only. Privacy Policy from KNEC applies.</p>
        </div>
      </footer>
    </div>
  );
}