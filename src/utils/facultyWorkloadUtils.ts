
import { getTimetables } from './timetableUtils';
import { getFaculty } from './facultyUtils';
import { SubjectTeacherPair } from './types';

/**
 * Count how many unique non-lab subjects a faculty is teaching across all timetables
 */
export const countGlobalFacultySubjects = (facultyName: string): number => {
  const timetables = getTimetables();
  const uniqueSubjects = new Set<string>();
  
  // Check current timetables
  timetables.forEach(timetable => {
    timetable.entries.forEach(entry => {
      // Skip non-subject entries like breaks and free hours
      // Also skip lab subjects per new requirement
      if (entry.teacherName === facultyName && 
          entry.subjectName && 
          !entry.isBreak && 
          !entry.isLunch && 
          !entry.isFree && 
          !entry.isLab) {
        // Create a unique key for each subject to avoid counting the same subject multiple times
        // within the same timetable
        const subjectKey = `${timetable.id}-${entry.subjectName}`;
        uniqueSubjects.add(subjectKey);
      }
      
      // Check if this faculty is part of multiple teachers for a lab
      if (entry.teacherNames && entry.teacherNames.includes(facultyName) && 
          entry.subjectName && !entry.isBreak && !entry.isLunch && !entry.isFree && !entry.isLab) {
        const subjectKey = `${timetable.id}-${entry.subjectName}`;
        uniqueSubjects.add(subjectKey);
      }
    });
  });
  
  return uniqueSubjects.size;
};

/**
 * Check if a faculty can be assigned more subjects
 * @param facultyName Faculty name to check
 * @param maxSubjects Maximum number of subjects allowed (default: 3)
 * @returns Object with isAvailable flag and current count
 */
export const isFacultyAvailableForSubjects = (
  facultyName: string, 
  maxSubjects: number = 3
): { isAvailable: boolean; currentCount: number } => {
  const currentCount = countGlobalFacultySubjects(facultyName);
  return {
    isAvailable: currentCount < maxSubjects,
    currentCount
  };
};

/**
 * Get all faculty members with their workload information
 * @param maxSubjects Maximum number of subjects allowed per faculty (default: 3)
 */
export const getFacultyWorkloadInfo = (maxSubjects: number = 3) => {
  const facultyList = getFaculty();
  
  return facultyList.map(faculty => {
    const currentCount = countGlobalFacultySubjects(faculty.name);
    return {
      id: faculty.id,
      name: faculty.name,
      shortName: faculty.shortName,
      assignedSubjects: currentCount,
      remainingCapacity: Math.max(0, maxSubjects - currentCount),
      isAvailable: currentCount < maxSubjects
    };
  });
};

/**
 * Check if adding the new subject-teacher pairs would exceed faculty limits
 * @param pairs New subject-teacher pairs to be added
 * @param maxSubjects Maximum subjects per faculty (default: 3)
 * @returns Object with validation result
 */
export const validateSubjectTeacherPairs = (
  pairs: SubjectTeacherPair[],
  existingPairs: SubjectTeacherPair[] = [],
  maxSubjects: number = 3
): { 
  isValid: boolean; 
  overloadedFaculty: Array<{ name: string; count: number }> 
} => {
  const facultySubjectCounts: Record<string, number> = {};
  const overloadedFaculty: Array<{ name: string; count: number }> = [];
  
  // Filter out lab subjects from pairs
  const nonLabPairs = [...pairs, ...existingPairs].filter(pair => !pair.isLab);
  
  // Check all non-lab pairs to find current counts
  nonLabPairs.forEach(pair => {
    // Handle single teacher
    if (pair.teacherName) {
      const currentGlobalCount = countGlobalFacultySubjects(pair.teacherName);
      facultySubjectCounts[pair.teacherName] = (facultySubjectCounts[pair.teacherName] || 0) + 1;
      
      const totalCount = currentGlobalCount + facultySubjectCounts[pair.teacherName];
      if (totalCount > maxSubjects) {
        if (!overloadedFaculty.some(f => f.name === pair.teacherName)) {
          overloadedFaculty.push({ 
            name: pair.teacherName, 
            count: totalCount 
          });
        }
      }
    }
    
    // Handle multiple teachers
    if (pair.teacherNames && pair.teacherNames.length > 0) {
      pair.teacherNames.forEach(teacherName => {
        const currentGlobalCount = countGlobalFacultySubjects(teacherName);
        facultySubjectCounts[teacherName] = (facultySubjectCounts[teacherName] || 0) + 1;
        
        const totalCount = currentGlobalCount + facultySubjectCounts[teacherName];
        if (totalCount > maxSubjects) {
          if (!overloadedFaculty.some(f => f.name === teacherName)) {
            overloadedFaculty.push({ 
              name: teacherName, 
              count: totalCount 
            });
          }
        }
      });
    }
  });
  
  return {
    isValid: overloadedFaculty.length === 0,
    overloadedFaculty
  };
};
