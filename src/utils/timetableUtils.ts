
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
  FreeHourType
} from './types';

// Faculty list for selection in the login form
export const FACULTY_LIST = [
  "Dr. Smith",
  "Prof. Johnson",
  "Dr. Williams",
  "Prof. Brown",
  "Dr. Jones",
  "Prof. Garcia",
  "Dr. Miller",
  "Prof. Davis",
  "Dr. Rodriguez",
  "Prof. Martinez"
];

const TIMETABLES_STORAGE_KEY = 'timetables';

// Get all timetables from localStorage
export const getTimetables = (): Timetable[] => {
  const timetablesString = localStorage.getItem(TIMETABLES_STORAGE_KEY);
  if (!timetablesString) return [];
  return JSON.parse(timetablesString);
};

// Save a timetable to localStorage
export const saveTimetable = (timetable: Timetable): void => {
  const timetables = getTimetables();
  const existingIndex = timetables.findIndex(t => t.id === timetable.id);
  
  // Make sure timetable has updatedAt field
  const updatedTimetable = {
    ...timetable,
    updatedAt: new Date().toISOString()
  };
  
  if (existingIndex !== -1) {
    // Update existing timetable
    timetables[existingIndex] = updatedTimetable;
  } else {
    // Add new timetable
    timetables.push(updatedTimetable);
  }
  
  localStorage.setItem(TIMETABLES_STORAGE_KEY, JSON.stringify(timetables));
};

// Get a timetable by ID
export const getTimetableById = (id: string): Timetable | null => {
  const timetables = getTimetables();
  return timetables.find(t => t.id === id) || null;
};

// Delete a timetable by ID
export const deleteTimetable = (id: string): void => {
  const timetables = getTimetables();
  const updatedTimetables = timetables.filter(t => t.id !== id);
  localStorage.setItem(TIMETABLES_STORAGE_KEY, JSON.stringify(updatedTimetables));
};

// Get timetables for a specific faculty member
export const getTimetablesForFaculty = (facultyName: string): Timetable[] => {
  const timetables = getTimetables();
  
  // Find timetables where this faculty teaches at least one subject
  return timetables.filter(timetable => {
    const hasSubjectAssigned = timetable.formData.subjectTeacherPairs.some(pair => 
      pair.teacherName === facultyName
    );
    
    return hasSubjectAssigned;
  });
};

// Filter timetables by year, branch, and semester
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

// Count non-lab subjects assigned to a teacher
export const countNonLabSubjectsForTeacher = (
  teacherName: string,
  subjectTeacherPairs: SubjectTeacherPair[]
): number => {
  return subjectTeacherPairs.filter(
    pair => pair.teacherName === teacherName && !pair.isLab
  ).length;
};

// Generate a timetable based on form data
export const generateTimetable = (formData: TimetableFormData): Timetable => {
  const timetableEntries: TimetableEntry[] = [];
  const days = formData.dayOptions.useCustomDays
    ? formData.dayOptions.selectedDays
    : formData.dayOptions.fourContinuousDays
      ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday'] as Day[]
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as Day[];
  
  const timeSlots: TimeSlot[] = [
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
  
  // Create basic structure with breaks and lunch
  days.forEach(day => {
    timeSlots.forEach(timeSlot => {
      if (timeSlot === '11:10-11:20') {
        timetableEntries.push({
          day,
          timeSlot,
          isBreak: true
        });
      } else if (timeSlot === '1:00-2:00') {
        timetableEntries.push({
          day,
          timeSlot,
          isLunch: true
        });
      } else {
        // Empty slot for now
        timetableEntries.push({
          day,
          timeSlot
        });
      }
    });
  });
  
  // Get non-break, non-lunch time slots
  const regularTimeSlots = timetableEntries.filter(
    entry => !entry.isBreak && !entry.isLunch
  );
  
  // Generate actual timetable with subjects
  const nonLabSubjects = formData.subjectTeacherPairs.filter(pair => !pair.isLab);
  const labSubjects = formData.subjectTeacherPairs.filter(pair => pair.isLab);
  
  // Assign non-lab subjects (4 periods each)
  nonLabSubjects.forEach(subject => {
    let assignedCount = 0;
    
    // Try to distribute evenly across days
    days.forEach(day => {
      if (assignedCount >= 4) return;
      
      // Find available slots for this day
      const availableSlotsForDay = regularTimeSlots.filter(
        slot => slot.day === day && !slot.subjectName
      );
      
      // Assign up to 1 slot per day initially
      if (availableSlotsForDay.length > 0) {
        const slotToAssign = availableSlotsForDay[0];
        const index = timetableEntries.findIndex(
          entry => entry.day === slotToAssign.day && entry.timeSlot === slotToAssign.timeSlot
        );
        
        if (index !== -1) {
          timetableEntries[index] = {
            ...timetableEntries[index],
            subjectName: subject.subjectName,
            teacherName: subject.teacherName
          };
          assignedCount++;
        }
      }
    });
    
    // If we haven't assigned all 4 periods, find remaining slots
    while (assignedCount < 4) {
      const availableSlot = regularTimeSlots.find(slot => !slot.subjectName);
      
      if (!availableSlot) break; // No more slots available
      
      const index = timetableEntries.findIndex(
        entry => entry.day === availableSlot.day && entry.timeSlot === availableSlot.timeSlot
      );
      
      if (index !== -1) {
        timetableEntries[index] = {
          ...timetableEntries[index],
          subjectName: subject.subjectName,
          teacherName: subject.teacherName
        };
        assignedCount++;
      }
    }
  });
  
  // Assign lab subjects (consecutive slots, preferably on the same day)
  labSubjects.forEach(lab => {
    const consecutiveSlots = findConsecutiveSlots(timetableEntries);
    
    if (consecutiveSlots.length >= 2) {
      // Assign lab to consecutive slots
      consecutiveSlots.slice(0, 2).forEach(slot => {
        const index = timetableEntries.findIndex(
          entry => entry.day === slot.day && entry.timeSlot === slot.timeSlot
        );
        
        if (index !== -1) {
          timetableEntries[index] = {
            ...timetableEntries[index],
            subjectName: lab.subjectName,
            teacherName: lab.teacherName,
            isLab: true,
            batchNumber: lab.batchNumber
          };
        }
      });
    }
  });
  
  // Assign free hours to remaining slots
  timetableEntries.forEach((entry, index) => {
    if (!entry.isBreak && !entry.isLunch && !entry.subjectName) {
      // Choose a free hour type
      const freeHour = formData.freeHours[Math.floor(Math.random() * formData.freeHours.length)];
      const freeType = freeHour.type === 'Others' && freeHour.customType 
        ? freeHour.customType as FreeHourType 
        : freeHour.type;
      
      timetableEntries[index] = {
        ...entry,
        isFree: true,
        freeType
      };
    }
  });
  
  return {
    id: uuidv4(),
    formData,
    entries: timetableEntries,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Helper function to find consecutive available time slots
const findConsecutiveSlots = (entries: TimetableEntry[]): TimetableEntry[] => {
  const availableSlots = entries.filter(
    entry => !entry.isBreak && !entry.isLunch && !entry.subjectName
  );
  
  // Try to find consecutive slots on the same day
  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as Day[]) {
    const slotsForDay = availableSlots.filter(slot => slot.day === day);
    
    // Find consecutive time slots
    for (let i = 0; i < slotsForDay.length - 1; i++) {
      const currentSlot = slotsForDay[i];
      const nextSlot = slotsForDay[i + 1];
      
      // Simple check for consecutive slots - this could be improved
      // with proper time parsing
      if (currentSlot.timeSlot === '9:30-10:20' && nextSlot.timeSlot === '10:20-11:10') {
        return [currentSlot, nextSlot];
      }
      
      if (currentSlot.timeSlot === '11:20-12:10' && nextSlot.timeSlot === '12:10-1:00') {
        return [currentSlot, nextSlot];
      }
      
      if (currentSlot.timeSlot === '2:00-2:50' && nextSlot.timeSlot === '2:50-3:40') {
        return [currentSlot, nextSlot];
      }
      
      if (currentSlot.timeSlot === '2:50-3:40' && nextSlot.timeSlot === '3:40-4:30') {
        return [currentSlot, nextSlot];
      }
    }
  }
  
  // If no consecutive slots on the same day, return any available slots
  return availableSlots.slice(0, 2);
};
