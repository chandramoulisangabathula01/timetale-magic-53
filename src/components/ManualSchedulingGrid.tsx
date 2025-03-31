
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getTimetables, isTeacherAvailable } from "@/utils/timetableUtils";
import { 
  TimetableEntry, 
  SubjectTeacherPair, 
  Day, 
  TimeSlot, 
  FreeHourType,
  YearType,
  BranchType
} from '@/utils/types';

interface ManualSchedulingGridProps {
  subjectTeacherPairs: SubjectTeacherPair[];
  freeHours: { type: FreeHourType, customType?: string }[];
  dayOptions: { 
    fourContinuousDays: boolean;
    useCustomDays: boolean;
    selectedDays: Day[];
  };
  year: YearType;
  branch: BranchType;
  onSave: (entries: TimetableEntry[]) => void;
  existingEntries?: TimetableEntry[];
}

const ManualSchedulingGrid: React.FC<ManualSchedulingGridProps> = ({ 
  subjectTeacherPairs, 
  freeHours, 
  dayOptions,
  year,
  branch,
  onSave,
  existingEntries = []
}) => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const { toast } = useToast();
  
  // Determine which days to show based on year and dayOptions
  let days: Day[];
  
  if (year === '4th Year') {
    // For 4th year, use the selected day options
    days = dayOptions.useCustomDays 
      ? dayOptions.selectedDays
      : dayOptions.fourContinuousDays 
        ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday'] as Day[]
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as Day[];
  } else {
    // For 1st to 3rd year, always use all 6 days
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as Day[];
  }
    
  const timeSlots: TimeSlot[] = [
    '9:30-10:20', 
    '10:20-11:10', 
    '11:10-11:20', // Break
    '11:20-12:10', 
    '12:10-1:00', 
    '1:00-2:00',  // Lunch
    '2:00-2:50', 
    '2:50-3:40', 
    '3:40-4:30'
  ];
  
  const timeOrder: Record<TimeSlot, number> = {
    '9:30-10:20': 0,
    '10:20-11:10': 1,
    '11:10-11:20': 2, // Break
    '11:20-12:10': 3,
    '12:10-1:00': 4,
    '1:00-2:00': 5,  // Lunch
    '2:00-2:50': 6,
    '2:50-3:40': 7,
    '3:40-4:30': 8,
    // Add lab time slots
    '9:30-1:00': 9,
    '10:20-1:00': 10,
    '2:00-4:30': 11
  };
  
  useEffect(() => {
    if (existingEntries && existingEntries.length > 0) {
      console.log("Using existing entries:", existingEntries.length);
      
      // Filter the existing entries to only include the days we're showing
      const filteredEntries = existingEntries.filter(entry => days.includes(entry.day));
      
      // If we're missing any days/timeslots, add empty entries for them
      const initialEntries: TimetableEntry[] = [];
      
      days.forEach(day => {
        timeSlots.forEach(timeSlot => {
          // Check if this day/timeSlot combination exists in the filtered entries
          const existingEntry = filteredEntries.find(
            entry => entry.day === day && entry.timeSlot === timeSlot
          );
          
          if (existingEntry) {
            initialEntries.push(existingEntry);
          } else {
            // Add a new empty entry
            initialEntries.push({
              day,
              timeSlot,
              // No subject assigned initially
            });
          }
        });
      });
      
      setEntries(initialEntries);
      return;
    }
    
    const initialEntries: TimetableEntry[] = [];
    
    days.forEach(day => {
      timeSlots.forEach(timeSlot => {
        initialEntries.push({
          day,
          timeSlot,
          // No subject assigned initially
        });
      });
    });
    
    setEntries(initialEntries);
  }, [existingEntries, days, year, dayOptions]);
  
  // Save entries only when they've been fully initialized or deliberately changed
  useEffect(() => {
    if (entries.length > 0) {
      onSave(entries);
    }
  }, [entries, onSave]);

  // Check for teacher conflicts across timetables
  const checkTeacherConflicts = (day: Day, timeSlot: TimeSlot, teacherName: string): boolean => {
    // First check within this timetable being edited
    const conflictInCurrentTimetable = entries.some(entry => 
      entry.day === day && 
      entry.timeSlot === timeSlot && 
      entry.teacherName === teacherName &&
      !entry.isBreak &&
      !entry.isLunch
    );

    if (conflictInCurrentTimetable) {
      return true;
    }
    
    // Check across all other timetables
    return !isTeacherAvailable(teacherName, day, timeSlot);
  };
  
  const handleCellChange = (day: Day, timeSlot: TimeSlot, value: string, type: 'subject' | 'free') => {
    console.log("Handling cell change:", { day, timeSlot, value, type });
    
    if (type === 'subject') {
      const [subjectId, teacherName] = value.split('|');
      const subject = subjectTeacherPairs.find(s => s.id === subjectId);
      
      if (subject) {
        // Check for teacher conflicts
        if (checkTeacherConflicts(day, timeSlot, subject.teacherName)) {
          toast({
            title: "Scheduling Conflict",
            description: `${subject.teacherName} already has a class scheduled at this time slot in another class.`,
            variant: "destructive"
          });
          return;
        }
        
        setEntries(prevEntries => {
          const newEntries = prevEntries.map(entry => {
            if (entry.day === day && entry.timeSlot === timeSlot) {
              return {
                ...entry,
                subjectName: subject.subjectName,
                teacherName: subject.teacherName,
                isLab: subject.isLab,
                batchNumber: subject.batchNumber,
                isFree: false,
                freeType: undefined
              };
            }
            return entry;
          });
          
          // Show success toast for feedback
          setTimeout(() => {
            toast({
              title: "Subject Assigned",
              description: `${subject.subjectName} with ${subject.teacherName} has been assigned to this slot.`,
              variant: "default"
            });
          }, 100);
          
          return newEntries;
        });
      }
    } else if (type === 'free') {
      setEntries(prevEntries => {
        const newEntries = prevEntries.map(entry => {
          if (entry.day === day && entry.timeSlot === timeSlot) {
            return {
              ...entry,
              subjectName: undefined,
              teacherName: undefined,
              isLab: false,
              batchNumber: undefined,
              isFree: true,
              freeType: value as FreeHourType
            };
          }
          return entry;
        });
        
        // Show success toast for feedback
        setTimeout(() => {
          toast({
            title: "Free Hour Added",
            description: `${value} has been added to this slot.`,
            variant: "default"
          });
        }, 100);
        
        return newEntries;
      });
    }
  };
  
  const handleClearCell = (day: Day, timeSlot: TimeSlot) => {
    setEntries(prevEntries => {
      const newEntries = prevEntries.map(entry => {
        if (entry.day === day && entry.timeSlot === timeSlot) {
          return {
            day,
            timeSlot,
            // Clear all properties
          };
        }
        return entry;
      });
      
      toast({
        title: "Cell Cleared",
        description: "This time slot has been cleared.",
        variant: "default"
      });
      
      return newEntries;
    });
  };
  
  const getEntry = (day: Day, timeSlot: TimeSlot): TimetableEntry | undefined => {
    return entries.find(entry => entry.day === day && entry.timeSlot === timeSlot);
  };
  
  const isSpecialTimeSlot = (timeSlot: TimeSlot): boolean => {
    return timeSlot === '11:10-11:20' || timeSlot === '1:00-2:00';
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border">
        <thead>
          <tr className="bg-muted">
            <th className="border p-2 text-sm font-medium">Time / Day</th>
            {days.map(day => (
              <th key={day} className="border p-2 text-sm font-medium">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((timeSlot) => (
            <tr 
              key={timeSlot} 
              className={`
                ${timeSlot === '11:10-11:20' ? 'bg-gray-100' : ''} 
                ${timeSlot === '1:00-2:00' ? 'bg-gray-100' : ''}
              `}
            >
              <td className="border p-2 text-sm font-medium whitespace-nowrap">
                {timeSlot}
              </td>
              {days.map(day => (
                <td key={`${day}-${timeSlot}`} className="border p-2">
                  {timeSlot === '11:10-11:20' ? (
                    <div className="text-center text-sm font-medium text-muted-foreground italic">Break</div>
                  ) : timeSlot === '1:00-2:00' ? (
                    <div className="text-center text-sm font-medium text-muted-foreground italic">Lunch</div>
                  ) : (
                    <div className="space-y-2">
                      {/* Display selected subject/free hour */}
                      {getEntry(day, timeSlot)?.subjectName && (
                        <div className={`p-1 rounded text-sm ${getEntry(day, timeSlot)?.isLab ? 'bg-green-50' : ''}`}>
                          <div className="font-medium">{getEntry(day, timeSlot)?.subjectName}</div>
                          <div className="text-xs text-muted-foreground">{getEntry(day, timeSlot)?.teacherName}</div>
                          {getEntry(day, timeSlot)?.batchNumber && (
                            <div className="text-xs text-primary">({getEntry(day, timeSlot)?.batchNumber})</div>
                          )}
                        </div>
                      )}
                      
                      {getEntry(day, timeSlot)?.isFree && getEntry(day, timeSlot)?.freeType && (
                        <div className="p-1 rounded bg-blue-50 text-sm">
                          <div className="italic text-blue-600">{getEntry(day, timeSlot)?.freeType}</div>
                        </div>
                      )}
                      
                      {/* Subject dropdown */}
                      <Select
                        onValueChange={(value) => handleCellChange(day, timeSlot, value, 'subject')}
                        value=""
                      >
                        <SelectTrigger className="text-xs h-8">
                          <SelectValue placeholder="Assign subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjectTeacherPairs.map((pair) => (
                            <SelectItem key={pair.id} value={`${pair.id}|${pair.teacherName}`}>
                              {pair.subjectName} ({pair.teacherName})
                              {pair.isLab && pair.batchNumber && ` (${pair.batchNumber})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Free hour dropdown */}
                      <Select
                        onValueChange={(value) => handleCellChange(day, timeSlot, value, 'free')}
                        value=""
                      >
                        <SelectTrigger className="text-xs h-8">
                          <SelectValue placeholder="Assign free hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {freeHours.map((freeHour, index) => (
                            <SelectItem 
                              key={index} 
                              value={freeHour.type === 'Others' && freeHour.customType 
                                ? freeHour.customType 
                                : freeHour.type
                              }
                            >
                              {freeHour.type === 'Others' && freeHour.customType 
                                ? freeHour.customType 
                                : freeHour.type
                              }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Clear button */}
                      {(getEntry(day, timeSlot)?.subjectName || getEntry(day, timeSlot)?.isFree) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-6 text-xs"
                          onClick={() => handleClearCell(day, timeSlot)}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManualSchedulingGrid;
