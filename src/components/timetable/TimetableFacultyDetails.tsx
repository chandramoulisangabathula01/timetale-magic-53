
import React from 'react';
import { Timetable } from '@/utils/types';
import { formatTeacherNames } from '@/utils/facultyLabUtils';

interface TimetableFacultyDetailsProps {
  timetable: Timetable;
  printMode?: boolean;
}

const TimetableFacultyDetails: React.FC<TimetableFacultyDetailsProps> = ({ timetable, printMode = false }) => {
  return (
    <div className={`mt-6 ${printMode ? 'print-only' : ''}`}>
      <h3 className="font-bold text-lg mb-2">FACULTY DETAILS:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {timetable.formData.subjectTeacherPairs.map((pair) => (
          <div key={pair.id} className="text-sm">
            <span className="font-medium">{pair.subjectName}</span>
            {pair.isLab && <span className="text-xs ml-1">(Lab)</span>}
            <span> - </span>
            {pair.teacherNames && pair.teacherNames.length > 0 ? (
              <span>{pair.teacherNames.join(' & ')}</span>
            ) : (
              <span>{pair.teacherName}</span>
            )}
            {pair.batchNumber && (
              <span className="text-xs ml-1">({pair.batchNumber})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableFacultyDetails;
