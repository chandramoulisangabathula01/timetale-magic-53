
import React from "react";
import { TimetableEntry } from "../utils/types";
import { formatTeacherNames } from "../utils/facultyLabUtils";

interface MultiTeacherDisplayProps {
  entry: TimetableEntry;
}

const MultiTeacherDisplay: React.FC<MultiTeacherDisplayProps> = ({ entry }) => {
  const teacherText = formatTeacherNames(entry);
  
  return (
    <span className="text-xs text-gray-600 block">
      {teacherText}
    </span>
  );
};

export default MultiTeacherDisplay;
