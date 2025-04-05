
// Import necessary modules and types from React and utility functions
import React from 'react';
import { Timetable } from '@/utils/types';
import { formatTeacherNames } from '@/utils/facultyLabUtils';

// Define the props interface for the TimetableFacultyDetails component
interface TimetableFacultyDetailsProps {
  timetable: Timetable; // The timetable data to be displayed
  printMode?: boolean; // Optional flag to adjust styling for print layout
  facultyFilter?: string; // Optional faculty filter to show only relevant entries
}

// TimetableFacultyDetails Component
// This component renders the faculty details section of the timetable
const TimetableFacultyDetails: React.FC<TimetableFacultyDetailsProps> = ({ timetable, printMode = false, facultyFilter }) => {
  // Filter subject-teacher pairs if a faculty filter is provided
  const filteredPairs = facultyFilter 
    ? timetable.formData.subjectTeacherPairs.filter(pair => 
        pair.teacherName === facultyFilter || 
        (pair.teacherNames && pair.teacherNames.includes(facultyFilter))
      )
    : timetable.formData.subjectTeacherPairs;

  return (
    <div className={`mt-6 ${printMode ? 'print-only' : ''}`}> 
      <h3 className="font-bold text-lg mb-2">
        {facultyFilter ? 'MY TEACHING ASSIGNMENTS:' : 'FACULTY DETAILS:'}
      </h3> 
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2"> 
        {filteredPairs.map((pair) => ( // Map over filtered subject-teacher pairs
          <div key={pair.id} className="text-sm text-left bg-white/50 p-2 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="font-medium">{pair.subjectName}</span> 
            {pair.isLab && <span className="text-xs ml-1">(Lab)</span>}
            <span> - </span>
            {pair.teacherNames && pair.teacherNames.length > 0 ? ( // Check if multiple teacher names exist
              <span>{pair.teacherNames.join(' & ')}</span> // Join multiple teacher names with '&'
            ) : (
              <span>{pair.teacherName}</span> // Display single teacher name
            )}
            {pair.batchNumber && ( // Conditional display for batch number
              <span className="text-xs ml-1">({pair.batchNumber})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Export the component as default
export default TimetableFacultyDetails;
