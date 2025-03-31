
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
  
  // Check for duplicate subject name
  const duplicateNameSubject = subjects.find(s => 
    s.name.toLowerCase() === subject.name.toLowerCase() && 
    s.year === subject.year && 
    s.branch === subject.branch && 
    s.id !== subject.id
  );
  
  if (duplicateNameSubject) {
    throw new Error(`Subject '${subject.name}' already exists for ${subject.year}, ${subject.branch}`);
  }
  
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
      (subject.branch === 'Other' && subject.customBranch === customBranch || subject.branch === 'All')
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

// Initialize default subjects if none exist
export const initializeDefaultSubjects = () => {
  const existingSubjects = getSubjects();
  
  // Only initialize if no subjects exist
  if (existingSubjects.length === 0) {
    const defaultSubjects: Subject[] = [
      {
        id: uuidv4(),
        name: 'Mathematics',
        year: '1st Year',
        branch: 'All',
        isLab: false,
        creditHours: 4
      },
      {
        id: uuidv4(),
        name: 'Physics',
        year: '1st Year',
        branch: 'All',
        isLab: false,
        creditHours: 4
      },
      {
        id: uuidv4(),
        name: 'Chemistry',
        year: '1st Year',
        branch: 'All',
        isLab: false,
        creditHours: 4
      },
      {
        id: uuidv4(),
        name: 'Physics Lab',
        year: '1st Year',
        branch: 'All',
        isLab: true,
        creditHours: 3
      },
      {
        id: uuidv4(),
        name: 'Chemistry Lab',
        year: '1st Year',
        branch: 'All',
        isLab: true,
        creditHours: 3
      },
      {
        id: uuidv4(),
        name: 'Programming Fundamentals',
        year: '1st Year',
        branch: 'CSE',
        isLab: false,
        creditHours: 4
      },
      {
        id: uuidv4(),
        name: 'Engineering Drawing',
        year: '1st Year',
        branch: 'All',
        isLab: false,
        creditHours: 4
      }
    ];
    
    defaultSubjects.forEach(subject => saveSubject(subject));
  }
};
