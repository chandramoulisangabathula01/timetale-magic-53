
import { TimeSlot, Day, TimetableFormData, TimetableEntry, SubjectTeacherPair, Timetable } from './types';
import { morningLabTimeSlots, afternoonLabTimeSlots, allocateLabsInProperTimeSlots } from './labTimeSlotFix';
import { formatDateToDDMMYYYY } from '../components/timetable/TimetableHeaderInfoDateFix';

// Helper function to extract initials/short name
export const getShortName = (fullName: string): string => {
  if (!fullName) return '';
  
  // Split by spaces and get first letter of each part
  return fullName
    .split(' ')
    .map(part => part.charAt(0))
    .join('');
};

// Function to check if entries already exist in the specified day and timeslot
export const hasExistingEntries = (
  entries: TimetableEntry[],
  day: Day,
  timeSlots: TimeSlot[]
): boolean => {
  return timeSlots.some(slot => 
    entries.some(entry => entry.day === day && entry.timeSlot === slot)
  );
};

// Function to apply all the patches to the timetable generation process
export const applyTimetableSystemPatches = (
  formData: TimetableFormData,
  timetableEntries: TimetableEntry[]
): TimetableEntry[] => {
  // Filter out lab subject-teacher pairs
  const labPairs = formData.subjectTeacherPairs.filter(pair => pair.isLab);
  
  // Remove existing lab entries
  const nonLabEntries = timetableEntries.filter(entry => !entry.isLab);
  
  // Allocate labs in proper time slots
  return allocateLabsInProperTimeSlots(formData, nonLabEntries, labPairs);
};

// Function to format the W.e.f date
export const formatWefDate = (wef: string): string => {
  return formatDateToDDMMYYYY(wef);
};

// Function to patch a loaded timetable
export const patchLoadedTimetable = (timetable: Timetable): Timetable => {
  // Format the W.e.f date
  const patchedFormData = {
    ...timetable.formData,
    // Remove credit hours if present
    subjectTeacherPairs: timetable.formData.subjectTeacherPairs.map(pair => {
      const { creditHours, ...rest } = pair as any;
      return rest;
    })
  };
  
  return {
    ...timetable,
    formData: patchedFormData
  };
};
