
import { getFaculty } from './facultyUtils';
import { countFacultySubjectAssignments, canAssignSubjectToFaculty } from './timetableUtils';

export interface FacultyWorkload {
  id: string;
  name: string;
  shortName?: string;
  assignedSubjects: number;
  remainingCapacity: number;
  maxSubjects: number;
  isAvailable: boolean;
}

export const MAX_FACULTY_SUBJECTS = 3;

// Get workload information for all faculty members
export const getAllFacultyWorkloads = (): FacultyWorkload[] => {
  const faculty = getFaculty();
  
  return faculty.map(f => {
    const assignedSubjects = countFacultySubjectAssignments(f.name);
    const remainingCapacity = Math.max(0, MAX_FACULTY_SUBJECTS - assignedSubjects);
    
    return {
      id: f.id,
      name: f.name,
      shortName: f.shortName,
      assignedSubjects,
      remainingCapacity,
      maxSubjects: MAX_FACULTY_SUBJECTS,
      isAvailable: assignedSubjects < MAX_FACULTY_SUBJECTS
    };
  });
};

// Get workload for a specific faculty member
export const getFacultyWorkload = (facultyName: string): FacultyWorkload | undefined => {
  const faculty = getFaculty().find(f => f.name === facultyName);
  
  if (!faculty) return undefined;
  
  const assignedSubjects = countFacultySubjectAssignments(facultyName);
  const remainingCapacity = Math.max(0, MAX_FACULTY_SUBJECTS - assignedSubjects);
  
  return {
    id: faculty.id,
    name: faculty.name,
    shortName: faculty.shortName,
    assignedSubjects,
    remainingCapacity,
    maxSubjects: MAX_FACULTY_SUBJECTS,
    isAvailable: assignedSubjects < MAX_FACULTY_SUBJECTS
  };
};
