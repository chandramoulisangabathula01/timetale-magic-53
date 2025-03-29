
// Define types for the timetable generation system

export type UserRole = 'admin' | 'faculty' | 'student';

export type YearType = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
export type SemesterType = 'I' | 'II';
export type BranchType = 'CSE' | 'IT' | 'ECE' | 'EEE' | 'CSD' | 'AI & ML' | 'Other';

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type TimeSlot = 
  | '9:30-10:20' 
  | '10:20-11:10' 
  | '11:10-11:20' // Break
  | '11:20-12:10' 
  | '12:10-1:00' 
  | '1:00-2:00'  // Lunch
  | '2:00-2:50' 
  | '2:50-3:40' 
  | '3:40-4:30';

export type LabTimeSlot = '9:30-1:00' | '10:20-1:00' | '2:00-4:30';

export type FreeHourType = 'Library' | 'Sports' | 'Project' | 'Others';

export interface SubjectTeacherPair {
  id: string;
  subjectName: string;
  teacherName: string;
  teacherShortForm?: string;
  isLab: boolean;
  batchNumber?: string;
  additionalTeachers?: string[];
}

export interface TimetableEntry {
  day: Day;
  timeSlot: TimeSlot | LabTimeSlot;
  subjectName?: string;
  teacherName?: string;
  isLab?: boolean;
  isFree?: boolean;
  freeType?: FreeHourType;
  isBreak?: boolean;
  isLunch?: boolean;
  batchNumber?: string;
}

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

export interface Timetable {
  id: string;
  formData: TimetableFormData;
  entries: TimetableEntry[];
  createdAt: string;
  updatedAt: string;
}
