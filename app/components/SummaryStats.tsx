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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
                    <CardTitle className="text-xs font-medium">Candidates</CardTitle>
                    <Users className="h-3 w-3 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-xl font-bold">{totalStudents}</div>
                    <p className="text-[10px] text-muted-foreground truncate">
                        {Object.entries(genderCounts)
                            .map(([g, c]) => `${g}: ${c}`)
                            .join(', ')}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
                    <CardTitle className="text-xs font-medium">Avg. STEM</CardTitle>
                    <Activity className="h-3 w-3 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-xl font-bold">{avgStem}</div>
                    <p className="text-[10px] text-muted-foreground truncate">Science & Math</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
                    <CardTitle className="text-xs font-medium">Avg. Social</CardTitle>
                    <BookOpen className="h-3 w-3 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-xl font-bold">{avgSocial}</div>
                    <p className="text-[10px] text-muted-foreground truncate">Humanities</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
                    <CardTitle className="text-xs font-medium">Avg. Arts</CardTitle>
                    <Trophy className="h-3 w-3 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-xl font-bold">{avgArts}</div>
                    <p className="text-[10px] text-muted-foreground truncate">Creative</p>
                </CardContent>
            </Card>
        </div>
    );
};
