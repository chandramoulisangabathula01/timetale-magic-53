
import React from 'react';
import { Timetable } from '@/utils/types';

interface TimetableFacultyDetailsProps {
  timetable: Timetable;
  printMode?: boolean;
}

const TimetableFacultyDetails: React.FC<TimetableFacultyDetailsProps> = ({ timetable, printMode = false }) => {
  // Only render this component in print mode to avoid duplication
  if (!printMode) return null;
  
  return (
    <div className="print-only mt-6">
      <h3 className="font-bold text-lg mb-2">FACULTY DETAILS:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {timetable.formData.subjectTeacherPairs.map((pair) => (
          <div key={pair.id} className="text-sm">
            <span>{pair.subjectName} - {pair.teacherName}</span>
            {pair.isLab && <span className="text-xs ml-1">(Lab)</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableFacultyDetails;
