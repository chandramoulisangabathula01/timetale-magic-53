
import { TimetableEntry, SubjectTeacherPair } from "./types";

// Format teacher names for display in the timetable
export const formatTeacherNames = (entry: TimetableEntry): string => {
  if (entry.teacherNames && entry.teacherNames.length > 0) {
    return entry.teacherNames.join(" & ");
  }
  return entry.teacherName || "";
};

// Convert old format (single teacherName) to new format (teacherNames array)
export const normalizeTeacherData = (entry: TimetableEntry): TimetableEntry => {
  const normalizedEntry = { ...entry };
  
  // If teacherNames doesn't exist but teacherName does, create teacherNames array
  if (!normalizedEntry.teacherNames && normalizedEntry.teacherName) {
    normalizedEntry.teacherNames = [normalizedEntry.teacherName];
  }
  
  return normalizedEntry;
};

// Prepare subject-teacher pair for saving (ensures both old and new formats are maintained)
export const prepareSubjectTeacherPair = (
  pair: SubjectTeacherPair
): SubjectTeacherPair => {
  const prepared = { ...pair };
  
  // Ensure backward compatibility
  if (prepared.teacherNames && prepared.teacherNames.length > 0) {
    prepared.teacherName = prepared.teacherNames[0]; // Keep primary teacher in teacherName
  }
  
  return prepared;
};
