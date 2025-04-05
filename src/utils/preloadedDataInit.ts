
import { v4 as uuidv4 } from 'uuid';
import { Faculty } from './types';
import { saveTimetable } from './timetableUtils';
import { generateTimetable } from './timetableUtils';
import { saveSubject } from './subjectsUtils';
import { Subject, TimetableFormData } from './types';

// Initialize with sample Indian faculty names with short name
export const initializeSampleFaculty = () => {
  const facultyData = localStorage.getItem('faculty');
  const faculty = facultyData ? JSON.parse(facultyData) : [];
  
  if (faculty.length > 0) {
    // Skip if faculty data already exists
    return;
  }
  
  const sampleFaculty: Faculty[] = [
    {
      id: uuidv4(),
      name: 'Dr. Rajesh Kumar',
      department: 'CSE',
      shortName: 'RK'
    },
    {
      id: uuidv4(),
      name: 'Dr. Priya Singh',
      department: 'CSE',
      shortName: 'PS'
    },
    {
      id: uuidv4(),
      name: 'Prof. Amit Sharma',
      department: 'CSE',
      shortName: 'AS'
    },
    {
      id: uuidv4(),
      name: 'Prof. Sunita Patel',
      department: 'CSE',
      shortName: 'SP'
    },
    {
      id: uuidv4(),
      name: 'Dr. Vikram Joshi',
      department: 'CSE',
      shortName: 'VJ'
    },
    {
      id: uuidv4(),
      name: 'Prof. Neha Gupta',
      department: 'IT',
      shortName: 'NG'
    },
    {
      id: uuidv4(),
      name: 'Dr. Manoj Verma',
      department: 'IT',
      shortName: 'MV'
    },
    {
      id: uuidv4(),
      name: 'Prof. Deepa Mishra',
      department: 'ECE',
      shortName: 'DM'
    },
    {
      id: uuidv4(),
      name: 'Dr. Sanjay Agarwal',
      department: 'ECE',
      shortName: 'SA'
    },
    {
      id: uuidv4(),
      name: 'Prof. Ritu Choudhary',
      department: 'MECH',
      shortName: 'RC'
    }
  ];
  
  localStorage.setItem('faculty', JSON.stringify(sampleFaculty));
  console.log('Sample faculty initialized');
};

// Initialize with sample subjects
export const initializeSampleSubjects = () => {
  const subjects = localStorage.getItem('subjects');
  const existingSubjects = subjects ? JSON.parse(subjects) : [];
  
  if (existingSubjects.length > 0) {
    // Skip if subjects already exist
    return;
  }
  
  const sampleSubjects: Subject[] = [
    // 1st Year Subjects
    {
      id: uuidv4(),
      name: 'Mathematics-I',
      year: '1st Year',
      branch: 'All',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Physics',
      year: '1st Year',
      branch: 'All',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Chemistry',
      year: '1st Year',
      branch: 'All',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Engineering Graphics',
      year: '1st Year',
      branch: 'All',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Programming Fundamentals',
      year: '1st Year',
      branch: 'All',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Physics Lab',
      year: '1st Year',
      branch: 'All',
      isLab: true
    },
    {
      id: uuidv4(),
      name: 'Chemistry Lab',
      year: '1st Year',
      branch: 'All',
      isLab: true
    },
    {
      id: uuidv4(),
      name: 'Programming Lab',
      year: '1st Year',
      branch: 'All',
      isLab: true
    },
    
    // 2nd Year CSE Subjects
    {
      id: uuidv4(),
      name: 'Data Structures',
      year: '2nd Year',
      branch: 'CSE',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Object Oriented Programming',
      year: '2nd Year',
      branch: 'CSE',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Computer Organization',
      year: '2nd Year',
      branch: 'CSE',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Discrete Mathematics',
      year: '2nd Year',
      branch: 'CSE',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Data Structures Lab',
      year: '2nd Year',
      branch: 'CSE',
      isLab: true
    },
    {
      id: uuidv4(),
      name: 'OOP Lab',
      year: '2nd Year',
      branch: 'CSE',
      isLab: true
    },
    
    // 3rd Year CSE Subjects
    {
      id: uuidv4(),
      name: 'Database Systems',
      year: '3rd Year',
      branch: 'CSE',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Operating Systems',
      year: '3rd Year',
      branch: 'CSE',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Computer Networks',
      year: '3rd Year',
      branch: 'CSE',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Web Technologies',
      year: '3rd Year',
      branch: 'CSE',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Software Engineering',
      year: '3rd Year',
      branch: 'CSE',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Database Lab',
      year: '3rd Year',
      branch: 'CSE',
      isLab: true
    },
    {
      id: uuidv4(),
      name: 'OS Lab',
      year: '3rd Year',
      branch: 'CSE',
      isLab: true
    },
    {
      id: uuidv4(),
      name: 'Web Technologies Lab',
      year: '3rd Year',
      branch: 'CSE',
      isLab: true
    },
    
    // 4th Year CSE Subjects
    {
      id: uuidv4(),
      name: 'Artificial Intelligence',
      year: '4th Year',
      branch: 'CSE',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Machine Learning',
      year: '4th Year',
      branch: 'CSE',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Compiler Design',
      year: '4th Year',
      branch: 'CSE',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'Cloud Computing',
      year: '4th Year',
      branch: 'CSE',
      isLab: false
    },
    {
      id: uuidv4(),
      name: 'AI & ML Lab',
      year: '4th Year',
      branch: 'CSE',
      isLab: true
    },
    {
      id: uuidv4(),
      name: 'Project Work',
      year: '4th Year',
      branch: 'CSE',
      isLab: true
    }
  ];
  
  // Save each subject
  sampleSubjects.forEach(subject => {
    try {
      saveSubject(subject);
    } catch (error) {
      console.error(`Error saving subject ${subject.name}:`, error);
    }
  });
  
  console.log('Sample subjects initialized');
};

// Get random items from an array
const getRandomItems = <T,>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Initialize with sample timetables
export const initializeSampleTimetables = () => {
  const timetables = localStorage.getItem('timetables');
  const existingTimetables = timetables ? JSON.parse(timetables) : [];
  
  if (existingTimetables.length > 0) {
    // Skip if timetables already exist
    return;
  }
  
  // First ensure faculty and subjects are initialized
  initializeSampleFaculty();
  initializeSampleSubjects();
  
  // Get faculty and subjects from localStorage
  const faculty = JSON.parse(localStorage.getItem('faculty') || '[]');
  const subjects = JSON.parse(localStorage.getItem('subjects') || '[]');
  
  // Create timetable for 2nd Year CSE
  const secondYearForm: TimetableFormData = {
    year: '2nd Year',
    branch: 'CSE',
    semester: 'I',
    department: 'Computer Science & Engineering',
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
    courseName: 'B.Tech CSE',
    roomNumber: 'CSE-201',
    academicYear: '2023-2024',
    classInchargeName: 'Dr. Rajesh Kumar',
    mobileNumber: '9876543210',
    date: new Date().toISOString(),
    
    // Free hours configuration
    freeHours: [
      { type: 'Library' },
      { type: 'Sports' },
      { type: 'Project' }
    ],
    
    // Subject-teacher pairs
    subjectTeacherPairs: [
      {
        id: uuidv4(),
        subjectName: 'Data Structures',
        teacherName: 'Dr. Rajesh Kumar',
        isLab: false
      },
      {
        id: uuidv4(),
        subjectName: 'Object Oriented Programming',
        teacherName: 'Prof. Amit Sharma',
        isLab: false
      },
      {
        id: uuidv4(),
        subjectName: 'Computer Organization',
        teacherName: 'Prof. Sunita Patel',
        isLab: false
      },
      {
        id: uuidv4(),
        subjectName: 'Discrete Mathematics',
        teacherName: 'Dr. Priya Singh',
        isLab: false
      },
      {
        id: uuidv4(),
        subjectName: 'Data Structures Lab',
        teacherName: 'Dr. Rajesh Kumar',
        teacherNames: ['Dr. Rajesh Kumar', 'Prof. Amit Sharma'],
        isLab: true,
        batchNumber: 'B1'
      },
      {
        id: uuidv4(),
        subjectName: 'OOP Lab',
        teacherName: 'Prof. Sunita Patel',
        teacherNames: ['Prof. Sunita Patel', 'Prof. Neha Gupta'],
        isLab: true,
        batchNumber: 'B2'
      }
    ],
    
    // Day options
    dayOptions: {
      fourContinuousDays: false,
      useCustomDays: false,
      selectedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    
    // Batch rotation enabled
    enableBatchRotation: true,
    
    // Setting for 4th year schedule
    fourthYearSixDays: true
  };
  
  // Create timetable for 3rd Year CSE
  const thirdYearForm: TimetableFormData = {
    year: '3rd Year',
    branch: 'CSE',
    semester: 'I',
    department: 'Computer Science & Engineering',
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
    courseName: 'B.Tech CSE',
    roomNumber: 'CSE-301',
    academicYear: '2023-2024',
    classInchargeName: 'Dr. Vikram Joshi',
    mobileNumber: '9876543211',
    date: new Date().toISOString(),
    
    // Free hours configuration
    freeHours: [
      { type: 'Library' },
      { type: 'Sports' },
      { type: 'Project' }
    ],
    
    // Subject-teacher pairs
    subjectTeacherPairs: [
      {
        id: uuidv4(),
        subjectName: 'Database Systems',
        teacherName: 'Dr. Vikram Joshi',
        isLab: false
      },
      {
        id: uuidv4(),
        subjectName: 'Operating Systems',
        teacherName: 'Prof. Neha Gupta',
        isLab: false
      },
      {
        id: uuidv4(),
        subjectName: 'Computer Networks',
        teacherName: 'Dr. Manoj Verma',
        isLab: false
      },
      {
        id: uuidv4(),
        subjectName: 'Web Technologies',
        teacherName: 'Prof. Amit Sharma',
        isLab: false
      },
      {
        id: uuidv4(),
        subjectName: 'Software Engineering',
        teacherName: 'Dr. Priya Singh',
        isLab: false
      },
      {
        id: uuidv4(),
        subjectName: 'Database Lab',
        teacherName: 'Dr. Vikram Joshi',
        teacherNames: ['Dr. Vikram Joshi', 'Prof. Neha Gupta'],
        isLab: true,
        batchNumber: 'B1'
      },
      {
        id: uuidv4(),
        subjectName: 'OS Lab',
        teacherName: 'Dr. Manoj Verma',
        teacherNames: ['Dr. Manoj Verma', 'Dr. Priya Singh'],
        isLab: true,
        batchNumber: 'B2'
      }
    ],
    
    // Day options
    dayOptions: {
      fourContinuousDays: false,
      useCustomDays: false,
      selectedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    
    // Batch rotation enabled
    enableBatchRotation: true,
    
    // Setting for 4th year schedule
    fourthYearSixDays: true
  };
  
  // Generate and save the timetables
  try {
    const secondYearTimetable = generateTimetable(secondYearForm);
    saveTimetable(secondYearTimetable);
    
    const thirdYearTimetable = generateTimetable(thirdYearForm);
    saveTimetable(thirdYearTimetable);
    
    console.log('Sample timetables initialized');
  } catch (error) {
    console.error('Error generating sample timetables:', error);
  }
};

// Main function to initialize all sample data
export const initializeAllSampleData = () => {
  // Check if initialization has already been done
  const initialized = localStorage.getItem('sampleDataInitialized');
  if (initialized === 'true') {
    return;
  }
  
  try {
    initializeSampleFaculty();
    initializeSampleSubjects();
    initializeSampleTimetables();
    
    // Mark as initialized
    localStorage.setItem('sampleDataInitialized', 'true');
    console.log('All sample data successfully initialized');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};
