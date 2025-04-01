export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
export type TimeSlot =
  | "9:30-10:20"
  | "10:20-11:10"
  | "11:20-12:10"
  | "12:10-1:00"
  | "2:00-2:50"
  | "2:50-3:40"
  | "3:40-4:30"
  | "4:30-5:20";

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
  isBreak?: boolean;
  isLunch?: boolean;
  isLabGroup?: boolean;
  labGroupId?: string;
}

export interface Timetable {
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
  year: string;
  branch: string;
  semester: string;
  department: string;
  startDate: string;
  endDate: string;
  subjectTeacherPairs: SubjectTeacherPair[];
  freeHours: FreeHour[];
  fourthYearSixDays: boolean;
}

export interface FreeHour {
  id: string;
  name: string;
}

export interface Faculty {
  id: string;
  name: string;
  department: string;
}
