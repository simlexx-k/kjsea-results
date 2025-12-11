// app/page.tsx
'use client';

import { PrintableReport } from '@/app/components/PrintableReport';
import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { useReactToPrint } from 'react-to-print';
import { Printer, Download, Search, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export default function Home() {
  const [inputData, setInputData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'KNEC_Assessment_Report',
  });

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">KNEC Scraper</h1>
          </div>
          <div className="flex items-center gap-4">
            {results.length > 0 && (
              <Button
                onClick={() => handlePrint()}
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

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
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
              <PrintableReport ref={componentRef} data={results} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} KNEC Assessment Scraper. Built for educational data analysis.</p>
        </div>
      </footer>
    </div>
  );
}