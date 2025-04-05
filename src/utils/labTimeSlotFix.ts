
import { TimeSlot, Day, TimetableFormData, TimetableEntry, SubjectTeacherPair } from './types';

// Define the lab time slots
export const morningLabTimeSlots: TimeSlot[] = ['9:30-10:20', '10:20-11:10', '11:20-12:10', '12:10-1:00'];
export const afternoonLabTimeSlots: TimeSlot[] = ['2:00-2:50', '2:50-3:40', '3:40-4:30'];

// Helper function to check if a subject is allocated in specific time slots
export const isLabAllocatedInTimeSlot = (
  entries: TimetableEntry[],
  day: Day,
  timeSlots: TimeSlot[],
  teacherName: string
): boolean => {
  return timeSlots.some(timeSlot => 
    entries.some(entry => 
      entry.day === day && 
      entry.timeSlot === timeSlot && 
      entry.teacherName === teacherName
    )
  );
};

// Function to allocate labs in proper time slots
export const allocateLabsInProperTimeSlots = (
  formData: TimetableFormData,
  entries: TimetableEntry[],
  labPairs: SubjectTeacherPair[]
): TimetableEntry[] => {
  // Make a copy of entries to avoid mutating the original
  const updatedEntries = [...entries];
  
  // Process each lab subject-teacher pair
  labPairs.forEach(pair => {
    // Try to find a day and time slot where the lab can be allocated
    const availableDayAndSlot = findAvailableDayAndTimeSlotForLab(
      formData.days,
      pair.teacherName,
      updatedEntries
    );
    
    if (availableDayAndSlot) {
      const { day, timeSlots } = availableDayAndSlot;
      
      // Allocate the lab to the consecutive time slots
      timeSlots.forEach(timeSlot => {
        updatedEntries.push({
          day,
          timeSlot,
          subjectName: pair.subjectName,
          teacherName: pair.teacherName,
          isLab: true,
          batchNumber: pair.batchNumber,
        });
      });
    }
  });
  
  return updatedEntries;
};

// Helper function to find an available day and time slot for a lab
const findAvailableDayAndTimeSlotForLab = (
  days: Day[],
  teacherName: string,
  entries: TimetableEntry[]
): { day: Day, timeSlots: TimeSlot[] } | null => {
  // First try morning lab slots
  for (const day of days) {
    const isMorningAvailable = !isLabAllocatedInTimeSlot(
      entries,
      day,
      morningLabTimeSlots,
      teacherName
    );
    
    if (isMorningAvailable) {
      return { day, timeSlots: morningLabTimeSlots };
    }
  }
  
  // Then try afternoon lab slots
  for (const day of days) {
    const isAfternoonAvailable = !isLabAllocatedInTimeSlot(
      entries,
      day,
      afternoonLabTimeSlots,
      teacherName
    );
    
    if (isAfternoonAvailable) {
      return { day, timeSlots: afternoonLabTimeSlots };
    }
  }
  
  return null;
};
