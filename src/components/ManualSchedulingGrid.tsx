
import React, { useState, useEffect } from 'react';
import { 
  YearType, 
  BranchType, 
  Day, 
  TimeSlot, 
  SubjectTeacherPair,
  TimetableEntry
} from '@/utils/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ManualSchedulingGridProps {
  subjectTeacherPairs: SubjectTeacherPair[];
  year: YearType;
  branch: BranchType;
  freeHours: any[];
  dayOptions: {
    fourContinuousDays: boolean;
    useCustomDays: boolean;
    selectedDays: Day[];
  };
  onSave: (entries: TimetableEntry[]) => void;
}

const ManualSchedulingGrid: React.FC<ManualSchedulingGridProps> = ({
  subjectTeacherPairs,
  year,
  branch,
  freeHours,
  dayOptions,
  onSave
}) => {
  const { toast } = useToast();
  const [timetableData, setTimetableData] = useState<Record<string, any>>({});
  
  // Determine which days to use
  const getDaysForTimetable = (): Day[] => {
    if (dayOptions.useCustomDays) {
      return dayOptions.selectedDays;
    } else if (dayOptions.fourContinuousDays) {
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    }
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  };
  
  const days: Day[] = getDaysForTimetable();
  
  // Regular time slots (excluding breaks and lunch)
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
  
  useEffect(() => {
    // Initialize empty timetable
    const initialData: Record<string, any> = {
      slots: {},
      slotIds: [],
    };
    
    // Add time slots to the data
    days.forEach(day => {
      timeSlots.forEach(timeSlot => {
        if (timeSlot === '11:10-11:20') {
          // Break slot
          const id = `${day}-${timeSlot}`;
          initialData.slots[id] = {
            id,
            day,
            timeSlot,
            isBreak: true,
            content: 'Break',
            subjectId: null
          };
        } else if (timeSlot === '1:00-2:00') {
          // Lunch slot
          const id = `${day}-${timeSlot}`;
          initialData.slots[id] = {
            id,
            day,
            timeSlot,
            isLunch: true,
            content: 'Lunch',
            subjectId: null
          };
        } else {
          // Regular slot
          const id = `${day}-${timeSlot}`;
          initialData.slots[id] = {
            id,
            day,
            timeSlot,
            isBreak: false,
            isLunch: false,
            content: '',
            subjectId: null
          };
          initialData.slotIds.push(id);
        }
      });
    });
    
    setTimetableData(initialData);
  }, [subjectTeacherPairs, days]);

  const handleSubjectChange = (slotId: string, subjectId: string | null) => {
    setTimetableData(prev => ({
      ...prev,
      slots: {
        ...prev.slots,
        [slotId]: {
          ...prev.slots[slotId],
          subjectId
        }
      }
    }));
  };
  
  const handleSaveTimetable = () => {
    // Convert the manual timetable data to TimetableEntry format
    const entries: TimetableEntry[] = [];
    
    Object.keys(timetableData.slots).forEach(slotId => {
      const slot = timetableData.slots[slotId];
      const { day, timeSlot, isBreak, isLunch, subjectId } = slot;
      
      if (isBreak) {
        entries.push({
          day,
          timeSlot,
          isBreak: true
        });
      } else if (isLunch) {
        entries.push({
          day,
          timeSlot,
          isLunch: true
        });
      } else if (subjectId) {
        const subject = subjectTeacherPairs.find(pair => pair.id === subjectId);
        
        if (subject) {
          entries.push({
            day,
            timeSlot,
            subjectName: subject.subjectName,
            teacherName: subject.teacherName,
            isLab: subject.isLab,
            batchNumber: subject.batchNumber
          });
        }
      } else {
        // Empty slot, add as free period using the configured free hours
        const freeType = freeHours && freeHours.length > 0 ? 
          (freeHours[0].type === 'Others' && freeHours[0].customType ? 
            freeHours[0].customType : freeHours[0].type) : 'Library';
          
        entries.push({
          day,
          timeSlot,
          isFree: true,
          freeType
        });
      }
    });
    
    onSave(entries);
    
    toast({
      title: "Manual scheduling saved",
      description: "Your manual timetable has been saved",
    });
  };
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Select subjects from the dropdown menu in each time slot to create your manual schedule.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Timetable</h3>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1">
                  {/* Header row */}
                  <div className="font-medium p-2 text-center">Time / Day</div>
                  {days.map(day => (
                    <div key={day} className="font-medium p-2 text-center">{day}</div>
                  ))}
                  
                  {/* Time slots */}
                  {timeSlots.map(timeSlot => (
                    <React.Fragment key={timeSlot}>
                      <div className="p-2 text-xs text-center border bg-gray-50">{timeSlot}</div>
                      {days.map(day => {
                        const slotId = `${day}-${timeSlot}`;
                        const slot = timetableData.slots ? timetableData.slots[slotId] : null;
                        
                        if (!slot) return <div key={slotId} className="p-2 border"></div>;
                        
                        if (slot.isBreak) {
                          return (
                            <div key={slotId} className="p-2 border bg-gray-100 text-center text-xs">
                              Break
                            </div>
                          );
                        }
                        
                        if (slot.isLunch) {
                          return (
                            <div key={slotId} className="p-2 border bg-gray-100 text-center text-xs">
                              Lunch
                            </div>
                          );
                        }
                        
                        const selectedSubject = subjectTeacherPairs.find(pair => pair.id === slot.subjectId);
                        
                        return (
                          <div key={slotId} className="p-2 border">
                            <Select
                              value={slot.subjectId || ""}
                              onValueChange={(value) => handleSubjectChange(slotId, value || null)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {subjectTeacherPairs.map((subject) => (
                                  <SelectItem key={subject.id} value={subject.id}>
                                    {subject.subjectName} - {subject.teacherName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {selectedSubject && (
                              <div className="mt-1 text-xs">
                                <div className="font-medium">{selectedSubject.subjectName}</div>
                                <div className="text-muted-foreground">{selectedSubject.teacherName}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button onClick={handleSaveTimetable}>Save Manual Timetable</Button>
      </div>
    </div>
  );
};

export default ManualSchedulingGrid;
