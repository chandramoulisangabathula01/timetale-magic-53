
// Enum types
export type YearType = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
export type SemesterType = 'I' | 'II';
export type BranchType = 'CSE' | 'IT' | 'ECE' | 'EEE' | 'CSD' | 'AI & ML' | 'Other';
export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type TimeSlot = 
  '9:30-10:20' | '10:20-11:10' | '11:20-12:10' | 
  '12:10-1:00' | '2:00-2:50' | '2:50-3:40' | '3:40-4:30' |
  // Add lab time slots for merged slots
  '9:30-1:00' | '10:20-1:00' | '2:00-4:30' |
  // Add break and lunch slots
  '11:10-11:20' | '1:00-2:00';
export type FreeHourType = 'Library' | 'Sports' | 'Project' | 'Others';
export type UserRole = 'admin' | 'faculty' | 'student';

// Subject-Teacher pair model
export interface SubjectTeacherPair {
  id: string;
  subjectName: string;
  teacherName: string;
  isLab: boolean;
  batchNumber?: string;
}

// Timetable entry model
export interface TimetableEntry {
  day: Day;
  timeSlot: TimeSlot;
  subjectName?: string;
  teacherName?: string;
  isLab?: boolean;
  batchNumber?: string;
  isFree?: boolean;
  freeType?: string;
  isBreak?: boolean;
  isLunch?: boolean;
  isLabGroup?: boolean;
  labGroupId?: string;
}

// Timetable form data model
export interface TimetableFormData {
  year: YearType;
  semester: SemesterType;
  branch: BranchType;
  customBranch?: string;
  courseName: string;
  roomNumber: string;
  academicYear: string;
  classInchargeName: string;
  mobileNumber: string;
  date: string;
  subjectTeacherPairs: SubjectTeacherPair[];
  freeHours: {
    type: FreeHourType;
    customType?: string;
    mergeSlots?: boolean;
  }[];
  dayOptions: {
    fourContinuousDays: boolean;
    useCustomDays: boolean;
    selectedDays: Day[];
  };
}

// Complete Timetable model
export interface Timetable {
  id: string;
  formData: TimetableFormData;
  entries: TimetableEntry[];
  createdAt: string;
}

// Subject model
export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  isLab: boolean;
  years: YearType[];
  branches: BranchType[];
}

// Faculty model
export interface Faculty {
  id: string;
  name: string;
  shortName: string;
  department: string;
  designation: string;
  email: string;
  subjects: string[];
}

// User model
export interface User {
  username: string;
  password: string;
  role: 'admin' | 'faculty' | 'student';
}

// Student filters
export interface StudentFilters {
  year: string;
  branch: string;
  semester: string;
}
