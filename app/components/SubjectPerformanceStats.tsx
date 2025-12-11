import React from 'react';
import { StudentResult } from '@/app/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

interface SubjectPerformanceStatsProps {
    data: StudentResult[];
}

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

export const SubjectPerformanceStats: React.FC<SubjectPerformanceStatsProps> = ({ data }) => {
    // Calculate stats
    const stats = Object.entries(SUBJECT_MAP).map(([code, name]) => {
        let ee1 = 0;
        let ee2 = 0;
        let me1 = 0;
        let me2 = 0;
        let ae1 = 0;
        let ae2 = 0;
        let be1 = 0;
        let be2 = 0;
        let total = 0;

        data.forEach(student => {
            const subject = (student.subjects || []).find(s => s.subjectCode === code);
            if (subject) {
                const grade = subject.subjectGrade.toUpperCase();

                if (grade === 'EE1') ee1++;
                else if (grade === 'EE2') ee2++;
                else if (grade === 'ME1') me1++;
                else if (grade === 'ME2') me2++;
                else if (grade === 'AE1') ae1++;
                else if (grade === 'AE2') ae2++;
                else if (grade === 'BE1') be1++;
                else if (grade === 'BE2') be2++;

                // Fallback for grades without numbers if any (though typically they have numbers)
                // or just counting total based on presence
                total++;
            }
        });

        return { name, ee1, ee2, me1, me2, ae1, ae2, be1, be2, total };
    });

    return (
        <Card className="mb-8 print:shadow-none print:border-0">
            <CardHeader className="pb-2 print:hidden">
                <CardTitle className="text-lg font-semibold">Subject Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="print:p-0">
                <div className="rounded-md border print:border-0 overflow-x-auto max-w-[calc(100vw-2rem)] mx-auto scrollbar-visible">
                    <Table className="print:text-xs text-xs sm:text-sm whitespace-nowrap">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Subject</TableHead>
                                <TableHead className="text-center px-1">EE1</TableHead>
                                <TableHead className="text-center px-1">EE2</TableHead>
                                <TableHead className="text-center px-1">ME1</TableHead>
                                <TableHead className="text-center px-1">ME2</TableHead>
                                <TableHead className="text-center px-1">AE1</TableHead>
                                <TableHead className="text-center px-1">AE2</TableHead>
                                <TableHead className="text-center px-1">BE1</TableHead>
                                <TableHead className="text-center px-1">BE2</TableHead>
                                <TableHead className="text-center font-bold px-2">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.map((row) => (
                                <TableRow key={row.name}>
                                    <TableCell className="font-medium">{row.name}</TableCell>
                                    <TableCell className="text-center px-1 text-gray-600">{row.ee1 || '-'}</TableCell>
                                    <TableCell className="text-center px-1 text-gray-600">{row.ee2 || '-'}</TableCell>
                                    <TableCell className="text-center px-1 text-gray-600">{row.me1 || '-'}</TableCell>
                                    <TableCell className="text-center px-1 text-gray-600">{row.me2 || '-'}</TableCell>
                                    <TableCell className="text-center px-1 text-gray-600">{row.ae1 || '-'}</TableCell>
                                    <TableCell className="text-center px-1 text-gray-600">{row.ae2 || '-'}</TableCell>
                                    <TableCell className="text-center px-1 text-gray-600">{row.be1 || '-'}</TableCell>
                                    <TableCell className="text-center px-1 text-gray-600">{row.be2 || '-'}</TableCell>
                                    <TableCell className="text-center font-bold px-2">{row.total}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
