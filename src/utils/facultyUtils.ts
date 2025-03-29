
export interface FacultyData {
  id: string;
  name: string;
  shortName: string;
}

const FACULTY_STORAGE_KEY = 'timetable_faculty';

// Get all faculty from local storage
export const getFaculty = (): FacultyData[] => {
  const storedFaculty = localStorage.getItem(FACULTY_STORAGE_KEY);
  return storedFaculty ? JSON.parse(storedFaculty) : [];
};

// Add a new faculty member
export const addFaculty = (faculty: FacultyData): void => {
  const facultyList = getFaculty();
  facultyList.push(faculty);
  localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(facultyList));
};

// Update an existing faculty member
export const updateFaculty = (updatedFaculty: FacultyData): void => {
  const facultyList = getFaculty();
  const index = facultyList.findIndex(faculty => faculty.id === updatedFaculty.id);
  
  if (index !== -1) {
    facultyList[index] = updatedFaculty;
    localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(facultyList));
  }
};

// Delete a faculty member
export const deleteFaculty = (id: string): void => {
  const facultyList = getFaculty();
  const filteredFaculty = facultyList.filter(faculty => faculty.id !== id);
  localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(filteredFaculty));
};

// Check if a faculty exists
export const facultyExists = (name: string): boolean => {
  const facultyList = getFaculty();
  return facultyList.some(faculty => 
    faculty.name.toLowerCase() === name.toLowerCase()
  );
};

// Get faculty by ID
export const getFacultyById = (id: string): FacultyData | undefined => {
  const facultyList = getFaculty();
  return facultyList.find(faculty => faculty.id === id);
};

// Get faculty by name
export const getFacultyByName = (name: string): FacultyData | undefined => {
  const facultyList = getFaculty();
  return facultyList.find(faculty => 
    faculty.name.toLowerCase() === name.toLowerCase()
  );
};
