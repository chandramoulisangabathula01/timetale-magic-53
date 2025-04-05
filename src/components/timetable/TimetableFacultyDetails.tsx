
// Import necessary modules and types from React and utility functions
import React from 'react';
import { Timetable } from '@/utils/types';
import { formatTeacherNames } from '@/utils/facultyLabUtils';
import { getFacultyWorkload } from '@/utils/facultyWorkloadUtils';
import { Badge } from '@/components/ui/badge';

// Define the props interface for the TimetableFacultyDetails component
interface TimetableFacultyDetailsProps {
  timetable: Timetable; // The timetable data to be displayed
  printMode?: boolean; // Optional flag to adjust styling for print layout
}

// TimetableFacultyDetails Component
// This component renders the faculty details section of the timetable
const TimetableFacultyDetails: React.FC<TimetableFacultyDetailsProps> = ({ timetable, printMode = false }) => {
  return (
    <div className={`mt-6 ${printMode ? 'print-only' : ''}`}> 
      <h3 className="font-bold text-lg mb-2">FACULTY DETAILS:</h3> 
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2"> 
        {timetable.formData.subjectTeacherPairs.map((pair) => {
          // Get faculty workload for the main teacher
          const facultyWorkload = pair.teacherName ? getFacultyWorkload(pair.teacherName) : undefined;
          
          return (
            <div 
              key={pair.id} 
              className="text-sm bg-white/50 p-2 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium">{pair.subjectName}</span> 
                  {pair.isLab && <span className="text-xs ml-1">(Lab)</span>}
                </div>
                {facultyWorkload && !printMode && (
                  <Badge 
                    variant={facultyWorkload.isAvailable ? "outline" : "secondary"}
                    className="text-xs"
                  >
                    {facultyWorkload.assignedSubjects}/{facultyWorkload.maxSubjects}
                  </Badge>
                )}
              </div>
              <div className="flex items-center">
                <span> - </span>
                {pair.teacherNames && pair.teacherNames.length > 0 ? (
                  <span>{formatTeacherNames({ teacherNames: pair.teacherNames })}</span>
                ) : (
                  <span>{pair.teacherName}</span>
                )}
                {pair.batchNumber && (
                  <span className="text-xs ml-1">({pair.batchNumber})</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Export the component as default
export default TimetableFacultyDetails;
