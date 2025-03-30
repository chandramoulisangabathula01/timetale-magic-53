
import { v4 as uuidv4 } from 'uuid';
import { 
  Timetable, 
  TimetableFormData, 
  TimetableEntry, 
  SubjectTeacherPair,
  YearType,
  BranchType,
  SemesterType,
  Day
} from './types';

// Get all timetables from localStorage
export const getTimetables = (): Timetable[] => {
  const timetablesJSON = localStorage.getItem('timetables');
  return timetablesJSON ? JSON.parse(timetablesJSON) : [];
};

// Save a timetable to localStorage
export const saveTimetable = (timetable: Timetable): { success: boolean, message?: string } => {
  try {
    const timetables = getTimetables();
    
    // Check if this is an update or a new timetable
    const existingIndex = timetables.findIndex(t => t.id === timetable.id);
    
    if (existingIndex >= 0) {
      // Update existing timetable
      timetables[existingIndex] = timetable;
    } else {
      // Add new timetable
      timetables.push(timetable);
    }
    
    localStorage.setItem('timetables', JSON.stringify(timetables));
    return { success: true };
  } catch (error) {
    console.error("Error saving timetable:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
};

// Delete a timetable from localStorage
export const deleteTimetable = (id: string): void => {
  const timetables = getTimetables();
  const updatedTimetables = timetables.filter(t => t.id !== id);
  localStorage.setItem('timetables', JSON.stringify(updatedTimetables));
};

// Check if a timetable with the same year, branch and semester already exists
export const doesTimetableExist = (formData: TimetableFormData, excludeId?: string): boolean => {
  const timetables = getTimetables();
  return timetables.some(t => 
    t.formData.year === formData.year && 
    t.formData.branch === formData.branch && 
    t.formData.semester === formData.semester &&
    t.id !== excludeId
  );
};

// Count how many non-lab subjects are assigned to a teacher
export const countNonLabSubjectsForTeacher = (teacherName: string, subjectTeacherPairs: SubjectTeacherPair[]): number => {
  return subjectTeacherPairs.filter(pair => 
    pair.teacherName === teacherName && !pair.isLab
  ).length;
};

// Filter timetables based on year, branch and semester
export const filterTimetables = (year: YearType, branch: BranchType, semester: SemesterType): Timetable[] => {
  const timetables = getTimetables();
  return timetables.filter(t => 
    t.formData.year === year && 
    t.formData.branch === branch && 
    t.formData.semester === semester
  );
};

// Get timetables where a specific faculty is teaching
export const getTimetablesForFaculty = (facultyName: string): Timetable[] => {
  const timetables = getTimetables();
  return timetables.filter(timetable => 
    timetable.entries.some(entry => entry.teacherName === facultyName)
  );
};

// Check if teacher is already assigned to any class during this time slot
export const isTeacherAvailable = (
  teacherName: string, 
  day: Day, 
  timeSlot: string, 
  currentTimetableId?: string
): boolean => {
  const allTimetables = getTimetables();
  
  // Look through all timetables (excluding the current one being edited)
  for (const timetable of allTimetables) {
    // Skip the current timetable if we're editing it
    if (currentTimetableId && timetable.id === currentTimetableId) {
      continue;
    }
    
    // Check if teacher has another class at this time
    const conflict = timetable.entries.some(entry => 
      entry.day === day && 
      entry.timeSlot === timeSlot && 
      entry.teacherName === teacherName &&
      !entry.isBreak &&
      !entry.isLunch
    );
    
    if (conflict) {
      return false; // Teacher is not available
    }
  }
  
  return true; // Teacher is available
};

// Generate Timetable Automatically
export const generateTimetable = (formData: TimetableFormData): Timetable => {
  const days: Day[] = formData.year === '4th Year' && formData.dayOptions.useCustomDays
    ? formData.dayOptions.selectedDays
    : formData.year === '4th Year' && formData.dayOptions.fourContinuousDays
      ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const timeSlots = [
    '9:30-10:20', 
    '10:20-11:10', 
    '11:20-12:10', 
    '12:10-1:00', 
    '2:00-2:50', 
    '2:50-3:40', 
    '3:40-4:30'
  ];
  
  // Initialize entries with breaks and lunch
  const entries: TimetableEntry[] = [];
  
  // Add breaks and lunch periods
  days.forEach(day => {
    entries.push({
      day,
      timeSlot: '11:10-11:20',
      isBreak: true
    });
    
    entries.push({
      day,
      timeSlot: '1:00-2:00',
      isLunch: true
    });
  });
  
  // Get non-lab subjects
  const nonLabSubjects = formData.subjectTeacherPairs.filter(pair => !pair.isLab);
  
  // Get lab subjects
  const labSubjects = formData.subjectTeacherPairs.filter(pair => pair.isLab);
  
  // Add free hours
  if (formData.freeHours.length > 0) {
    // Prefer to allocate free hours on Saturday for years 1-3
    if (formData.year !== '4th Year' && days.includes('Saturday')) {
      // Allocate free hours on Saturday
      timeSlots.forEach(timeSlot => {
        const freeType = formData.freeHours[0].type;
        const customType = formData.freeHours[0].customType;
        
        entries.push({
          day: 'Saturday',
          timeSlot,
          isFree: true,
          freeType: customType || freeType
        });
      });
    } else {
      // For 4th Year or if Saturday is not available, distribute free hours
      // throughout the week
      const lastDay = days[days.length - 1];
      const freeType = formData.freeHours[0].type;
      const customType = formData.freeHours[0].customType;
      
      // Allocate some free slots on the last day
      ['11:20-12:10', '12:10-1:00', '2:00-2:50'].forEach(timeSlot => {
        entries.push({
          day: lastDay,
          timeSlot,
          isFree: true,
          freeType: customType || freeType
        });
      });
    }
  }
  
  // Utility function to check if a slot is already filled
  const isSlotFilled = (day: Day, timeSlot: string): boolean => {
    return entries.some(entry => 
      entry.day === day && 
      entry.timeSlot === timeSlot
    );
  };
  
  // Allocate lab subjects (they need merged slots)
  labSubjects.forEach(labSubject => {
    let allocated = false;
    
    // Try to allocate labs in the morning slots (9:30-1:00)
    for (const day of days) {
      // Skip Saturday for lab allocation
      if (day === 'Saturday') continue;
      
      // Check if morning slots are available
      const morningSlotsFree = !isSlotFilled(day, '9:30-10:20') && 
                               !isSlotFilled(day, '10:20-11:10') && 
                               !isSlotFilled(day, '11:20-12:10') && 
                               !isSlotFilled(day, '12:10-1:00');
      
      // Check if teacher is available for all these slots
      const teacherAvailable = isTeacherAvailable(labSubject.teacherName, day, '9:30-10:20') &&
                              isTeacherAvailable(labSubject.teacherName, day, '10:20-11:10') &&
                              isTeacherAvailable(labSubject.teacherName, day, '11:20-12:10') &&
                              isTeacherAvailable(labSubject.teacherName, day, '12:10-1:00');
      
      if (morningSlotsFree && teacherAvailable) {
        // Create a lab group ID to associate these entries
        const labGroupId = uuidv4();
        
        // Allocate the lab in merged slots from 9:30 to 1:00
        // We'll create separate entries but mark them as part of the same lab group
        ['9:30-10:20', '10:20-11:10', '11:20-12:10', '12:10-1:00'].forEach((timeSlot, index) => {
          entries.push({
            day,
            timeSlot,
            subjectName: labSubject.subjectName,
            teacherName: labSubject.teacherName,
            isLab: true,
            batchNumber: labSubject.batchNumber,
            isLabGroup: true,
            labGroupId
          });
        });
        
        allocated = true;
        break;
      }
    }
    
    // If not allocated in morning, try afternoon slots (2:00-4:30)
    if (!allocated) {
      for (const day of days) {
        // Skip Saturday for lab allocation
        if (day === 'Saturday') continue;
        
        // Check if afternoon slots are available
        const afternoonSlotsFree = !isSlotFilled(day, '2:00-2:50') && 
                                  !isSlotFilled(day, '2:50-3:40') && 
                                  !isSlotFilled(day, '3:40-4:30');
        
        // Check if teacher is available for all these slots
        const teacherAvailable = isTeacherAvailable(labSubject.teacherName, day, '2:00-2:50') &&
                                isTeacherAvailable(labSubject.teacherName, day, '2:50-3:40') &&
                                isTeacherAvailable(labSubject.teacherName, day, '3:40-4:30');
        
        if (afternoonSlotsFree && teacherAvailable) {
          // Create a lab group ID to associate these entries
          const labGroupId = uuidv4();
          
          // Allocate the lab in merged slots from 2:00 to 4:30
          ['2:00-2:50', '2:50-3:40', '3:40-4:30'].forEach(timeSlot => {
            entries.push({
              day,
              timeSlot,
              subjectName: labSubject.subjectName,
              teacherName: labSubject.teacherName,
              isLab: true,
              batchNumber: labSubject.batchNumber,
              isLabGroup: true,
              labGroupId
            });
          });
          
          allocated = true;
          break;
        }
      }
    }
    
    // If still not allocated, try to find any available consecutive slots
    if (!allocated) {
      dayLoop: for (const day of days) {
        // Skip Saturday for lab allocation
        if (day === 'Saturday') continue;
        
        for (let i = 0; i < timeSlots.length - 2; i++) {
          const consecutive = [timeSlots[i], timeSlots[i+1], timeSlots[i+2]];
          
          // Check if all consecutive slots are available
          const allSlotsFree = consecutive.every(timeSlot => !isSlotFilled(day, timeSlot));
          
          // Check if teacher is available for all these slots
          const teacherAvailable = consecutive.every(timeSlot => 
            isTeacherAvailable(labSubject.teacherName, day, timeSlot)
          );
          
          if (allSlotsFree && teacherAvailable) {
            // Create a lab group ID to associate these entries
            const labGroupId = uuidv4();
            
            // Allocate the lab in these consecutive slots
            consecutive.forEach(timeSlot => {
              entries.push({
                day,
                timeSlot,
                subjectName: labSubject.subjectName,
                teacherName: labSubject.teacherName,
                isLab: true,
                batchNumber: labSubject.batchNumber,
                isLabGroup: true,
                labGroupId
              });
            });
            
            allocated = true;
            break dayLoop;
          }
        }
      }
    }
  });
  
  // Allocate non-lab subjects (4 periods each)
  nonLabSubjects.forEach(subject => {
    let allocatedPeriods = 0;
    
    // Allocate 4 periods for each non-lab subject
    while (allocatedPeriods < 4) {
      // Try to find an empty slot
      let allocated = false;
      
      dayLoop: for (const day of days) {
        // Skip Saturday for regular subject allocation if possible
        if (day === 'Saturday' && formData.year !== '4th Year') continue;
        
        for (const timeSlot of timeSlots) {
          // Check if this slot is available
          if (!isSlotFilled(day, timeSlot)) {
            // Check if teacher is available during this time slot
            if (!isTeacherAvailable(subject.teacherName, day, timeSlot)) {
              continue; // Teacher is already assigned elsewhere, try another slot
            }
            
            // Allocate this period
            entries.push({
              day,
              timeSlot,
              subjectName: subject.subjectName,
              teacherName: subject.teacherName,
              isLab: false
            });
            
            allocatedPeriods++;
            allocated = true;
            break dayLoop;
          }
        }
      }
      
      // If we couldn't allocate a period, we need to try harder
      if (!allocated) {
        // Try again, including Saturday
        for (const day of days) {
          for (const timeSlot of timeSlots) {
            if (!isSlotFilled(day, timeSlot)) {
              // Check if teacher is available during this time slot
              if (!isTeacherAvailable(subject.teacherName, day, timeSlot)) {
                continue; // Teacher is already assigned elsewhere, try another slot
              }
              
              entries.push({
                day,
                timeSlot,
                subjectName: subject.subjectName,
                teacherName: subject.teacherName,
                isLab: false
              });
              
              allocatedPeriods++;
              allocated = true;
              break;
            }
          }
          
          if (allocated) break;
        }
      }
      
      // If still not allocated, we might have to replace some free periods
      if (!allocated) {
        // Find a free period to replace
        for (const day of days) {
          for (const timeSlot of timeSlots) {
            const freeEntry = entries.find(e => 
              e.day === day && 
              e.timeSlot === timeSlot && 
              e.isFree
            );
            
            if (freeEntry) {
              // Check if teacher is available during this time slot
              if (!isTeacherAvailable(subject.teacherName, day, timeSlot)) {
                continue; // Teacher is already assigned elsewhere, try another slot
              }
              
              // Replace the free period with this subject
              const index = entries.indexOf(freeEntry);
              entries[index] = {
                day,
                timeSlot,
                subjectName: subject.subjectName,
                teacherName: subject.teacherName,
                isLab: false
              };
              
              allocatedPeriods++;
              allocated = true;
              break;
            }
          }
          
          if (allocated) break;
        }
      }
      
      // If we still couldn't allocate, we might be out of slots
      if (!allocated) {
        console.warn(`Could not allocate all 4 periods for ${subject.subjectName}`);
        break;
      }
    }
  });
  
  // For any remaining empty slots, fill with free periods
  days.forEach(day => {
    timeSlots.forEach(timeSlot => {
      if (!isSlotFilled(day, timeSlot)) {
        // Get the first free hour type
        const freeHour = formData.freeHours[0];
        const freeType = freeHour.type;
        const customType = freeHour.customType;
        
        entries.push({
          day,
          timeSlot,
          isFree: true,
          freeType: customType || freeType
        });
      }
    });
  });
  
  // Create the timetable object
  const timetable: Timetable = {
    id: uuidv4(),
    formData,
    entries,
    createdAt: new Date().toISOString()
  };
  
  return timetable;
};
