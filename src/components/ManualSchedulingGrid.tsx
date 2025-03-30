import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
}

const ManualSchedulingGrid: React.FC<ManualSchedulingGridProps> = ({ 
  subjectTeacherPairs, 
  freeHours, 
  dayOptions,
  year,
  branch,
  onSave 
}) => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  
  const days: Day[] = dayOptions.useCustomDays 
    ? dayOptions.selectedDays 
    : dayOptions.fourContinuousDays 
      ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday'] 
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
  const timeSlots: TimeSlot[] = [
    '9:30-10:20', 
    '10:20-11:10', 
    '11:20-12:10', 
    '12:10-1:00', 
    '2:00-2:50', 
    '2:50-3:40', 
    '3:40-4:30'
  ];
  
  useEffect(() => {
    // Initialize entries
    const initialEntries: TimetableEntry[] = [];
    
    days.forEach(day => {
      timeSlots.forEach(timeSlot => {
        initialEntries.push({
          day,
          timeSlot,
          // No subject assigned initially
        });
      });
      
      // Add break and lunch entries
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
  }, [days.length, timeSlots.length]);
  
  useEffect(() => {
    // Save entries whenever they change
    onSave(entries);
  }, [entries, onSave]);
  
  const handleCellChange = (day: Day, timeSlot: TimeSlot, value: string, type: 'subject' | 'free') => {
    setEntries(prevEntries => {
      return prevEntries.map(entry => {
        if (entry.day === day && entry.timeSlot === timeSlot) {
          if (type === 'subject') {
            const [subjectId, teacherId] = value.split('|');
            const subject = subjectTeacherPairs.find(s => s.id === subjectId);
            
            if (subject) {
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
          } else if (type === 'free') {
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
        }
        return entry;
      });
    });
  };
  
  const clearCell = (day: Day, timeSlot: TimeSlot) => {
    setEntries(prevEntries => {
      return prevEntries.map(entry => {
        if (entry.day === day && entry.timeSlot === timeSlot) {
          return {
            day,
            timeSlot,
            // Clear all other properties
          };
        }
        return entry;
      });
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
        </div>
      );
    }
    
    if (entry.isFree && entry.freeType) {
      return (
        <div className="p-2 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">{entry.freeType}</div>
        </div>
      );
    }
    
    return (
      <div className="p-2">
        <div className="flex gap-2 mb-2">
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
                  <SelectItem key={pair.id} value={pair.id}>
                    {pair.subjectName} - {pair.teacherName}
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
          // Custom sort to keep the timeSlots in chronological order
          const timeOrder: Record<TimeSlot, number> = {
            '9:30-10:20': 1,
            '10:20-11:10': 2,
            '11:10-11:20': 3, // Break
            '11:20-12:10': 4,
            '12:10-1:00': 5,
            '1:00-2:00': 6,  // Lunch
            '2:00-2:50': 7,
            '2:50-3:40': 8,
            '3:40-4:30': 9
          };
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
