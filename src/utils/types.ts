
// Define basic types for the timetable system

export type YearType = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
export type SemesterType = 'I' | 'II';
export type BranchType = 'CSE' | 'IT' | 'ECE' | 'EEE' | 'CSD' | 'AI & ML' | 'Other';
export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type TimeSlot = '9:30-10:20' | '10:20-11:10' | '11:10-11:20' | '11:20-12:10' | '12:10-1:00' | '1:00-2:00' | '2:00-2:50' | '2:50-3:40' | '3:40-4:30' | '9:30-1:00' | '10:20-1:00' | '2:00-4:30';
export type FreeHourType = 'Library' | 'Sports' | 'Project' | 'Others' | string;
export type UserRole = 'admin' | 'faculty' | 'student';

// Subject definitions
export interface Subject {
  id: string;
  name: string;
  year: YearType;
  branch: BranchType | 'All';
  customBranch?: string; // For "Other" branch
  isLab: boolean;
  creditHours: number;
}

// Faculty definitions
export interface Faculty {
  id: string;
  name: string;
  shortName: string;
  department: string;
  email: string;
  maxHours?: number;
}

// Pair of subject and teacher for timetable
export interface SubjectTeacherPair {
  id: string;
  subjectName: string;
  teacherName: string;
  isLab: boolean;
  batchNumber?: string;
}

// Timetable entries - individual cells in the timetable
export interface TimetableEntry {
  day: Day;
  timeSlot: TimeSlot;
  subjectName?: string;
  teacherName?: string;
  isLab?: boolean;
  batchNumber?: string;
  isFree?: boolean;
  freeType?: FreeHourType;
  isBreak?: boolean;
  isLunch?: boolean;
  isLabGroup?: boolean;
  labGroupId?: string;
}

// Form data for creating a timetable
export interface TimetableFormData {
  year: YearType;
  semester: SemesterType;
  branch: BranchType;
  customBranch: string;
  courseName: string;
  roomNumber: string;
  academicYear: string;
  classInchargeName: string;
  mobileNumber: string;
  date: string;
  subjectTeacherPairs: SubjectTeacherPair[];
  freeHours: { type: FreeHourType, customType?: string, mergeSlots?: boolean }[];
  dayOptions: { 
    fourContinuousDays: boolean;
    useCustomDays: boolean;
    selectedDays: Day[];
  };
}

// Complete timetable definition
export interface Timetable {
  id: string;
  formData: TimetableFormData;
  entries: TimetableEntry[];
  createdAt: string;
}
