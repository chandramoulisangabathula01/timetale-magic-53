
import { getFaculty } from './facultyUtils';

// Get a list of all faculty names
export const getFacultyList = (): string[] => {
  const facultyData = getFaculty();
  return facultyData.map(faculty => faculty.name);
};
