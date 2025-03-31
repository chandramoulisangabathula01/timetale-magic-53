import { v4 as uuidv4 } from 'uuid';
import { 
  Timetable, 
  TimetableEntry, 
  TimetableFormData, 
  Day, 
  TimeSlot, 
  FreeHourType,
  SubjectTeacherPair 
} from './types';

// Get all timetables from localStorage
export const getTimetables = (): Timetable[] => {
  const timetables = localStorage.getItem('timetables');
  return timetables ? JSON.parse(timetables) : [];
};

// Save timetable to localStorage
export const saveTimetable = (timetable: Timetable): { success: boolean; message?: string } => {
  if (!timetable.id) {
    timetable.id = uuidv4();
  }
  
  if (!timetable.createdAt) {
    timetable.createdAt = new Date().toISOString();
  }

  try {
    const timetables = getTimetables();
    
    // Check if this is a new timetable or an update
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
      message: error instanceof Error ? error.message : "Unknown error saving timetable" 
    };
  }
};

// Get a specific timetable by ID
export const getTimetableById = (id: string): Timetable | undefined => {
  const timetables = getTimetables();
  return timetables.find(timetable => timetable.id === id);
};

// Delete a timetable by ID
export const deleteTimetable = (id: string): boolean => {
  try {
    const timetables = getTimetables();
    const updatedTimetables = timetables.filter(timetable => timetable.id !== id);
    localStorage.setItem('timetables', JSON.stringify(updatedTimetables));
    return true;
  } catch (error) {
    console.error("Error deleting timetable:", error);
    return false;
  }
};

// Add the missing filterTimetables function
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

// Generate a timetable based on form data
export const generateTimetable = (formData: TimetableFormData): Timetable => {
  const entries: TimetableEntry[] = [];
  const timeSlots: TimeSlot[] = [
    '9:30-10:20', 
    '10:20-11:10', 
    '11:20-12:10', 
    '12:10-1:00', 
    '2:00-2:50', 
    '2:50-3:40', 
    '3:40-4:30'
  ];
  
  // Define break and lunch periods
  const breakSlot: TimeSlot = '11:10-11:20';
  const lunchSlot: TimeSlot = '1:00-2:00';
  
  // Define which days to use based on year and options
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
  
  // Add break and lunch slots for all days
  days.forEach(day => {
    // Add break slot
    entries.push({
      day,
      timeSlot: breakSlot,
      isBreak: true
    });
    
    // Add lunch slot
    entries.push({
      day,
      timeSlot: lunchSlot,
      isLunch: true
    });
  });
  
  // Split subjects into lab and non-lab subjects
  const labSubjects = formData.subjectTeacherPairs.filter(pair => pair.isLab);
  const nonLabSubjects = formData.subjectTeacherPairs.filter(pair => !pair.isLab);
  
  // Group lab subjects by batch for rotation
  const batchGroups: { [key: string]: SubjectTeacherPair[] } = {};
  
  if (formData.enableBatchRotation) {
    labSubjects.forEach(lab => {
      if (lab.batchNumber) {
        const batch = lab.batchNumber;
        if (!batchGroups[batch]) {
          batchGroups[batch] = [];
        }
        batchGroups[batch].push(lab);
      }
    });
  }
  
  // Create arrays to track allocated slots
  const allocatedSlots: { day: Day; timeSlot: TimeSlot }[] = [];
  const allocatedTeacherSlots: { day: Day; timeSlot: TimeSlot; teacherName: string }[] = [];
  
  // Function to check if a slot is already allocated
  const isSlotAllocated = (day: Day, timeSlot: TimeSlot): boolean => {
    return allocatedSlots.some(slot => slot.day === day && slot.timeSlot === timeSlot);
  };
  
  // Function to check if a teacher is already allocated for a specific day and timeslot
  const isTeacherAllocated = (day: Day, timeSlot: TimeSlot, teacherName: string): boolean => {
    return allocatedTeacherSlots.some(
      slot => slot.day === day && slot.timeSlot === timeSlot && slot.teacherName === teacherName
    );
  };
  
  // Allocate lab subjects first (they need continuous blocks)
  
  // Define lab time slots
  const morningLabSlots: TimeSlot[] = ['9:30-10:20', '10:20-11:10', '11:20-12:10', '12:10-1:00'];
  const afternoonLabSlots: TimeSlot[] = ['2:00-2:50', '2:50-3:40', '3:40-4:30'];
  
  // Handle batch rotation for labs
  if (formData.enableBatchRotation && Object.keys(batchGroups).length >= 2) {
    // Get B1 and B2 groups
    const b1Labs = batchGroups['B1'] || [];
    const b2Labs = batchGroups['B2'] || [];
    
    if (b1Labs.length > 0 && b2Labs.length > 0) {
      // Create lab pairs for rotation
      const labPairs: { b1: SubjectTeacherPair; b2: SubjectTeacherPair }[] = [];
      
      for (let i = 0; i < Math.min(b1Labs.length, b2Labs.length); i++) {
        labPairs.push({
          b1: b1Labs[i],
          b2: b2Labs[i]
        });
      }
      
      // Allocate lab pairs to different days
      const labDays = [...days].sort(() => Math.random() - 0.5).slice(0, labPairs.length * 2);
      
      for (let i = 0; i < labPairs.length && i * 2 + 1 < labDays.length; i++) {
        const pair = labPairs[i];
        const day1 = labDays[i * 2];
        const day2 = labDays[i * 2 + 1];
        
        // Day 1: B1 lab in morning, B2 lab in afternoon if possible
        const labGroupId1 = uuidv4();
        
        // Add morning lab entry for B1 on day 1
        entries.push({
          day: day1,
          timeSlot: '9:30-1:00',
          subjectName: pair.b1.subjectName,
          teacherName: pair.b1.teacherName,
          isLab: true,
          batchNumber: 'B1',
          isLabGroup: true,
          labGroupId: labGroupId1
        });
        
        // Add morning lab entry for B2 on day 1
        entries.push({
          day: day1,
          timeSlot: '9:30-1:00',
          subjectName: pair.b2.subjectName,
          teacherName: pair.b2.teacherName,
          isLab: true,
          batchNumber: 'B2',
          isLabGroup: true,
          labGroupId: labGroupId1
        });
        
        // Mark all morning slots as allocated for day 1
        morningLabSlots.forEach(slot => {
          allocatedSlots.push({ day: day1, timeSlot: slot });
          allocatedTeacherSlots.push({ day: day1, timeSlot: slot, teacherName: pair.b1.teacherName });
          allocatedTeacherSlots.push({ day: day1, timeSlot: slot, teacherName: pair.b2.teacherName });
        });
        
        // Day 2: B2 lab in morning, B1 lab in afternoon if available
        const labGroupId2 = uuidv4();
        
        // Add morning lab entry for B2 on day 2
        entries.push({
          day: day2,
          timeSlot: '9:30-1:00',
          subjectName: pair.b1.subjectName,
          teacherName: pair.b1.teacherName,
          isLab: true,
          batchNumber: 'B2',
          isLabGroup: true,
          labGroupId: labGroupId2
        });
        
        // Add morning lab entry for B1 on day 2
        entries.push({
          day: day2,
          timeSlot: '9:30-1:00',
          subjectName: pair.b2.subjectName,
          teacherName: pair.b2.teacherName,
          isLab: true,
          batchNumber: 'B1',
          isLabGroup: true,
          labGroupId: labGroupId2
        });
        
        // Mark all morning slots as allocated for day 2
        morningLabSlots.forEach(slot => {
          allocatedSlots.push({ day: day2, timeSlot: slot });
          allocatedTeacherSlots.push({ day: day2, timeSlot: slot, teacherName: pair.b1.teacherName });
          allocatedTeacherSlots.push({ day: day2, timeSlot: slot, teacherName: pair.b2.teacherName });
        });
      }
    }
  } else {
    // Handle labs without batch rotation
    labSubjects.forEach(lab => {
      // Try to find a day where morning slots are free
      const availableDays = days.filter(day => 
        !morningLabSlots.some(slot => isSlotAllocated(day, slot) || 
          isTeacherAllocated(day, slot, lab.teacherName))
      );
      
      if (availableDays.length > 0) {
        const labDay = availableDays[Math.floor(Math.random() * availableDays.length)];
        
        // Add lab entry spanning the morning slots
        entries.push({
          day: labDay,
          timeSlot: '9:30-1:00',
          subjectName: lab.subjectName,
          teacherName: lab.teacherName,
          isLab: true,
          batchNumber: lab.batchNumber
        });
        
        // Mark all morning slots as allocated
        morningLabSlots.forEach(slot => {
          allocatedSlots.push({ day: labDay, timeSlot: slot });
          allocatedTeacherSlots.push({ day: labDay, timeSlot: slot, teacherName: lab.teacherName });
        });
      } else {
        // Try afternoon slots if morning isn't available
        const availableDaysAfternoon = days.filter(day => 
          !afternoonLabSlots.some(slot => isSlotAllocated(day, slot) || 
            isTeacherAllocated(day, slot, lab.teacherName))
        );
        
        if (availableDaysAfternoon.length > 0) {
          const labDay = availableDaysAfternoon[Math.floor(Math.random() * availableDaysAfternoon.length)];
          
          // Add lab entry spanning the afternoon slots
          entries.push({
            day: labDay,
            timeSlot: '2:00-4:30',
            subjectName: lab.subjectName,
            teacherName: lab.teacherName,
            isLab: true,
            batchNumber: lab.batchNumber
          });
          
          // Mark all afternoon slots as allocated
          afternoonLabSlots.forEach(slot => {
            allocatedSlots.push({ day: labDay, timeSlot: slot });
            allocatedTeacherSlots.push({ day: labDay, timeSlot: slot, teacherName: lab.teacherName });
          });
        }
      }
    });
  }
  
  // Allocate non-lab subjects (4 periods per week)
  nonLabSubjects.forEach(subject => {
    let allocatedPeriodsCount = 0;
    
    // We need 4 periods per week for each subject
    while (allocatedPeriodsCount < 4) {
      // Get all available slots
      const availableSlots = [];
      
      for (const day of days) {
        for (const timeSlot of timeSlots) {
          if (!isSlotAllocated(day, timeSlot) && 
              !isTeacherAllocated(day, timeSlot, subject.teacherName)) {
            availableSlots.push({ day, timeSlot });
          }
        }
      }
      
      if (availableSlots.length === 0) {
        // No more available slots
        break;
      }
      
      // Select a random available slot
      const randomIndex = Math.floor(Math.random() * availableSlots.length);
      const selectedSlot = availableSlots[randomIndex];
      
      // Add entry
      entries.push({
        day: selectedSlot.day,
        timeSlot: selectedSlot.timeSlot,
        subjectName: subject.subjectName,
        teacherName: subject.teacherName,
        isLab: false
      });
      
      // Mark as allocated
      allocatedSlots.push({ day: selectedSlot.day, timeSlot: selectedSlot.timeSlot });
      allocatedTeacherSlots.push({ 
        day: selectedSlot.day, 
        timeSlot: selectedSlot.timeSlot, 
        teacherName: subject.teacherName 
      });
      
      allocatedPeriodsCount++;
    }
  });
  
  // Allocate free hours for remaining slots
  days.forEach(day => {
    timeSlots.forEach(timeSlot => {
      if (!isSlotAllocated(day, timeSlot)) {
        // Select a random free hour type
        const randomFreeHourIndex = Math.floor(Math.random() * formData.freeHours.length);
        const freeHour = formData.freeHours[randomFreeHourIndex];
        
        entries.push({
          day,
          timeSlot,
          isFree: true,
          freeType: freeHour.type,
          customFreeType: freeHour.type === 'Others' ? freeHour.customType : undefined,
          mergeSlots: freeHour.mergeSlots
        });
      }
    });
  });

  return {
    id: uuidv4(),
    formData,
    entries,
    createdAt: new Date().toISOString()
  };
};

// Count how many non-lab subjects are assigned to a teacher
export const countNonLabSubjectsForTeacher = (
  teacherName: string, 
  pairs: SubjectTeacherPair[]
): number => {
  return pairs.filter(pair => pair.teacherName === teacherName && !pair.isLab).length;
};

// Check if a timetable with the same year, branch, and semester already exists
export const doesTimetableExist = (
  formData: TimetableFormData,
  excludeId?: string
): boolean => {
  const timetables = getTimetables();
  
  return timetables.some(timetable => 
    timetable.id !== excludeId &&
    timetable.formData.year === formData.year &&
    timetable.formData.branch === formData.branch &&
    timetable.formData.semester === formData.semester
  );
};

// Get all timetables for a specific faculty
export const getTimetablesForFaculty = (facultyName: string): Timetable[] => {
  const timetables = getTimetables();
  
  return timetables.filter(timetable => 
    timetable.entries.some(entry => 
      entry.teacherName === facultyName && 
      !entry.isBreak && 
      !entry.isLunch
    )
  );
};

// Check if a teacher is available at a specific day and time slot
export const isTeacherAvailable = (
  teacherName: string, 
  day: Day, 
  timeSlot: TimeSlot
): boolean => {
  const timetables = getTimetables();
  
  return !timetables.some(timetable => 
    timetable.entries.some(entry => 
      entry.day === day && 
      entry.timeSlot === timeSlot && 
      entry.teacherName === teacherName &&
      !entry.isBreak &&
      !entry.isLunch
    )
  );
};
