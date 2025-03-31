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
  BranchType,
  LabBatchPair
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
  enableBatchRotation?: boolean;
}

const ManualSchedulingGrid: React.FC<ManualSchedulingGridProps> = ({ 
  subjectTeacherPairs, 
  freeHours, 
  dayOptions,
  year,
  branch,
  onSave,
  existingEntries = [],
  enableBatchRotation = false
}) => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const { toast } = useToast();
  
  let days: Day[];
  
  if (year === '4th Year') {
    days = dayOptions.useCustomDays 
      ? dayOptions.selectedDays
      : dayOptions.fourContinuousDays 
        ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday'] as Day[]
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as Day[];
  } else {
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
    '11:10-11:20': 2,
    '11:20-12:10': 3,
    '12:10-1:00': 4,
    '1:00-2:00': 5,
    '2:00-2:50': 6,
    '2:50-3:40': 7,
    '3:40-4:30': 8,
    '9:30-1:00': 9,
    '10:20-1:00': 10,
    '2:00-4:30': 11
  };
  
  const labSubjects = subjectTeacherPairs.filter(pair => pair.isLab);
  
  useEffect(() => {
    if (existingEntries && existingEntries.length > 0) {
      console.log("Using existing entries:", existingEntries.length);
      
      const filteredEntries = existingEntries.filter(entry => days.includes(entry.day));
      
      const initialEntries: TimetableEntry[] = [];
      
      days.forEach(day => {
        timeSlots.forEach(timeSlot => {
          const existingEntry = filteredEntries.find(
            entry => entry.day === day && entry.timeSlot === timeSlot
          );
          
          if (existingEntry) {
            initialEntries.push(existingEntry);
          } else {
            initialEntries.push({
              day,
              timeSlot,
              subjectName: undefined,
              teacherName: undefined,
              isLab: false,
              batchNumber: undefined,
              isFree: false,
              freeType: undefined
            });
          }
        });
        
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
          subjectName: undefined,
          teacherName: undefined,
          isLab: false,
          batchNumber: undefined,
          isFree: false,
          freeType: undefined
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
      onSave(entries);
    }
  }, [entries, onSave]);

  const checkTeacherConflicts = (day: Day, timeSlot: TimeSlot, teacherName: string): boolean => {
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
    
    return !isTeacherAvailable(teacherName, day, timeSlot);
  };
  
  const handleCellChange = (day: Day, timeSlot: TimeSlot, value: string, type: 'subject' | 'free') => {
    console.log("Handling cell change:", { day, timeSlot, value, type });
    
    if (type === 'subject') {
      const [subjectId, teacherName] = value.split('|');
      const subject = subjectTeacherPairs.find(s => s.id === subjectId);
      
      if (subject) {
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
  
  const clearCell = (day: Day, timeSlot: TimeSlot) => {
    console.log("Clearing cell:", { day, timeSlot });
    
    setEntries(prevEntries => {
      const updatedEntries = prevEntries.map(entry => {
        if (entry.day === day && entry.timeSlot === timeSlot) {
          return {
            day,
            timeSlot,
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
      
      setTimeout(() => {
        toast({
          title: "Cell Cleared",
          description: "The time slot has been cleared.",
          variant: "default"
        });
      }, 100);
      
      return updatedEntries;
    });
  };
  
  const handleBatchRotationSelect = (day: Day, timeSlot: TimeSlot, batch1SubjectId: string, batch2SubjectId: string) => {
    if (!enableBatchRotation) return;
    
    const batch1Subject = subjectTeacherPairs.find(s => s.id === batch1SubjectId);
    const batch2Subject = subjectTeacherPairs.find(s => s.id === batch2SubjectId);
    
    if (!batch1Subject || !batch2Subject) {
      toast({
        title: "Selection Error",
        description: "Please select valid subjects for both batches",
        variant: "destructive"
      });
      return;
    }
    
    if (batch1Subject.teacherName === batch2Subject.teacherName) {
      toast({
        title: "Teacher Conflict",
        description: `${batch1Subject.teacherName} cannot teach both lab batches simultaneously`,
        variant: "destructive"
      });
      return;
    }
    
    if (checkTeacherConflicts(day, timeSlot, batch1Subject.teacherName) || 
        checkTeacherConflicts(day, timeSlot, batch2Subject.teacherName)) {
      toast({
        title: "Scheduling Conflict",
        description: "One or both teachers already have a class scheduled at this time slot.",
        variant: "destructive"
      });
      return;
    }
    
    const labGroupId = `lab-${day}-${timeSlot}`;
    
    setEntries(prevEntries => {
      const newEntries = prevEntries.map(entry => {
        if (entry.day === day && entry.timeSlot === timeSlot) {
          return {
            ...entry,
            isBatchRotationLab: true,
            batch1Subject: batch1Subject.subjectName,
            batch1Teacher: batch1Subject.teacherName,
            batch2Subject: batch2Subject.subjectName,
            batch2Teacher: batch2Subject.teacherName,
            labGroupId,
            subjectName: undefined,
            teacherName: undefined,
            isLab: true,
            isFree: false,
            freeType: undefined
          };
        }
        return entry;
      });
      
      setTimeout(() => {
        toast({
          title: "Batch Rotation Lab Assigned",
          description: `${batch1Subject.subjectName} (B1) and ${batch2Subject.subjectName} (B2) have been assigned to this slot.`,
          variant: "default"
        });
      }, 100);
      
      return newEntries;
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
    
    if (entry.isBatchRotationLab) {
      return (
        <div className="p-2 bg-green-50 rounded">
          <div className="text-xs font-medium">
            {entry.batch1Subject} (B1) / {entry.batch2Subject} (B2)
          </div>
          <div className="text-xs text-gray-600">
            {entry.batch1Teacher} / {entry.batch2Teacher}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full h-6 text-xs mt-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clearCell(day, timeSlot);
            }}
          >
            Clear
          </Button>
        </div>
      );
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clearCell(day, timeSlot);
            }}
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clearCell(day, timeSlot);
            }}
          >
            Clear
          </Button>
        </div>
      );
    }
    
    const isLabTimeSlot = timeSlot === '10:20-11:10' || timeSlot === '2:00-2:50';
    
    if (enableBatchRotation && isLabTimeSlot && labSubjects.length >= 2) {
      return (
        <div className="p-2">
          <div className="text-xs font-medium mb-2">Batch Rotation Lab</div>
          <div className="flex flex-col gap-2 mb-2">
            <div>
              <p className="text-xs mb-1">Batch 1 - Subject:</p>
              <Select 
                onValueChange={(batch1SubjectId) => {
                  const batch2SubjectId = document.querySelector(`[data-batch2-select="${day}-${timeSlot}"]`)?.getAttribute('data-selected-value');
                  if (batch2SubjectId) {
                    handleBatchRotationSelect(day, timeSlot, batch1SubjectId, batch2SubjectId);
                  }
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="B1 Subject" />
                </SelectTrigger>
                <SelectContent>
                  {labSubjects.length === 0 ? (
                    <SelectItem value="no-labs-available" disabled>
                      No lab subjects available
                    </SelectItem>
                  ) : (
                    labSubjects.map((pair) => (
                      <SelectItem key={`b1-${pair.id}`} value={pair.id}>
                        {pair.subjectName} - {pair.teacherName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <p className="text-xs mb-1">Batch 2 - Subject:</p>
              <Select 
                onValueChange={(batch2SubjectId) => {
                  const selectElement = document.querySelector(`[data-batch2-select="${day}-${timeSlot}"]`);
                  if (selectElement) {
                    selectElement.setAttribute('data-selected-value', batch2SubjectId);
                  }
                  
                  const batch1SubjectId = document.querySelector(`[data-batch1-select="${day}-${timeSlot}"]`)?.getAttribute('data-selected-value');
                  if (batch1SubjectId) {
                    handleBatchRotationSelect(day, timeSlot, batch1SubjectId, batch2SubjectId);
                  }
                }}
                data-batch2-select={`${day}-${timeSlot}`}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="B2 Subject" />
                </SelectTrigger>
                <SelectContent>
                  {labSubjects.length === 0 ? (
                    <SelectItem value="no-labs-available" disabled>
                      No lab subjects available
                    </SelectItem>
                  ) : (
                    labSubjects.map((pair) => (
                      <SelectItem key={`b2-${pair.id}`} value={pair.id}>
                        {pair.subjectName} - {pair.teacherName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="text-xs mb-1">Or select a regular subject/free hour:</div>
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clearCell(day, timeSlot);
            }}
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            clearCell(day, timeSlot);
          }}
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
