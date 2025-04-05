
import React from 'react';
import { Day, TimeSlot, TimetableEntry, SubjectTeacherPair } from '../utils/types';

// Helper function to extract initials/short name
const getShortName = (fullName: string): string => {
  // Split by spaces and get first letter of each part
  return fullName
    .split(' ')
    .map(part => part.charAt(0))
    .join('');
};

// This component will be used by the original TimetableView to render cell content with short names
export const renderCellContentWithShortNames = (
  entry: TimetableEntry | null,
  subjectTeacherPairs: SubjectTeacherPair[]
) => {
  if (!entry) return null;

  if (entry.isBreak) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <span className="text-sm font-medium">Break</span>
      </div>
    );
  }

  if (entry.isLunch) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <span className="text-sm font-medium">Lunch</span>
      </div>
    );
  }

  if (entry.isFree) {
    return (
      <div className="h-full flex items-center justify-center bg-blue-50">
        <span className="text-sm font-medium">{entry.freeType || 'Free'}</span>
      </div>
    );
  }

  const teacherShortName = entry.teacherName ? getShortName(entry.teacherName) : '';

  return (
    <div className="h-full p-1 flex flex-col justify-between">
      <div>
        <p className="text-sm font-medium">{entry.subjectName}</p>
        <p className="text-xs text-gray-600">{teacherShortName}</p>
      </div>
      {entry.batchNumber && (
        <span className="text-xs bg-blue-100 px-1 rounded-sm self-start">
          {entry.batchNumber}
        </span>
      )}
    </div>
  );
};
