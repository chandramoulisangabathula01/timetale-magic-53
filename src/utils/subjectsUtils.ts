
import { v4 as uuidv4 } from 'uuid';
import { YearType, BranchType, Subject } from './types';

// Get all subjects from localStorage
export const getSubjects = (): Subject[] => {
  const subjects = JSON.parse(localStorage.getItem('subjects') || '[]');
  return subjects;
};

// Save a subject to localStorage
export const saveSubject = (subject: Subject) => {
  const subjects = getSubjects();
  const existingIndex = subjects.findIndex(s => s.id === subject.id);
  
  if (existingIndex >= 0) {
    subjects[existingIndex] = subject;
  } else {
    subjects.push({
      ...subject,
      id: subject.id || uuidv4()
    });
  }
  
  localStorage.setItem('subjects', JSON.stringify(subjects));
  return subject;
};

// Delete a subject from localStorage
export const deleteSubject = (id: string) => {
  const subjects = getSubjects();
  const updatedSubjects = subjects.filter(s => s.id !== id);
  localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
};

// Get filtered subjects by year and branch
export const getFilteredSubjects = (year: YearType, branch: BranchType, customBranch?: string): Subject[] => {
  const subjects = getSubjects();
  
  // If branch is "Other", we need to use the customBranch value for filtering
  if (branch === 'Other' && customBranch) {
    return subjects.filter(subject => 
      subject.year === year && 
      (subject.branch === customBranch || subject.branch === 'All')
    );
  }
  
  // Standard case - filter by exact year and branch match
  return subjects.filter(subject => 
    subject.year === year && 
    (subject.branch === branch || subject.branch === 'All')
  );
};

// Check if a subject-teacher pair already exists
export const subjectTeacherPairExists = (
  subjectName: string, 
  teacherName: string, 
  existingPairs: { subjectName: string, teacherName: string }[]
) => {
  return existingPairs.some(
    pair => pair.subjectName === subjectName && pair.teacherName === teacherName
  );
};
