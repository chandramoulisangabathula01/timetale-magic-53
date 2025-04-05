
import React from 'react';
import { SubjectTeacherPair } from '../../utils/types';

interface TimetableFacultyDetailsShortProps {
  subjectTeacherPairs: SubjectTeacherPair[];
}

// Helper function to extract initials/short name
const getShortName = (fullName: string): string => {
  // Split by spaces and get first letter of each part
  return fullName
    .split(' ')
    .map(part => part.charAt(0))
    .join('');
};

const TimetableFacultyDetailsShort: React.FC<TimetableFacultyDetailsShortProps> = ({
  subjectTeacherPairs,
}) => {
  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Faculty Details</h3>
      <div className="grid grid-cols-1 gap-2">
        {subjectTeacherPairs.map((pair) => (
          <div key={pair.id} className="flex flex-col">
            <div className="flex flex-row items-center gap-2">
              <span className="font-medium">{pair.subjectName}</span>
              <span className="text-gray-600">
                {pair.teacherName} ({getShortName(pair.teacherName)})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableFacultyDetailsShort;
