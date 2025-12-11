import React from 'react';
import { StudentResult } from '@/app/types';
import { SummaryStats } from './SummaryStats';
import { ResultsTable } from './ResultsTable';

interface PrintableReportProps {
    data: StudentResult[];
}

export const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
    ({ data }, ref) => {
        return (
            <div ref={ref} className="p-8 print:p-0">
                <div className="mb-8 text-center hidden print:block">
                    <h1 className="text-3xl font-bold text-blue-900">KNEC Assessment Report</h1>
                    <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 print:hidden">Summary Statistics</h2>
                    <SummaryStats data={data} />
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4 print:hidden">Detailed Results</h2>
                    <ResultsTable data={data} />
                </div>

                <div className="mt-8 text-center text-sm text-gray-400 hidden print:block">
                    <p>End of Report</p>
                </div>
            </div>
        );
    }
);

PrintableReport.displayName = 'PrintableReport';
