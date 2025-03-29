import { v4 as uuidv4 } from 'uuid';
import { 
  Day, 
  FreeHourType,
  LabTimeSlot,
  SubjectTeacherPair, 
  TimeSlot,
  Timetable, 
  TimetableEntry, 
  TimetableFormData
} from './types';

// Sample data for demonstration 
const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS: TimeSlot[] = [
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

const LAB_TIME_SLOTS: LabTimeSlot[] = ['9:30-1:00', '10:20-1:00', '2:00-4:30'];

// Function to check if a teacher is already booked in a given time slot
export const isTeacherBooked = (
  teacherName: string,
  day: Day,
  timeSlot: TimeSlot | LabTimeSlot,
  existingEntries: TimetableEntry[]
): boolean => {
  return existingEntries.some(entry => 
    entry.teacherName === teacherName && 
    entry.day === day &&
    entry.timeSlot === timeSlot
  );
};

// Function to check if a teacher is assigned to 3 or more non-lab subjects
export const countNonLabSubjectsForTeacher = (
  teacherName: string,
  subjectTeacherPairs: SubjectTeacherPair[]
): number => {
  return subjectTeacherPairs.filter(pair => 
    pair.teacherName === teacherName && !pair.isLab
  ).length;
};

// Function to generate a basic timetable based on form data
export const generateTimetable = (formData: TimetableFormData): Timetable => {
  const entries: TimetableEntry[] = [];
  const selectedDays = formData.dayOptions.useCustomDays 
    ? formData.dayOptions.selectedDays 
    : formData.dayOptions.fourContinuousDays 
      ? DAYS.slice(0, 4) 
      : DAYS;

  // Add break and lunch slots for each day
  selectedDays.forEach(day => {
    // Add all time slots as empty initially
    TIME_SLOTS.forEach(timeSlot => {
      if (timeSlot === '11:10-11:20') {
        entries.push({
          day,
          timeSlot,
          isBreak: true
        });
      } else if (timeSlot === '1:00-2:00') {
        entries.push({
          day,
          timeSlot,
          isLunch: true
        });
      } else {
        entries.push({
          day,
          timeSlot
        });
      }
    });
  });

  // Schedule lab subjects first (they have priority)
  const labSubjects = formData.subjectTeacherPairs.filter(pair => pair.isLab);
  
  labSubjects.forEach(labSubject => {
    // Find a suitable day and lab time slot
    let scheduled = false;
    
    for (const day of selectedDays) {
      for (const labSlot of LAB_TIME_SLOTS) {
        // Check if all the regular time slots covered by this lab slot are free
        const coveredRegularSlots = getRegularSlotsForLabSlot(labSlot);
        const allSlotsFree = coveredRegularSlots.every(regularSlot => {
          return !entries.some(entry => 
            entry.day === day && 
            entry.timeSlot === regularSlot && 
            (entry.subjectName || entry.isFree)
          );
        });
        
        if (allSlotsFree && !isTeacherBooked(labSubject.teacherName, day, labSlot, entries)) {
          // Schedule the lab
          entries.push({
            day,
            timeSlot: labSlot,
            subjectName: labSubject.subjectName,
            teacherName: labSubject.teacherName,
            isLab: true,
            batchNumber: labSubject.batchNumber
          });
          
          // Mark the covered regular slots as used
          coveredRegularSlots.forEach(regularSlot => {
            // Remove the original regular slot entry
            const index = entries.findIndex(entry => 
              entry.day === day && entry.timeSlot === regularSlot
            );
            if (index !== -1) {
              entries.splice(index, 1);
            }
          });
          
          scheduled = true;
          break;
        }
      }
      if (scheduled) break;
    }
  });

  // Schedule regular subjects (allocate 4 periods per week)
  const regularSubjects = formData.subjectTeacherPairs.filter(pair => !pair.isLab);
  
  // Ensure all days have subjects scheduled
  regularSubjects.forEach(subject => {
    let periodsScheduled = 0;
    const maxPeriodsPerSubject = 4;
    const maxPeriodsPerDay = 2;
    
    // Track scheduled periods per day
    const periodsPerDay: Record<Day, number> = {} as Record<Day, number>;
    selectedDays.forEach(day => {
      periodsPerDay[day] = 0;
    });
    
    // Try to distribute periods evenly across different days
    while (periodsScheduled < maxPeriodsPerSubject) {
      let scheduledThisRound = false;
      
      // First, try to schedule at least one period per day
      for (const day of selectedDays) {
        if (periodsScheduled >= maxPeriodsPerSubject) break;
        
        // Skip if this day already has the maximum periods for this subject
        if (periodsPerDay[day] >= maxPeriodsPerDay) continue;
        
        // Find an available time slot
        const availableSlots = entries.filter(entry => 
          entry.day === day && 
          !entry.isBreak && 
          !entry.isLunch && 
          !entry.subjectName && 
          !entry.isFree
        );
        
        for (const entry of availableSlots) {
          if (!isTeacherBooked(subject.teacherName, day, entry.timeSlot as TimeSlot, entries)) {
            // Schedule the subject
            entry.subjectName = subject.subjectName;
            entry.teacherName = subject.teacherName;
            
            periodsScheduled++;
            periodsPerDay[day]++;
            scheduledThisRound = true;
            break;
          }
        }
      }
      
      // If we couldn't schedule any more periods this round, break to avoid infinite loop
      if (!scheduledThisRound) {
        break;
      }
    }
    
    if (periodsScheduled < maxPeriodsPerSubject) {
      console.warn(`Could only schedule ${periodsScheduled} periods for ${subject.subjectName}`);
    }
  });

  // Schedule free hours based on configured free hour types
  const availableSlots = entries.filter(entry => 
    !entry.isBreak && 
    !entry.isLunch && 
    !entry.subjectName && 
    !entry.isFree
  );
  
  availableSlots.forEach((entry, index) => {
    const freeHourIndex = index % formData.freeHours.length;
    const freeHour = formData.freeHours[freeHourIndex] || { type: 'Library' };
    
    entry.isFree = true;
    entry.freeType = freeHour.type === 'Others' && freeHour.customType 
      ? freeHour.customType as FreeHourType
      : freeHour.type;
  });

  return {
    id: uuidv4(),
    formData,
    entries,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Helper function to get the regular time slots covered by a lab time slot
function getRegularSlotsForLabSlot(labSlot: LabTimeSlot): TimeSlot[] {
  switch (labSlot) {
    case '9:30-1:00':
      return ['9:30-10:20', '10:20-11:10', '11:20-12:10', '12:10-1:00'];
    case '10:20-1:00':
      return ['10:20-11:10', '11:20-12:10', '12:10-1:00'];
    case '2:00-4:30':
      return ['2:00-2:50', '2:50-3:40', '3:40-4:30'];
    default:
      return [];
  }
}

// Sample faculty data
export const FACULTY_LIST = [
  'Dr. Vanisree',
  'Prof. John Smith',
  'Dr. Emily Johnson',
  'Prof. David Wilson',
  'Dr. Sarah Parker',
  'Prof. Michael Brown',
  'Dr. Jennifer Lee',
  'Prof. Robert Davis',
  'Dr. Linda Miller',
  'Prof. Thomas Anderson'
];

// Sample timetable data for demonstration
export const sampleTimetables: Timetable[] = [
  {
    id: '1',
    formData: {
      year: '3rd Year',
      semester: 'I',
      branch: 'CSE',
      courseName: 'B.Tech',
      roomNumber: '301',
      academicYear: '2023-2024',
      classInchargeName: 'Dr. Vanisree',
      mobileNumber: '9876543210',
      date: '2023-08-15',
      subjectTeacherPairs: [
        {
          id: '1',
          subjectName: 'Data Structures',
          teacherName: 'Dr. Vanisree',
          isLab: false
        },
        {
          id: '2',
          subjectName: 'Database Management',
          teacherName: 'Prof. John Smith',
          isLab: false
        },
        {
          id: '3',
          subjectName: 'Computer Networks',
          teacherName: 'Dr. Emily Johnson',
          isLab: false
        },
        {
          id: '4',
          subjectName: 'Programming Lab',
          teacherName: 'Prof. David Wilson',
          isLab: true,
          batchNumber: 'B1'
        }
      ],
      freeHours: [
        { type: 'Library' },
        { type: 'Sports' }
      ],
      dayOptions: {
        fourContinuousDays: true,
        useCustomDays: false,
        selectedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
      }
    },
    entries: [],
    createdAt: '2023-08-10T10:00:00Z',
    updatedAt: '2023-08-10T10:00:00Z'
  },
  {
    id: '2',
    formData: {
      year: '4th Year',
      semester: 'II',
      branch: 'AI & ML',
      courseName: 'B.Tech',
      roomNumber: '405',
      academicYear: '2023-2024',
      classInchargeName: 'Dr. Sarah Parker',
      mobileNumber: '9876543211',
      date: '2023-08-16',
      subjectTeacherPairs: [
        {
          id: '1',
          subjectName: 'Machine Learning',
          teacherName: 'Dr. Sarah Parker',
          isLab: false
        },
        {
          id: '2',
          subjectName: 'Deep Learning',
          teacherName: 'Prof. Michael Brown',
          isLab: false
        },
        {
          id: '3',
          subjectName: 'Data Analytics',
          teacherName: 'Dr. Jennifer Lee',
          isLab: false
        },
        {
          id: '4',
          subjectName: 'AI Lab',
          teacherName: 'Prof. Robert Davis',
          isLab: true,
          batchNumber: 'B1'
        }
      ],
      freeHours: [
        { type: 'Project' },
        { type: 'Library' }
      ],
      dayOptions: {
        fourContinuousDays: false,
        useCustomDays: false,
        selectedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      }
    },
    entries: [],
    createdAt: '2023-08-11T10:00:00Z',
    updatedAt: '2023-08-11T10:00:00Z'
  }
];

// Initialize both sample timetables with entries
sampleTimetables.forEach(timetable => {
  timetable.entries = generateTimetable(timetable.formData).entries;
});

// Function to save a timetable to localStorage
export const saveTimetable = (timetable: Timetable): void => {
  const existingTimetables = getTimetables();
  const index = existingTimetables.findIndex(t => t.id === timetable.id);
  
  if (index !== -1) {
    existingTimetables[index] = timetable;
  } else {
    existingTimetables.push(timetable);
  }
  
  localStorage.setItem('timetables', JSON.stringify(existingTimetables));
};

// Function to retrieve all timetables from localStorage
export const getTimetables = (): Timetable[] => {
  const timetablesJson = localStorage.getItem('timetables');
  if (!timetablesJson) {
    // Initialize with sample data
    localStorage.setItem('timetables', JSON.stringify(sampleTimetables));
    return sampleTimetables;
  }
  return JSON.parse(timetablesJson);
};

// Function to retrieve a specific timetable by ID
export const getTimetableById = (id: string): Timetable | undefined => {
  const timetables = getTimetables();
  return timetables.find(t => t.id === id);
};

// Function to delete a timetable by ID
export const deleteTimetable = (id: string): void => {
  const timetables = getTimetables();
  const updatedTimetables = timetables.filter(t => t.id !== id);
  localStorage.setItem('timetables', JSON.stringify(updatedTimetables));
};

// Function to filter timetables by criteria
export const filterTimetables = (
  year?: string,
  branch?: string,
  semester?: string
): Timetable[] => {
  const timetables = getTimetables();
  
  return timetables.filter(timetable => {
    const matchYear = !year || timetable.formData.year === year;
    const matchBranch = !branch || timetable.formData.branch === branch || 
      (timetable.formData.branch === 'Other' && timetable.formData.customBranch === branch);
    const matchSemester = !semester || timetable.formData.semester === semester;
    
    return matchYear && matchBranch && matchSemester;
  });
};

// Function to get timetables for a specific faculty
export const getTimetablesForFaculty = (facultyName: string): Timetable[] => {
  const timetables = getTimetables();
  
  return timetables.filter(timetable => {
    // Check if faculty is teaching any subject in this timetable
    return timetable.formData.subjectTeacherPairs.some(pair => 
      pair.teacherName === facultyName
    );
  });
};

// Mock users for login
export const USERS = {
  ADMIN: {
    username: 'admin',
    password: 'admin123'
  }
};
