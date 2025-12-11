import React from 'react';
import { StudentResult } from '@/app/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Users, BookOpen, Trophy, Activity } from 'lucide-react';

interface SummaryStatsProps {
    data: StudentResult[];
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ data }) => {
    const totalStudents = data.length;

    // Gender Distribution
    const genderCounts = data.reduce((acc, curr) => {
        const gender = curr.gender?.trim() || 'Unknown';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Pathway Averages
    const pathwayStats = data.reduce(
        (acc, curr) => {
            acc.arts += parseFloat(curr.artsAndSportsPathway || '0');
            acc.social += parseFloat(curr.socialSciencePathway || '0');
            acc.stem += parseFloat(curr.stemPathway || '0');
            return acc;
        },
        { arts: 0, social: 0, stem: 0 }
    );

    const avgArts = (pathwayStats.arts / totalStudents).toFixed(2);
    const avgSocial = (pathwayStats.social / totalStudents).toFixed(2);
    const avgStem = (pathwayStats.stem / totalStudents).toFixed(2);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalStudents}</div>
                    <p className="text-xs text-muted-foreground">
                        {Object.entries(genderCounts)
                            .map(([g, c]) => `${g}: ${c}`)
                            .join(', ')}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. STEM Score</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgStem}</div>
                    <p className="text-xs text-muted-foreground">Science, Tech, Eng, Math</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Social Science</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgSocial}</div>
                    <p className="text-xs text-muted-foreground">Humanities & Languages</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Arts & Sports</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgArts}</div>
                    <p className="text-xs text-muted-foreground">Creative & Physical</p>
                </CardContent>
            </Card>
        </div>
    );
};
