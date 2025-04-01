
import React from "react";
import { TimetableEntry } from "../utils/types";
import { formatTeacherNames } from "../utils/facultyLabUtils";

interface MultiTeacherDisplayProps {
  entry: TimetableEntry;
}

const MultiTeacherDisplay: React.FC<MultiTeacherDisplayProps> = ({ entry }) => {
  const teacherText = formatTeacherNames(entry);
  
  return (
    <div className="text-xs text-muted-foreground">
      {teacherText}
    </div>
  );
};

export default MultiTeacherDisplay;
