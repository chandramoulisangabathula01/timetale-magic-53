import { TimeSlot, Day, TimetableFormData, TimetableEntry, SubjectTeacherPair } from './types';

// Define all possible lab time slot combinations
export const labTimeSlotCombinations = [
  {
    name: 'Morning Lab (9:30-1:00)',
    slots: ['9:30-10:20', '10:20-11:10', '11:20-12:10', '12:10-1:00'] as TimeSlot[],
    display: '9:30-1:00' as TimeSlot
  },
  {
    name: 'Mid-Morning Lab (10:20-2:50)',
    slots: ['10:20-11:10', '11:20-12:10', '12:10-1:00', '2:00-2:50'] as TimeSlot[],
    display: '10:20-2:50' as TimeSlot
  },
  {
    name: 'Mid-Day Lab (11:20-3:40)',
    slots: ['11:20-12:10', '12:10-1:00', '2:00-2:50', '2:50-3:40'] as TimeSlot[],
    display: '11:20-3:40' as TimeSlot
  },
  {
    name: 'Afternoon Lab (12:10-4:30)',
    slots: ['12:10-1:00', '2:00-2:50', '2:50-3:40', '3:40-4:30'] as TimeSlot[],
    display: '12:10-4:30' as TimeSlot
  },
  {
    name: 'Late Lab (2:00-4:30)',
    slots: ['2:00-2:50', '2:50-3:40', '3:40-4:30'] as TimeSlot[],
    display: '2:00-4:30' as TimeSlot
  }
];

// Keep the original definitions for backward compatibility
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
      ((entry.teacherName === teacherName) || 
       (entry.teacherNames && entry.teacherNames.includes(teacherName)))
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
    // Get available days from dayOptions if they exist, or use a default set of days
    const availableDays = formData.dayOptions?.selectedDays || 
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Try to find a day and time slot combination where the lab can be allocated
    const availableDayAndSlot = findAvailableLabTimeSlot(
      availableDays,
      pair.teacherName,
      updatedEntries
    );
    
    if (availableDayAndSlot) {
      const { day, combination } = availableDayAndSlot;
      
      // Create a single entry with the display time slot
      updatedEntries.push({
        day,
        timeSlot: combination.display,
        subjectName: pair.subjectName,
        teacherName: pair.teacherName,
        teacherNames: pair.teacherNames,
        isLab: true,
        batchNumber: pair.batchNumber,
        mergeSlots: true
      });
    }
  });
  
  return updatedEntries;
};

// Helper function to find an available day and time slot for a lab
const findAvailableLabTimeSlot = (
  days: Day[],
  teacherName: string,
  entries: TimetableEntry[]
): { day: Day, combination: typeof labTimeSlotCombinations[0] } | null => {
  // Randomize the lab time slot combinations to ensure diverse allocation
  const randomizedCombinations = [...labTimeSlotCombinations].sort(() => Math.random() - 0.5);
  
  // Try each day and lab combination
  for (const day of days) {
    for (const combination of randomizedCombinations) {
      const isAvailable = !isLabAllocatedInTimeSlot(
        entries,
        day,
        combination.slots,
        teacherName
      );
      
      if (isAvailable) {
        return { day, combination };
      }
    }
  }
  
  return null;
};
