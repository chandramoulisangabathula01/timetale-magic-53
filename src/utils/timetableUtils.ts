import { v4 as uuidv4 } from 'uuid';
import {
  Timetable,
  TimetableEntry,
  TimetableFormData,
  Day,
  TimeSlot,
  SubjectTeacherPair,
  YearType,
  BranchType,
  SemesterType
} from './types';
import { getFaculty } from './facultyUtils';

// Time slots for timetable
export const TIME_SLOTS: TimeSlot[] = [
  '9:30-10:20',
  '10:20-11:10',
  '11:10-11:20', // Break
  '11:20-12:10',
  '12:10-1:00',
  '1:00-2:00',  // Lunch
  '2:00-2:50',
  '2:50-3:40',
  '3:40-4:30'
];

// Regular class time slots (excluding breaks and lunch)
export const REGULAR_TIME_SLOTS: TimeSlot[] = [
  '9:30-10:20',
  '10:20-11:10',
  '11:20-12:10',
  '12:10-1:00',
  '2:00-2:50',
  '2:50-3:40',
  '3:40-4:30'
];

// Lab slot configurations
export const LAB_SLOT_CONFIGURATIONS = [
  // Morning lab slots
  {
    name: '9:30-1:00' as TimeSlot,
    slots: ['9:30-10:20', '10:20-11:10', '11:20-12:10', '12:10-1:00'] as TimeSlot[]
  },
  {
    name: '10:20-1:00' as TimeSlot,
    slots: ['10:20-11:10', '11:20-12:10', '12:10-1:00'] as TimeSlot[]
  },
  // Afternoon lab slots
  {
    name: '2:00-4:30' as TimeSlot,
    slots: ['2:00-2:50', '2:50-3:40', '3:40-4:30'] as TimeSlot[]
  }
];

// Get all faculty names for the dropdown
export const getFacultyList = (): string[] => {
  const faculty = getFaculty();
  return faculty.map(f => f.name);
};

// Get all timetables from local storage
export const getTimetables = (): Timetable[] => {
  const timetablesJson = localStorage.getItem('timetables');
  return timetablesJson ? JSON.parse(timetablesJson) : [];
};

// Save all timetables to local storage
export const saveTimetables = (timetables: Timetable[]): void => {
  localStorage.setItem('timetables', JSON.stringify(timetables));
};

// Get a timetable by ID
export const getTimetableById = (id: string): Timetable | null => {
  const timetables = getTimetables();
  return timetables.find(timetable => timetable.id === id) || null;
};

// Save a single timetable (add or update)
export const saveTimetable = (timetable: Timetable): { success: boolean; message?: string } => {
  try {
    const timetables = getTimetables();
    const existingIndex = timetables.findIndex(t => t.id === timetable.id);
    
    if (existingIndex !== -1) {
      // Update existing timetable
      timetables[existingIndex] = timetable;
    } else {
      // Add new timetable
      timetables.push(timetable);
    }
    
    saveTimetables(timetables);
    return { success: true };
  } catch (error) {
    console.error("Error saving timetable:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

// Delete a timetable by ID
export const deleteTimetable = (id: string): void => {
  const timetables = getTimetables();
  const updatedTimetables = timetables.filter(timetable => timetable.id !== id);
  saveTimetables(updatedTimetables);
};

// Check if a timetable exists for given criteria
export const doesTimetableExist = (
  formData: TimetableFormData,
  excludeId?: string
): boolean => {
  const timetables = getTimetables();
  return timetables.some(timetable => 
    timetable.formData.year === formData.year &&
    timetable.formData.branch === formData.branch &&
    timetable.formData.semester === formData.semester &&
    (excludeId ? timetable.id !== excludeId : true)
  );
};

// Count non-lab subjects for teacher
export const countNonLabSubjectsForTeacher = (
  teacherName: string,
  pairs: SubjectTeacherPair[]
): number => {
  return pairs.filter(pair => pair.teacherName === teacherName && !pair.isLab).length;
};

// Filter timetables based on criteria
export const filterTimetables = (
  year: YearType,
  branch: BranchType,
  semester: SemesterType
): Timetable[] => {
  const timetables = getTimetables();
  return timetables.filter(timetable => 
    timetable.formData.year === year &&
    timetable.formData.branch === branch &&
    timetable.formData.semester === semester
  );
};

// Get timetables for a specific faculty member
export const getTimetablesForFaculty = (facultyName: string): Timetable[] => {
  const timetables = getTimetables();
  return timetables.filter(timetable => 
    timetable.entries.some(entry => entry.teacherName === facultyName)
  );
};

// Generate automatic timetable
export const generateTimetable = (formData: TimetableFormData): Timetable => {
  // Determine days based on configuration
  let days: Day[];
  
  if (formData.year === '4th Year') {
    days = formData.dayOptions.useCustomDays 
      ? formData.dayOptions.selectedDays
      : formData.dayOptions.fourContinuousDays 
        ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  } else {
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }
  
  // Initialize entries with breaks and lunch
  const entries: TimetableEntry[] = [];
  
  // Add break and lunch slots
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
  
  // Create a mapping of subjects by type
  const labSubjects = formData.subjectTeacherPairs.filter(pair => pair.isLab);
  const nonLabSubjects = formData.subjectTeacherPairs.filter(pair => !pair.isLab);
  
  // Track used slots to avoid conflicts
  const usedSlots: Record<string, boolean> = {};
  
  // Mark break and lunch slots as used
  entries.forEach(entry => {
    usedSlots[`${entry.day}-${entry.timeSlot}`] = true;
  });
  
  // Helper function to check if a slot is available
  const isSlotAvailable = (day: Day, timeSlot: TimeSlot): boolean => {
    return !usedSlots[`${day}-${timeSlot}`];
  };
  
  // Helper function to mark a slot as used
  const markSlotAsUsed = (day: Day, timeSlot: TimeSlot, value = true): void => {
    usedSlots[`${day}-${timeSlot}`] = value;
  };
  
  // Step 1: Allocate Lab Subjects
  if (labSubjects.length > 0) {
    let labSubjectPairs: { subject1: SubjectTeacherPair, subject2: SubjectTeacherPair | null }[] = [];
    
    // Create pairs of lab subjects if possible
    if (labSubjects.length >= 2) {
      for (let i = 0; i < labSubjects.length; i += 2) {
        if (i + 1 < labSubjects.length) {
          labSubjectPairs.push({
            subject1: labSubjects[i],
            subject2: labSubjects[i + 1]
          });
        } else {
          labSubjectPairs.push({
            subject1: labSubjects[i],
            subject2: null
          });
        }
      }
    } else {
      labSubjectPairs.push({
        subject1: labSubjects[0],
        subject2: null
      });
    }
    
    // Allocate the lab subject pairs
    labSubjectPairs.forEach((pair, pairIndex) => {
      // Try to find available lab slots
      for (const labConfig of LAB_SLOT_CONFIGURATIONS) {
        for (const day of days) {
          // Check if all slots in the lab configuration are available
          const allSlotsAvailable = labConfig.slots.every(slot => isSlotAvailable(day, slot));
          
          if (allSlotsAvailable) {
            // Allocate the first lab subject
            for (const slot of labConfig.slots) {
              entries.push({
                day,
                timeSlot: slot,
                subjectName: pair.subject1.subjectName,
                teacherName: pair.subject1.teacherName,
                isLab: true,
                batchNumber: 'B1',
                isLabGroup: true,
                labGroupId: `lab-group-${pairIndex}-1`
              });
              
              markSlotAsUsed(day, slot);
            }
            
            // Find another day for the second batch or subject
            let secondDay = null;
            for (const otherDay of days) {
              if (otherDay !== day) {
                const allOtherSlotsAvailable = labConfig.slots.every(slot => isSlotAvailable(otherDay, slot));
                if (allOtherSlotsAvailable) {
                  secondDay = otherDay;
                  break;
                }
              }
            }
            
            if (secondDay) {
              // If there's a second subject in the pair
              if (pair.subject2) {
                // First subject gets batch 1, second subject gets batch 2 on first day
                for (const slot of labConfig.slots) {
                  entries.push({
                    day: secondDay,
                    timeSlot: slot,
                    subjectName: pair.subject1.subjectName,
                    teacherName: pair.subject1.teacherName,
                    isLab: true,
                    batchNumber: 'B2',
                    isLabGroup: true,
                    labGroupId: `lab-group-${pairIndex}-2`
                  });
                  
                  markSlotAsUsed(secondDay, slot);
                }
                
                // Find a third day for the second subject, batch 1
                let thirdDay = null;
                for (const otherDay of days) {
                  if (otherDay !== day && otherDay !== secondDay) {
                    const allOtherSlotsAvailable = labConfig.slots.every(slot => isSlotAvailable(otherDay, slot));
                    if (allOtherSlotsAvailable) {
                      thirdDay = otherDay;
                      break;
                    }
                  }
                }
                
                if (thirdDay) {
                  // Allocate second subject, batch 1
                  for (const slot of labConfig.slots) {
                    entries.push({
                      day: thirdDay,
                      timeSlot: slot,
                      subjectName: pair.subject2.subjectName,
                      teacherName: pair.subject2.teacherName,
                      isLab: true,
                      batchNumber: 'B1',
                      isLabGroup: true,
                      labGroupId: `lab-group-${pairIndex}-3`
                    });
                    
                    markSlotAsUsed(thirdDay, slot);
                  }
                  
                  // Find a fourth day for the second subject, batch 2
                  let fourthDay = null;
                  for (const otherDay of days) {
                    if (otherDay !== day && otherDay !== secondDay && otherDay !== thirdDay) {
                      const allOtherSlotsAvailable = labConfig.slots.every(slot => isSlotAvailable(otherDay, slot));
                      if (allOtherSlotsAvailable) {
                        fourthDay = otherDay;
                        break;
                      }
                    }
                  }
                  
                  if (fourthDay) {
                    // Allocate second subject, batch 2
                    for (const slot of labConfig.slots) {
                      entries.push({
                        day: fourthDay,
                        timeSlot: slot,
                        subjectName: pair.subject2.subjectName,
                        teacherName: pair.subject2.teacherName,
                        isLab: true,
                        batchNumber: 'B2',
                        isLabGroup: true,
                        labGroupId: `lab-group-${pairIndex}-4`
                      });
                      
                      markSlotAsUsed(fourthDay, slot);
                    }
                  }
                }
              } else {
                // If there's only one lab subject, allocate both batches
                for (const slot of labConfig.slots) {
                  entries.push({
                    day: secondDay,
                    timeSlot: slot,
                    subjectName: pair.subject1.subjectName,
                    teacherName: pair.subject1.teacherName,
                    isLab: true,
                    batchNumber: 'B2',
                    isLabGroup: true,
                    labGroupId: `lab-group-${pairIndex}-2`
                  });
                  
                  markSlotAsUsed(secondDay, slot);
                }
              }
            }
            
            break; // Stop looking for days for this lab config once found
          }
        }
      }
    });
  }
  
  // Step 2: Allocate Non-Lab Subjects (each gets 4 periods)
  nonLabSubjects.forEach((subject, subjectIndex) => {
    let allocatedPeriods = 0;
    let attemptedTwoPeriods = false;
    
    // Try to allocate 2 consecutive periods first (for 2 subjects)
    if (!attemptedTwoPeriods && allocatedPeriods < 4) {
      for (const day of days) {
        // Check consecutive slots availability
        for (let i = 0; i < REGULAR_TIME_SLOTS.length - 1; i++) {
          const firstSlot = REGULAR_TIME_SLOTS[i];
          const secondSlot = REGULAR_TIME_SLOTS[i + 1];
          
          // Skip if slots are separated by break or lunch
          if (
            (firstSlot === '10:20-11:10' && secondSlot === '11:20-12:10') ||
            (firstSlot === '12:10-1:00' && secondSlot === '2:00-2:50')
          ) {
            continue;
          }
          
          if (isSlotAvailable(day, firstSlot) && isSlotAvailable(day, secondSlot)) {
            // Allocate 2 consecutive periods
            entries.push({
              day,
              timeSlot: firstSlot,
              subjectName: subject.subjectName,
              teacherName: subject.teacherName,
              isLab: false
            });
            
            entries.push({
              day,
              timeSlot: secondSlot,
              subjectName: subject.subjectName,
              teacherName: subject.teacherName,
              isLab: false
            });
            
            markSlotAsUsed(day, firstSlot);
            markSlotAsUsed(day, secondSlot);
            
            allocatedPeriods += 2;
            break;
          }
        }
        
        if (allocatedPeriods >= 2) {
          attemptedTwoPeriods = true;
          break;
        }
      }
    }
    
    // Allocate remaining individual periods (to reach 4 total)
    while (allocatedPeriods < 4) {
      let periodAllocated = false;
      
      for (const day of days) {
        if (periodAllocated) break;
        
        for (const timeSlot of REGULAR_TIME_SLOTS) {
          if (isSlotAvailable(day, timeSlot)) {
            entries.push({
              day,
              timeSlot,
              subjectName: subject.subjectName,
              teacherName: subject.teacherName,
              isLab: false
            });
            
            markSlotAsUsed(day, timeSlot);
            allocatedPeriods++;
            periodAllocated = true;
            break;
          }
        }
      }
      
      if (!periodAllocated) {
        // Could not allocate all 4 periods
        console.warn(`Could not allocate all 4 periods for ${subject.subjectName}`);
        break;
      }
    }
  });
  
  // Step 3: Allocate Free Hours (Using specified free hour types)
  for (const day of days) {
    for (const timeSlot of REGULAR_TIME_SLOTS) {
      if (isSlotAvailable(day, timeSlot)) {
        // Get a free hour type from the provided options
        const freeHourIndex = Math.floor(Math.random() * formData.freeHours.length);
        const freeHour = formData.freeHours[freeHourIndex];
        
        entries.push({
          day,
          timeSlot,
          isFree: true,
          freeType: freeHour.type === 'Others' && freeHour.customType 
            ? freeHour.customType 
            : freeHour.type
        });
        
        markSlotAsUsed(day, timeSlot);
      }
    }
  }
  
  return {
    id: uuidv4(),
    formData,
    entries,
    createdAt: new Date().toISOString()
  };
};
