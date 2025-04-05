
import React from 'react';
import { SubjectTeacherPair } from '../../utils/types';
import { getShortName } from '../../utils/timetableSystemPatch';

interface TimetableFacultyDetailsShortProps {
  subjectTeacherPairs: SubjectTeacherPair[];
}

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
