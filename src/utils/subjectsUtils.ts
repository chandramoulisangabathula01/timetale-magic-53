
import { v4 as uuidv4 } from 'uuid';
import { Subject, YearType, BranchType, SubjectTeacherPair } from './types';

// Type for temporary subject data when creating/editing subjects
export interface SubjectData {
  id: string;
  name: string;
  code: string;
  credits: number;
  isLab: boolean;
  years: YearType[];
  branches: (BranchType | string)[];
  customBranches?: string[];
}

// Get all subjects from local storage
export const getSubjects = (): Subject[] => {
  const subjectsJson = localStorage.getItem('subjects');
  let subjects = subjectsJson ? JSON.parse(subjectsJson) : [];
  
  // Ensure all subjects have the required properties
  subjects = subjects.map((subject: any) => ({
    id: subject.id || uuidv4(),
    name: subject.name || '',
    code: subject.code || '',
    credits: subject.credits || 0,
    isLab: subject.isLab || false,
    years: Array.isArray(subject.years) ? subject.years : (subject.year ? [subject.year] : ['1st Year']),
    branches: Array.isArray(subject.branches) ? subject.branches : (subject.branch ? [subject.branch] : ['CSE']),
    customBranches: Array.isArray(subject.customBranches) ? subject.customBranches : []
  }));
  
  return subjects;
};

// Save all subjects to local storage
export const saveSubjects = (subjects: Subject[]): void => {
  localStorage.setItem('subjects', JSON.stringify(subjects));
};

// Get a subject by ID
export const getSubjectById = (id: string): Subject | null => {
  const subjects = getSubjects();
  return subjects.find(subject => subject.id === id) || null;
};

// Add a new subject
export const addSubject = (subjectData: SubjectData): void => {
  const subjects = getSubjects();
  
  // Process custom branches if applicable
  if (subjectData.branches.includes('Other') && subjectData.customBranches) {
    // Replace 'Other' with actual custom branch names
    const otherIndex = subjectData.branches.indexOf('Other');
    if (otherIndex !== -1) {
      subjectData.branches.splice(otherIndex, 1, ...subjectData.customBranches);
    }
  }
  
  subjects.push(subjectData as Subject);
  saveSubjects(subjects);
};

// Update an existing subject
export const updateSubject = (subjectData: SubjectData): void => {
  const subjects = getSubjects();
  const index = subjects.findIndex(s => s.id === subjectData.id);
  
  // Process custom branches if applicable
  if (subjectData.branches.includes('Other') && subjectData.customBranches) {
    // Replace 'Other' with actual custom branch names
    const otherIndex = subjectData.branches.indexOf('Other');
    if (otherIndex !== -1) {
      subjectData.branches.splice(otherIndex, 1, ...subjectData.customBranches);
    }
  }
  
  if (index !== -1) {
    subjects[index] = subjectData as Subject;
    saveSubjects(subjects);
  }
};

// Save or update a subject
export const saveSubject = (subject: Subject): void => {
  const subjects = getSubjects();
  const existingIndex = subjects.findIndex(s => s.id === subject.id);
  
  if (existingIndex !== -1) {
    subjects[existingIndex] = subject;
  } else {
    subjects.push(subject);
  }
  
  saveSubjects(subjects);
};

// Delete a subject by ID
export const deleteSubject = (id: string): void => {
  const subjects = getSubjects();
  const updatedSubjects = subjects.filter(subject => subject.id !== id);
  saveSubjects(updatedSubjects);
};

// Get subjects filtered by year and branch
export const getFilteredSubjects = (year: YearType, branch: BranchType | string): Subject[] => {
  const subjects = getSubjects();
  // Safely filter subjects with proper checks
  return subjects.filter(subject => {
    // Check if years and branches exist and are arrays before using includes
    return subject && 
           subject.years && 
           Array.isArray(subject.years) && 
           subject.branches && 
           Array.isArray(subject.branches) && 
           subject.years.includes(year) && 
           (subject.branches.includes(branch as BranchType) || 
            subject.branches.some(b => b === branch));
  });
};

// Check if a subject-teacher pair already exists
export const subjectTeacherPairExists = (
  subjectName: string, 
  teacherName: string, 
  pairs: SubjectTeacherPair[]
): boolean => {
  return pairs.some(pair => 
    pair.subjectName === subjectName && 
    pair.teacherName === teacherName
  );
};

// Initialize default subjects if none exist
export const initializeDefaultSubjects = (): void => {
  const subjects = getSubjects();
  
  if (subjects.length === 0) {
    const defaultSubjects: Subject[] = [
      {
        id: uuidv4(),
        name: 'Mathematics',
        code: 'MATH101',
        credits: 4,
        isLab: false,
        years: ['1st Year'],
        branches: ['CSE', 'IT', 'ECE']
      },
      {
        id: uuidv4(),
        name: 'Physics',
        code: 'PHY101',
        credits: 3,
        isLab: false,
        years: ['1st Year'],
        branches: ['CSE', 'IT', 'ECE', 'EEE']
      },
      {
        id: uuidv4(),
        name: 'Physics lab',
        code: 'PHYL101',
        credits: 2,
        isLab: true,
        years: ['1st Year'],
        branches: ['CSE', 'IT', 'ECE', 'EEE']
      },
      {
        id: uuidv4(),
        name: 'Computer Programming',
        code: 'CP101',
        credits: 4,
        isLab: false,
        years: ['1st Year'],
        branches: ['CSE', 'IT']
      },
      {
        id: uuidv4(),
        name: 'Computer Programming lab',
        code: 'CPL101',
        credits: 2,
        isLab: true,
        years: ['1st Year'],
        branches: ['CSE', 'IT']
      },
      {
        id: uuidv4(),
        name: 'Database Systems',
        code: 'DBS201',
        credits: 4,
        isLab: false,
        years: ['2nd Year'],
        branches: ['CSE', 'IT']
      },
      {
        id: uuidv4(),
        name: 'Database Systems lab',
        code: 'DBSL201',
        credits: 2,
        isLab: true,
        years: ['2nd Year'],
        branches: ['CSE', 'IT']
      }
    ];
    
    saveSubjects(defaultSubjects);
  }
};

// Get all unique branches from subjects
export const getAllBranches = (): (BranchType | string)[] => {
  const subjects = getSubjects();
  const branchSet = new Set<string>();
  
  // Collect all branch values
  subjects.forEach(subject => {
    if (Array.isArray(subject.branches)) {
      subject.branches.forEach(branch => {
        branchSet.add(branch);
      });
    }
  });
  
  // Convert to array and sort
  return Array.from(branchSet).sort();
};
