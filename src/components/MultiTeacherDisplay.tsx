
import React from "react";
import { TimetableEntry } from "../utils/types";
import { formatTeacherNames } from "../utils/facultyLabUtils";
import { getShortName } from "../utils/timetableSystemPatch";

interface MultiTeacherDisplayProps {
  entry: TimetableEntry;
  useShortName?: boolean;
}

const MultiTeacherDisplay: React.FC<MultiTeacherDisplayProps> = ({ entry, useShortName = false }) => {
  const teacherText = formatTeacherNames(entry);
  
  if (useShortName) {
    // Handle multiple teachers
    if (entry.teacherNames && entry.teacherNames.length > 0) {
      const shortNames = entry.teacherNames.map(name => getShortName(name)).join(', ');
      return (
        <div className="text-xs sm:text-sm text-muted-foreground break-words">
          {shortNames}
        </div>
      );
    }
    
    // Handle single teacher
    if (entry.teacherName) {
      return (
        <div className="text-xs sm:text-sm text-muted-foreground break-words">
          {getShortName(entry.teacherName)}
        </div>
      );
    }
  }
  
  return (
    <div className="text-xs sm:text-sm text-muted-foreground break-words">
      {teacherText}
    </div>
  );
};

export default MultiTeacherDisplay;
