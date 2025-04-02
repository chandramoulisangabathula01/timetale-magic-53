export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
export type TimeSlot =
  | "9:30-10:20"
  | "10:20-11:10"
  | "11:20-12:10"
  | "12:10-1:00"
  | "2:00-2:50"
  | "2:50-3:40"
  | "3:40-4:30"
  | "4:30-5:20"
  | "11:10-11:20"  // Break
  | "1:00-2:00"    // Lunch
  | "9:30-1:00"    // Morning lab block
  | "2:00-4:30"    // Afternoon lab block
  | "10:20-1:00";  // Another lab block

export interface TimetableEntry {
  id?: string;
  day: Day;
  timeSlot: TimeSlot;
  subjectName?: string;
  teacherName?: string; // We'll keep this for backward compatibility
  teacherNames?: string[]; // New field for multiple teachers
  isLab?: boolean;
  batchNumber?: string;
  isFree?: boolean;
  freeType?: string;
  customFreeType?: string;
  isBreak?: boolean;
  isLunch?: boolean;
  isLabGroup?: boolean;
  labGroupId?: string;
  mergeSlots?: boolean;
}

export interface Timetable {
  facultyDetails: any;
  id: string;
  formData: TimetableFormData;
  entries: TimetableEntry[];
  createdAt: string;
}

export interface SubjectTeacherPair {
  id: string;
  subjectName: string;
  teacherName: string; // We'll keep this for backward compatibility
  teacherNames?: string[]; // New field for multiple teachers
  isLab: boolean;
  batchNumber?: string;
}

export interface TimetableFormData {
  year: YearType;
  branch: BranchType;
  semester: SemesterType;
  department: string;
  startDate: string;
  endDate: string;
  subjectTeacherPairs: SubjectTeacherPair[];
  freeHours: FreeHourDefinition[];
  fourthYearSixDays: boolean;
  
  // Additional form fields needed by the application
  customBranch?: string;
  courseName: string;
  roomNumber: string;
  academicYear: string;
  classInchargeName: string;
  mobileNumber: string;
  date: string;
  
  // Day options
  dayOptions: {
    fourContinuousDays: boolean;
    useCustomDays: boolean;
    selectedDays: Day[];
  };
  
  // Batch rotation
  enableBatchRotation: boolean;
}

export type YearType = "1st Year" | "2nd Year" | "3rd Year" | "4th Year";
export type BranchType = "CSE" | "IT" | "ECE" | "EEE" | "CSD" | "AI & ML" | "Other" | "All";
export type SemesterType = "I" | "II";
export type UserRole = "admin" | "faculty" | "student" | "guest";

export type FreeHourType = "Library" | "Sports" | "Project" | "Others";

export interface FreeHourDefinition {
  type: FreeHourType;
  customType?: string;
  mergeSlots?: boolean;
}

export interface FreeHour {
  id: string;
  name: string;
  type?: FreeHourType;
  customType?: string;
  mergeSlots?: boolean;
}

export interface Faculty {
  id: string;
  name: string;
  department: string;
  shortName?: string;
}

export interface Subject {
  id: string;
  name: string;
  year: YearType;
  branch: BranchType;
  customBranch?: string;
  isLab: boolean;
  creditHours?: number;
}
