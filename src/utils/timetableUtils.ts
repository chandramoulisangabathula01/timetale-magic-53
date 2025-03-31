
import { v4 as uuidv4 } from 'uuid';
import { 
  Timetable, 
  TimetableFormData, 
  TimetableEntry, 
  SubjectTeacherPair,
  YearType,
  BranchType,
  SemesterType,
  Day,
  TimeSlot,
  LabBatchPair
} from './types';

// Get all timetables from localStorage
export const getTimetables = (): Timetable[] => {
  const timetablesJSON = localStorage.getItem('timetables');
  return timetablesJSON ? JSON.parse(timetablesJSON) : [];
};

// Get a specific timetable by ID
export const getTimetableById = (id: string): Timetable | undefined => {
  const timetables = getTimetables();
  return timetables.find(timetable => timetable.id === id);
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
    timetable.entries.some(entry => 
      entry.teacherName === facultyName || 
      entry.batch1Teacher === facultyName ||
      entry.batch2Teacher === facultyName
    )
  );
};

// Check if teacher is already assigned to any class during this time slot
export const isTeacherAvailable = (
  teacherName: string, 
  day: Day, 
  timeSlot: TimeSlot, 
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
    const conflict = timetable.entries.some(entry => {
      if (entry.day === day && entry.timeSlot === timeSlot && !entry.isBreak && !entry.isLunch) {
        // Check regular teacher assignment
        if (entry.teacherName === teacherName) {
          return true;
        }
        
        // Check batch rotation lab assignments
        if (entry.isBatchRotationLab) {
          if (entry.batch1Teacher === teacherName || entry.batch2Teacher === teacherName) {
            return true;
          }
        }
      }
      return false;
    });
    
    if (conflict) {
      return false; // Teacher is not available
    }
  }
  
  return true; // Teacher is available
};

// Organize labs for batch rotation
const organizeLabsForBatchRotation = (
  labSubjects: SubjectTeacherPair[],
  days: Day[],
  allowedLabTimeSlots: string[]
): LabBatchPair[] => {
  // Only proceed if we have at least 2 lab subjects
  if (labSubjects.length < 2) {
    return [];
  }
  
  console.log("Organizing labs for batch rotation with subjects:", labSubjects);
  
  // Group lab subjects by batch
  const batch1Labs = labSubjects.filter(lab => lab.batchNumber === 'B1');
  const batch2Labs = labSubjects.filter(lab => lab.batchNumber === 'B2');
  
  console.log("B1 Labs:", batch1Labs);
  console.log("B2 Labs:", batch2Labs);
  
  // Create matched lab pairs
  const labPairs: LabBatchPair[] = [];
  
  // Find matching lab pairs with different teachers
  // We'll try to match labs with the same subject name first
  const matchedB1Labs = new Set<string>();
  const matchedB2Labs = new Set<string>();
  
  // First pass - try to match exact same subject names across batches
  for (const b1Lab of batch1Labs) {
    // Find a B2 lab with the same subject name
    const matchingB2Lab = batch2Labs.find(b2Lab => 
      b2Lab.subjectName.toLowerCase() === b1Lab.subjectName.toLowerCase() &&
      !matchedB2Labs.has(b2Lab.id)
    );
    
    if (matchingB2Lab) {
      // Mark these labs as matched
      matchedB1Labs.add(b1Lab.id);
      matchedB2Labs.add(matchingB2Lab.id);
      
      // Find available days for lab rotation
      const availableDays = days.filter(day => day !== 'Saturday'); // Skip Saturday for labs
      
      if (availableDays.length >= 2) {
        // Use the first two available days for rotation
        const day1 = availableDays[0];
        const day2 = availableDays[1];
        
        // We need to use the first lab slot for now
        const timeSlot = allowedLabTimeSlots[0] as TimeSlot;
        
        // Create the first lab pair (day 1)
        labPairs.push({
          day: day1,
          timeSlot,
          batch1: {
            subjectName: b1Lab.subjectName,
            teacherName: b1Lab.teacherName,
            batchNumber: 'B1'
          },
          batch2: {
            subjectName: matchingB2Lab.subjectName,
            teacherName: matchingB2Lab.teacherName,
            batchNumber: 'B2'
          },
          labGroupId: uuidv4()
        });
        
        // Create the second lab pair (day 2) with batches swapped
        labPairs.push({
          day: day2,
          timeSlot,
          batch1: {
            subjectName: matchingB2Lab.subjectName,
            teacherName: matchingB2Lab.teacherName,
            batchNumber: 'B1'
          },
          batch2: {
            subjectName: b1Lab.subjectName,
            teacherName: b1Lab.teacherName,
            batchNumber: 'B2'
          },
          labGroupId: uuidv4()
        });
      }
    }
  }
  
  // Second pass - try to match any remaining unmatched labs
  // If we still have unmatched B1 and B2 labs, we'll pair them regardless of subject name
  const unmatchedB1Labs = batch1Labs.filter(lab => !matchedB1Labs.has(lab.id));
  const unmatchedB2Labs = batch2Labs.filter(lab => !matchedB2Labs.has(lab.id));
  
  for (let i = 0; i < Math.min(unmatchedB1Labs.length, unmatchedB2Labs.length); i++) {
    const b1Lab = unmatchedB1Labs[i];
    const b2Lab = unmatchedB2Labs[i];
    
    // Find available days for lab rotation
    const availableDays = days.filter(day => day !== 'Saturday'); // Skip Saturday for labs
    
    if (availableDays.length >= 2) {
      // Use the first two available days for rotation
      const day1 = availableDays[0];
      const day2 = availableDays[1];
      
      // We need to use the first lab slot for now
      const timeSlot = allowedLabTimeSlots[0] as TimeSlot;
      
      // Create the first lab pair (day 1)
      labPairs.push({
        day: day1,
        timeSlot,
        batch1: {
          subjectName: b1Lab.subjectName,
          teacherName: b1Lab.teacherName,
          batchNumber: 'B1'
        },
        batch2: {
          subjectName: b2Lab.subjectName,
          teacherName: b2Lab.teacherName,
          batchNumber: 'B2'
        },
        labGroupId: uuidv4()
      });
      
      // Create the second lab pair (day 2) with batches swapped
      labPairs.push({
        day: day2,
        timeSlot,
        batch1: {
          subjectName: b2Lab.subjectName,
          teacherName: b2Lab.teacherName,
          batchNumber: 'B1'
        },
        batch2: {
          subjectName: b1Lab.subjectName,
          teacherName: b1Lab.teacherName,
          batchNumber: 'B2'
        },
        labGroupId: uuidv4()
      });
    }
  }
  
  console.log("Generated lab pairs:", labPairs);
  return labPairs;
};

// Generate Timetable Automatically
export const generateTimetable = (formData: TimetableFormData): Timetable => {
  const days: Day[] = formData.year === '4th Year' && formData.dayOptions.useCustomDays
    ? formData.dayOptions.selectedDays
    : formData.year === '4th Year' && formData.dayOptions.fourContinuousDays
      ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const timeSlots: TimeSlot[] = [
    '9:30-10:20', 
    '10:20-11:10', 
    '11:20-12:10', 
    '12:10-1:00', 
    '2:00-2:50', 
    '2:50-3:40', 
    '3:40-4:30'
  ];
  
  // Merged lab time slots
  const labTimeSlots: TimeSlot[] = ['10:20-1:00', '2:00-4:30'];
  
  // Initialize entries with breaks and lunch
  const entries: TimetableEntry[] = [];
  
  // Add breaks and lunch periods
  days.forEach(day => {
    entries.push({
      day,
      timeSlot: '11:10-11:20' as TimeSlot,
      isBreak: true
    });
    
    entries.push({
      day,
      timeSlot: '1:00-2:00' as TimeSlot,
      isLunch: true
    });
  });
  
  // Get non-lab subjects
  const nonLabSubjects = formData.subjectTeacherPairs.filter(pair => !pair.isLab);
  
  // Get lab subjects
  const labSubjects = formData.subjectTeacherPairs.filter(pair => pair.isLab);
  
  console.log("Non-lab subjects:", nonLabSubjects);
  console.log("Lab subjects:", labSubjects);
  
  // Utility function to check if a slot is already filled
  const isSlotFilled = (day: Day, timeSlot: TimeSlot): boolean => {
    return entries.some(entry => 
      entry.day === day && 
      entry.timeSlot === timeSlot
    );
  };
  
  // Add free hours
  if (formData.freeHours.length > 0) {
    // Prefer to allocate free hours on Saturday for years 1-3
    if (formData.year !== '4th Year' && days.includes('Saturday')) {
      // Allocate free hours on Saturday
      timeSlots.forEach(timeSlot => {
        // Randomly select a free hour type from the available options
        const randomIndex = Math.floor(Math.random() * formData.freeHours.length);
        const freeHour = formData.freeHours[randomIndex];
        const freeType = freeHour.type;
        const customType = freeHour.customType;
        
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
      
      // Randomly select a free hour type from the available options
      const randomIndex = Math.floor(Math.random() * formData.freeHours.length);
      const freeHour = formData.freeHours[randomIndex];
      const freeType = freeHour.type;
      const customType = freeHour.customType;
      
      // Allocate some free slots on the last day
      const freeTimeSlots: TimeSlot[] = ['11:20-12:10', '12:10-1:00', '2:00-2:50'];
      freeTimeSlots.forEach(timeSlot => {
        entries.push({
          day: lastDay,
          timeSlot,
          isFree: true,
          freeType: customType || freeType
        });
      });
    }
  }

  // Implement batch rotation for labs if enabled or by default
  const enableBatchRotation = formData.enableBatchRotation !== false;
  
  if (enableBatchRotation && labSubjects.length >= 2) {
    // Organize labs for batch rotation
    const labBatchPairs = organizeLabsForBatchRotation(labSubjects, days, labTimeSlots);
    
    // Add the batch rotation lab entries
    for (const labPair of labBatchPairs) {
      // Determine appropriate time slots based on the merged time slot
      let individualTimeSlots: TimeSlot[] = [];
      
      if (labPair.timeSlot === '10:20-1:00') {
        individualTimeSlots = ['10:20-11:10', '11:20-12:10', '12:10-1:00'] as TimeSlot[];
      } else if (labPair.timeSlot === '2:00-4:30') {
        individualTimeSlots = ['2:00-2:50', '2:50-3:40', '3:40-4:30'] as TimeSlot[];
      }
      
      // Create a batch rotation lab entry for each individual time slot
      for (const timeSlot of individualTimeSlots) {
        const labEntry: TimetableEntry = {
          day: labPair.day,
          timeSlot,
          isLab: true,
          isLabGroup: true,
          labGroupId: labPair.labGroupId,
          isBatchRotationLab: true,
          batch1Subject: labPair.batch1.subjectName,
          batch1Teacher: labPair.batch1.teacherName,
          batch2Subject: labPair.batch2.subjectName,
          batch2Teacher: labPair.batch2.teacherName
        };
        
        entries.push(labEntry);
      }
    }
    
    // Mark the processed lab subjects as allocated
    const allocatedLabSubjects = new Set<string>();
    
    labBatchPairs.forEach(pair => {
      // Find and mark the corresponding lab subjects as allocated
      const batch1SubjectId = labSubjects.find(
        lab => lab.subjectName === pair.batch1.subjectName && lab.teacherName === pair.batch1.teacherName
      )?.id;
      
      const batch2SubjectId = labSubjects.find(
        lab => lab.subjectName === pair.batch2.subjectName && lab.teacherName === pair.batch2.teacherName
      )?.id;
      
      if (batch1SubjectId) allocatedLabSubjects.add(batch1SubjectId);
      if (batch2SubjectId) allocatedLabSubjects.add(batch2SubjectId);
    });
    
    // Filter out labs that have already been allocated in batch rotation
    const remainingLabSubjects = labSubjects.filter(lab => !allocatedLabSubjects.has(lab.id));
    
    // Allocate remaining labs (not part of batch rotation) the regular way
    for (const labSubject of remainingLabSubjects) {
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
          const morningLabSlots: TimeSlot[] = ['9:30-10:20', '10:20-11:10', '11:20-12:10', '12:10-1:00'];
          morningLabSlots.forEach(timeSlot => {
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
            const afternoonLabSlots: TimeSlot[] = ['2:00-2:50', '2:50-3:40', '3:40-4:30'];
            afternoonLabSlots.forEach(timeSlot => {
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
    }
  } else {
    // Regular lab allocation (without batch rotation)
    for (const labSubject of labSubjects) {
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
          const morningLabSlots: TimeSlot[] = ['9:30-10:20', '10:20-11:10', '11:20-12:10', '12:10-1:00'];
          morningLabSlots.forEach(timeSlot => {
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
            const afternoonLabSlots: TimeSlot[] = ['2:00-2:50', '2:50-3:40', '3:40-4:30'];
            afternoonLabSlots.forEach(timeSlot => {
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
    }
  }
  
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
        // Randomly select a free hour type from the available options
        const randomIndex = Math.floor(Math.random() * formData.freeHours.length);
        const freeHour = formData.freeHours[randomIndex];
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
