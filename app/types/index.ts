export interface SubjectInfo {
    subjectCode: string;
    subjectGrade: string;
    subjectPoints: string;
    subjectGradeDescription: string;
}

export interface StudentResult {
    input_assessment: string;
    input_name: string;
    status: string;
    candidateName?: string;
    assessmentNumber?: string;
    gender?: string;
    centreCode?: string;
    centreName?: string;
    subjects: SubjectInfo[];
    artsAndSportsPathway?: string;
    socialSciencePathway?: string;
    stemPathway?: string;
}
