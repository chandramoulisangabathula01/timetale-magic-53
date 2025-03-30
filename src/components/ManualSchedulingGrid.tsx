
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
    '11:20-12:10', 
    '12:10-1:00', 
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
        
        // Check if break exists for this day
        const existingBreak = filteredEntries.find(
          entry => entry.day === day && entry.timeSlot === '11:10-11:20' && entry.isBreak
        );
        
        if (existingBreak) {
          initialEntries.push(existingBreak);
        } else {
          initialEntries.push({
            day,
            timeSlot: '11:10-11:20',
            isBreak: true
          });
        }
        
        // Check if lunch exists for this day
        const existingLunch = filteredEntries.find(
          entry => entry.day === day && entry.timeSlot === '1:00-2:00' && entry.isLunch
        );
        
        if (existingLunch) {
          initialEntries.push(existingLunch);
        } else {
          initialEntries.push({
            day,
            timeSlot: '1:00-2:00',
            isLunch: true
          });
        }
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
      
      initialEntries.push({
        day,
        timeSlot: '11:10-11:20',
        isBreak: true
      });
      
      initialEntries.push({
        day,
        timeSlot: '1:00-2:00',
        isLunch: true
      });
    });
    
    setEntries(initialEntries);
  }, [existingEntries, days, year, dayOptions]);
  
  useEffect(() => {
    if (entries.length > 0) {
      // Save entries immediately after they're changed
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
          return prevEntries.map(entry => {
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
        });
        
        // Show success toast for feedback
        toast({
          title: "Subject Assigned",
          description: `${subject.subjectName} with ${subject.teacherName} has been assigned to this slot.`,
          variant: "default"
        });
      }
    } else if (type === 'free') {
      setEntries(prevEntries => {
        return prevEntries.map(entry => {
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
      });
      
      // Show success toast for feedback
      toast({
        title: "Free Hour Added",
        description: `${value} has been added to this slot.`,
        variant: "default"
      });
    }
  };
  
  const clearCell = (day: Day, timeSlot: TimeSlot) => {
    setEntries(prevEntries => {
      const updatedEntries = prevEntries.map(entry => {
        if (entry.day === day && entry.timeSlot === timeSlot) {
          return {
            day,
            timeSlot,
            // Reset all fields
            subjectName: undefined,
            teacherName: undefined,
            isLab: false,
            batchNumber: undefined,
            isFree: false,
            freeType: undefined
          };
        }
        return entry;
      });
      
      // Show success toast for feedback
      toast({
        title: "Cell Cleared",
        description: "The time slot has been cleared.",
        variant: "default"
      });
      
      return updatedEntries;
    });
  };
  
  const getCellContent = (day: Day, timeSlot: TimeSlot) => {
    const entry = entries.find(e => e.day === day && e.timeSlot === timeSlot);
    
    if (!entry) return null;
    
    if (entry.isBreak) {
      return <div className="text-center py-2 bg-gray-100 text-sm">Break</div>;
    }
    
    if (entry.isLunch) {
      return <div className="text-center py-2 bg-gray-100 text-sm">Lunch</div>;
    }
    
    if (entry.subjectName) {
      return (
        <div className={`p-2 ${entry.isLab ? 'bg-green-50' : 'bg-blue-50'} rounded`}>
          <div className="font-medium">{entry.subjectName}</div>
          <div className="text-xs text-gray-600">{entry.teacherName}</div>
          {entry.isLab && entry.batchNumber && 
            <div className="text-xs text-green-600">Batch: {entry.batchNumber}</div>
          }
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full h-6 text-xs mt-2"
            onClick={() => clearCell(day, timeSlot)}
          >
            Clear
          </Button>
        </div>
      );
    }
    
    if (entry.isFree && entry.freeType) {
      return (
        <div className="p-2 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">{entry.freeType}</div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full h-6 text-xs mt-2"
            onClick={() => clearCell(day, timeSlot)}
          >
            Clear
          </Button>
        </div>
      );
    }
    
    return (
      <div className="p-2">
        <div className="flex flex-col gap-2 mb-2">
          <Select 
            onValueChange={(value) => handleCellChange(day, timeSlot, value, 'subject')}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjectTeacherPairs.length === 0 ? (
                <SelectItem value="no-subjects-available" disabled>
                  No subjects available
                </SelectItem>
              ) : (
                subjectTeacherPairs.map((pair) => (
                  <SelectItem key={pair.id} value={`${pair.id}|${pair.teacherName}`}>
                    {pair.subjectName} - {pair.teacherName} {pair.isLab && "(Lab)"}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          <Select 
            onValueChange={(value) => handleCellChange(day, timeSlot, value, 'free')}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Free" />
            </SelectTrigger>
            <SelectContent>
              {freeHours.length === 0 ? (
                <SelectItem value="no-free-hours-available" disabled>
                  No free hours available
                </SelectItem>
              ) : (
                freeHours.map((free, index) => (
                  <SelectItem 
                    key={index} 
                    value={free.type === 'Others' && free.customType ? free.customType : free.type}
                  >
                    {free.type === 'Others' && free.customType ? free.customType : free.type}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full h-6 text-xs"
          onClick={() => clearCell(day, timeSlot)}
        >
          Clear
        </Button>
      </div>
    );
  };
  
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[100px_repeat(auto-fill,minmax(120px,1fr))] gap-1 mb-4">
          <div className="p-2 font-medium">Time / Day</div>
          {days.map((day) => (
            <div key={day} className="p-2 font-medium text-center">{day}</div>
          ))}
        </div>
        
        {[...timeSlots, '11:10-11:20', '1:00-2:00'].sort((a, b) => {
          return timeOrder[a as TimeSlot] - timeOrder[b as TimeSlot];
        }).map((timeSlot) => (
          <div key={timeSlot} className="grid grid-cols-[100px_repeat(auto-fill,minmax(120px,1fr))] gap-1 mb-1">
            <div className="p-2 font-medium flex items-center">{timeSlot}</div>
            {days.map((day) => (
              <div key={`${day}-${timeSlot}`} className="border rounded">
                {getCellContent(day, timeSlot as TimeSlot)}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-muted-foreground mb-2">
          Manual scheduling for {year} {branch}. Select subjects or free hours for each cell.
        </p>
      </div>
    </div>
  );
};

export default ManualSchedulingGrid;
