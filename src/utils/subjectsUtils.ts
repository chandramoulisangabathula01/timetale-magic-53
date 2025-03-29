
import { YearType, BranchType } from '@/utils/types';

export interface SubjectData {
  id: string;
  name: string;
  year: YearType;
  branch: BranchType;
  isLab: boolean;
}

const SUBJECTS_STORAGE_KEY = 'timetable_subjects';

// Get all subjects from local storage
export const getSubjects = (): SubjectData[] => {
  const storedSubjects = localStorage.getItem(SUBJECTS_STORAGE_KEY);
  return storedSubjects ? JSON.parse(storedSubjects) : [];
};

// Add a new subject
export const addSubject = (subject: SubjectData): void => {
  const subjects = getSubjects();
  subjects.push(subject);
  localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects));
};

// Update an existing subject
export const updateSubject = (updatedSubject: SubjectData): void => {
  const subjects = getSubjects();
  const index = subjects.findIndex(subject => subject.id === updatedSubject.id);
  
  if (index !== -1) {
    subjects[index] = updatedSubject;
    localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects));
  }
};

// Delete a subject
export const deleteSubject = (id: string): void => {
  const subjects = getSubjects();
  const filteredSubjects = subjects.filter(subject => subject.id !== id);
  localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(filteredSubjects));
};

// Get subjects filtered by year and branch
export const getFilteredSubjects = (year: YearType, branch: BranchType): SubjectData[] => {
  const subjects = getSubjects();
  return subjects.filter(subject => 
    subject.year === year && subject.branch === branch
  );
};

// Check if a subject exists
export const subjectExists = (name: string, year: YearType, branch: BranchType): boolean => {
  const subjects = getSubjects();
  return subjects.some(subject => 
    subject.name.toLowerCase() === name.toLowerCase() &&
    subject.year === year &&
    subject.branch === branch
  );
};

// Check if subject-teacher pair already exists
export const subjectTeacherPairExists = (subjectName: string, teacherName: string, subjectTeacherPairs: any[]): boolean => {
  return subjectTeacherPairs.some(pair => 
    pair.subjectName === subjectName && 
    pair.teacherName === teacherName
  );
};
