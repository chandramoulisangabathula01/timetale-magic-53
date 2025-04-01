
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { getFaculty } from "../utils/facultyUtils";

interface LabFacultySelectorProps {
  selectedTeachers: string[];
  onChange: (teachers: string[]) => void;
  maxTeachers?: number;
}

const LabFacultySelector: React.FC<LabFacultySelectorProps> = ({ 
  selectedTeachers, 
  onChange, 
  maxTeachers = 2 
}) => {
  const [faculty, setFaculty] = useState<string[]>([]);
  
  useEffect(() => {
    const facultyList = getFaculty().map(f => f.name);
    setFaculty(facultyList);
  }, []);

  const handleTeacherChange = (index: number, value: string) => {
    const updatedTeachers = [...selectedTeachers];
    updatedTeachers[index] = value;
    onChange(updatedTeachers);
  };

  const addTeacher = () => {
    if (selectedTeachers.length < maxTeachers) {
      onChange([...selectedTeachers, ""]);
    }
  };

  const removeTeacher = (index: number) => {
    const updatedTeachers = selectedTeachers.filter((_, i) => i !== index);
    onChange(updatedTeachers);
  };

  return (
    <div className="space-y-3">
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
