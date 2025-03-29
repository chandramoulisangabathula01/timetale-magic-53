
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CheckCircle, BookOpen, FlaskConical, Coffee } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<'subject' | 'teacher'>('subject');
  
  // Get all days including Friday and Saturday
  const allDays: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Use all days regardless of options for the redesigned grid
  const days: Day[] = allDays;
  
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

  const getSubjectDisplay = (subject: SubjectTeacherPair) => {
    return viewMode === 'subject' ? 
      `${subject.subjectName}${subject.isLab ? ' (Lab)' : ''}` : 
      `${subject.teacherName}`;
  };

  const getSlotBackgroundColor = (subjectId: string | null) => {
    if (!subjectId) return "bg-white";
    
    const subject = subjectTeacherPairs.find(pair => pair.id === subjectId);
    if (!subject) return "bg-white";
    
    if (subject.isLab) return "bg-blue-50";
    return "bg-green-50";
  };
  
  const getCellIcon = (slot: any) => {
    if (slot.isBreak) return <Coffee className="h-4 w-4 mr-1 text-amber-500" />;
    if (slot.isLunch) return <Coffee className="h-4 w-4 mr-1 text-amber-500" />;
    
    const subject = subjectTeacherPairs.find(pair => pair.id === slot.subjectId);
    if (!subject) return null;
    
    return subject.isLab ? 
      <FlaskConical className="h-4 w-4 mr-1 text-blue-500" /> : 
      <BookOpen className="h-4 w-4 mr-1 text-green-500" />;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Select subjects from the dropdown menu in each time slot to create your manual schedule.
        </p>
        
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'subject' | 'teacher')}>
          <ToggleGroupItem value="subject" aria-label="Toggle subject view">Subject</ToggleGroupItem>
          <ToggleGroupItem value="teacher" aria-label="Toggle teacher view">Teacher</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <Card className="shadow-md">
        <CardContent className="p-4">
          <h3 className="font-medium mb-3 text-lg text-center">Timetable Schedule</h3>
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[100px_repeat(6,1fr)] gap-1 border-b-2 border-gray-200">
                {/* Header row */}
                <div className="font-medium p-2 text-center bg-gray-100 rounded-tl-md">Time / Day</div>
                {days.map(day => (
                  <div key={day} className="font-medium p-2 text-center bg-gray-100">
                    {day}
                  </div>
                ))}
                
                {/* Time slots */}
                {timeSlots.map(timeSlot => (
                  <React.Fragment key={timeSlot}>
                    <div className="p-2 text-xs text-center border bg-gray-50 font-medium">
                      {timeSlot}
                    </div>
                    
                    {days.map(day => {
                      const slotId = `${day}-${timeSlot}`;
                      const slot = timetableData.slots ? timetableData.slots[slotId] : null;
                      
                      if (!slot) return <div key={slotId} className="p-2 border"></div>;
                      
                      if (slot.isBreak || slot.isLunch) {
                        return (
                          <div key={slotId} className="p-2 border bg-amber-50 text-center text-xs flex items-center justify-center">
                            <Coffee className="h-4 w-4 mr-1 text-amber-500" />
                            <span className="font-medium">{slot.isBreak ? 'Break' : 'Lunch'}</span>
                          </div>
                        );
                      }
                      
                      const selectedSubject = subjectTeacherPairs.find(pair => pair.id === slot.subjectId);
                      const bgColor = getSlotBackgroundColor(slot.subjectId);
                      
                      return (
                        <div key={slotId} className={`p-2 border ${bgColor} hover:bg-gray-50 transition-colors duration-200`}>
                          <Select
                            value={slot.subjectId || ""}
                            onValueChange={(value) => handleSubjectChange(slotId, value || null)}
                          >
                            <SelectTrigger className="h-8 text-xs w-full">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None (Free Period)</SelectItem>
                              {subjectTeacherPairs.map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {getSubjectDisplay(subject)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {selectedSubject && (
                            <div className="mt-1 text-xs flex items-center">
                              {getCellIcon(slot)}
                              <div>
                                <div className="font-medium">{selectedSubject.subjectName}</div>
                                <div className="text-muted-foreground">{selectedSubject.teacherName}</div>
                              </div>
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
      
      <div className="flex justify-end mt-6">
        <Button 
          onClick={handleSaveTimetable} 
          className="px-6"
          size="lg"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Save Timetable
        </Button>
      </div>
    </div>
  );
};

export default ManualSchedulingGrid;
