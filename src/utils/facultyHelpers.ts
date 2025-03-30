
import { getFaculty } from './facultyUtils';
import { getTimetables } from './timetableUtils';

// Get a list of all faculty names
export const getFacultyList = (): string[] => {
  const facultyData = getFaculty();
  return facultyData.map(faculty => faculty.name);
};

// Get faculty teaching load (how many classes a faculty member is teaching)
export const getFacultyTeachingLoad = (facultyName: string): number => {
  const timetables = getTimetables();
  let count = 0;
  
  timetables.forEach(timetable => {
    // Count unique subjects taught by this faculty in each timetable
    const uniqueSubjects = new Set();
    
    timetable.entries.forEach(entry => {
      if (entry.teacherName === facultyName && entry.subjectName && !entry.isBreak && !entry.isLunch) {
        uniqueSubjects.add(`${timetable.id}-${entry.subjectName}-${entry.isLab}`);
      }
    });
    
    count += uniqueSubjects.size;
  });
  
  return count;
};

// Get faculty schedule (all timeslots where a faculty member is teaching)
export const getFacultySchedule = (facultyName: string) => {
  const timetables = getTimetables();
  const schedule = [];
  
  timetables.forEach(timetable => {
    timetable.entries.forEach(entry => {
      if (entry.teacherName === facultyName && !entry.isBreak && !entry.isLunch) {
        schedule.push({
          day: entry.day,
          timeSlot: entry.timeSlot,
          subjectName: entry.subjectName,
          isLab: entry.isLab,
          timetableId: timetable.id,
          yearBranch: `${timetable.formData.year} ${timetable.formData.branch}`
        });
      }
    });
  });
  
  return schedule;
};
