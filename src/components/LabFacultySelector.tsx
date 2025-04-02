
// Lab Faculty Selector Component
// This component provides an interface for selecting multiple faculty members for lab sessions.
// It allows adding/removing faculty selectors and manages the selected faculty list.

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { getFaculty } from "../utils/facultyUtils";

// Component Props Interface
interface LabFacultySelectorProps {
  selectedTeachers: string[]; // Currently selected faculty names
  onChange: (teachers: string[]) => void; // Callback when selection changes
  maxTeachers?: number; // Maximum allowed faculty selections (default: 2)
}

const LabFacultySelector: React.FC<LabFacultySelectorProps> = ({ 
  selectedTeachers, 
  onChange, 
  maxTeachers = 2 
}) => {
  // State for storing the list of available faculty members
  const [faculty, setFaculty] = useState<string[]>([]);
  
  // Effect to load faculty list on component mount
useEffect(() => {
  // Fetch faculty data and extract names
  const facultyList = getFaculty().map(f => f.name);
  setFaculty(facultyList);
}, []);

  // Handler for when a faculty selection changes
const handleTeacherChange = (index: number, value: string) => {
  // Create updated teachers array with new selection
  const updatedTeachers = [...selectedTeachers];
  updatedTeachers[index] = value;
  // Notify parent component of change
  onChange(updatedTeachers);
};

  // Adds a new faculty selector if under max limit
const addTeacher = () => {
  if (selectedTeachers.length < maxTeachers) {
    // Add empty string as placeholder for new selection
    onChange([...selectedTeachers, ""]);
  }
};

  // Removes a faculty selector at specified index
const removeTeacher = (index: number) => {
  // Filter out the teacher at given index
  const updatedTeachers = selectedTeachers.filter((_, i) => i !== index);
  // Notify parent component of change
  onChange(updatedTeachers);
};

  // Main component render
return (
  <div className="space-y-3">
      {/* Render each faculty selector */}
{selectedTeachers.map((teacher, index) => (
  <div key={index} className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor={`teacher-${index}`}>
              Faculty {index + 1}
            </Label>
            <Select
              value={teacher}
              onValueChange={(value) => handleTeacherChange(index, value)}
            >
              <SelectTrigger id={`teacher-${index}`}>
                <SelectValue placeholder="Select faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculty.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {index > 0 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-6"
              onClick={() => removeTeacher(index)}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
      
      {/* Show 'Add Faculty' button if under max limit */}
{selectedTeachers.length < maxTeachers && (
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={addTeacher}
  >
    Add Faculty
  </Button>
)}
    </div>
  );
};

export default LabFacultySelector;
