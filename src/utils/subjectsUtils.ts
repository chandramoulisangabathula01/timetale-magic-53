
import { v4 as uuidv4 } from 'uuid';
import { Subject, SubjectTeacherPair, YearType, BranchType } from './types';

// Get all subjects from local storage
export const getSubjects = (): Subject[] => {
  const subjectsJson = localStorage.getItem('subjects');
  return subjectsJson ? JSON.parse(subjectsJson) : [];
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

// Save a single subject (add or update)
export const saveSubject = (subject: Subject): { success: boolean; message?: string } => {
  try {
    const subjects = getSubjects();
    
    // Validate lab subjects have "lab" in the name
    if (subject.isLab && !subject.name.toLowerCase().includes('lab')) {
      return {
        success: false,
        message: "Lab subject names must include 'lab' (e.g., 'Physics lab')"
      };
    }
    
    const existingIndex = subjects.findIndex(s => s.id === subject.id);
    
    if (existingIndex !== -1) {
      // Update existing subject
      subjects[existingIndex] = subject;
    } else {
      // Add new subject
      subjects.push(subject);
    }
    
    saveSubjects(subjects);
    return { success: true };
  } catch (error) {
    console.error("Error saving subject:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

// Delete a subject by ID
export const deleteSubject = (id: string): void => {
  const subjects = getSubjects();
  const updatedSubjects = subjects.filter(subject => subject.id !== id);
  saveSubjects(updatedSubjects);
};

// Check if a subject name already exists
export const subjectExists = (name: string, excludeId?: string): boolean => {
  const subjects = getSubjects();
  return subjects.some(subject => 
    subject.name.toLowerCase() === name.toLowerCase() &&
    (excludeId ? subject.id !== excludeId : true)
  );
};

// Get subjects filtered by year and branch
export const getFilteredSubjects = (year: YearType, branch: BranchType): Subject[] => {
  const subjects = getSubjects();
  return subjects.filter(subject => 
    subject.years.includes(year) &&
    (subject.branches.includes(branch) || subject.branches.includes('Other' as BranchType))
  );
};

// Check if a subject-teacher pair already exists
export const subjectTeacherPairExists = (
  subjectName: string,
  teacherName: string,
  pairs: SubjectTeacherPair[]
): boolean => {
  return pairs.some(pair => 
    pair.subjectName.toLowerCase() === subjectName.toLowerCase() &&
    pair.teacherName.toLowerCase() === teacherName.toLowerCase()
  );
};

// Initialize default subjects if none exist
export const initializeDefaultSubjects = (): void => {
  const subjects = getSubjects();
  
  if (subjects.length === 0) {
    const defaultSubjects: Subject[] = [
      {
        id: uuidv4(),
        name: 'Mathematics I',
        code: 'MATH101',
        credits: 4,
        isLab: false,
        years: ['1st Year'],
        branches: ['CSE', 'IT', 'ECE', 'EEE']
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
        code: 'PHYLAB101',
        credits: 2,
        isLab: true,
        years: ['1st Year'],
        branches: ['CSE', 'IT', 'ECE', 'EEE']
      },
      {
        id: uuidv4(),
        name: 'Chemistry',
        code: 'CHEM101',
        credits: 3,
        isLab: false,
        years: ['1st Year'],
        branches: ['CSE', 'IT', 'ECE', 'EEE']
      },
      {
        id: uuidv4(),
        name: 'Chemistry lab',
        code: 'CHEMLAB101',
        credits: 2,
        isLab: true,
        years: ['1st Year'],
        branches: ['CSE', 'IT', 'ECE', 'EEE']
      },
      {
        id: uuidv4(),
        name: 'Programming Fundamentals',
        code: 'CS101',
        credits: 3,
        isLab: false,
        years: ['1st Year'],
        branches: ['CSE', 'IT']
      },
      {
        id: uuidv4(),
        name: 'Programming lab',
        code: 'CSLAB101',
        credits: 2,
        isLab: true,
        years: ['1st Year'],
        branches: ['CSE', 'IT']
      },
      {
        id: uuidv4(),
        name: 'Data Structures',
        code: 'CS201',
        credits: 4,
        isLab: false,
        years: ['2nd Year'],
        branches: ['CSE', 'IT']
      },
      {
        id: uuidv4(),
        name: 'Data Structures lab',
        code: 'CSLAB201',
        credits: 2,
        isLab: true,
        years: ['2nd Year'],
        branches: ['CSE', 'IT']
      },
      {
        id: uuidv4(),
        name: 'Database Systems',
        code: 'CS301',
        credits: 4,
        isLab: false,
        years: ['3rd Year'],
        branches: ['CSE', 'IT']
      },
      {
        id: uuidv4(),
        name: 'Database Systems lab',
        code: 'CSLAB301',
        credits: 2,
        isLab: true,
        years: ['3rd Year'],
        branches: ['CSE', 'IT']
      },
      {
        id: uuidv4(),
        name: 'Machine Learning',
        code: 'CS401',
        credits: 4,
        isLab: false,
        years: ['4th Year'],
        branches: ['CSE', 'AI & ML']
      },
      {
        id: uuidv4(),
        name: 'Machine Learning lab',
        code: 'CSLAB401',
        credits: 2,
        isLab: true,
        years: ['4th Year'],
        branches: ['CSE', 'AI & ML']
      }
    ];
    
    saveSubjects(defaultSubjects);
  }
};
