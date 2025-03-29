
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
  const [subjects, setSubjects] = useState<SubjectTeacherPair[]>([]);
  const [timetableData, setTimetableData] = useState<Record<string, any>>({});
  
  // Determine which days to use
  const getDaysForTimetable = (): Day[] => {
    if (year === '4th Year') {
      if (dayOptions.fourContinuousDays) {
        return ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
      } else if (dayOptions.useCustomDays) {
        return dayOptions.selectedDays;
      }
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
    // Initialize available subjects
    setSubjects([...subjectTeacherPairs]);
    
    // Initialize empty timetable
    const initialData: Record<string, any> = {
      subjects: {},
      slots: {},
      slotIds: [],
    };
    
    // Add subjects to the data
    subjectTeacherPairs.forEach((pair, index) => {
      const id = `subject-${index}`;
      initialData.subjects[id] = {
        id,
        subjectName: pair.subjectName,
        teacherName: pair.teacherName,
        isLab: pair.isLab,
        batchNumber: pair.batchNumber,
        originalId: pair.id
      };
    });
    
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
            subjectIds: []
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
            subjectIds: []
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
            subjectIds: []
          };
          initialData.slotIds.push(id);
        }
      });
    });
    
    setTimetableData(initialData);
  }, [subjectTeacherPairs, days]);
  
  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside a droppable area
    if (!destination) {
      return;
    }
    
    // Dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    // Handling different types of drags
    if (source.droppableId === 'subjects-list' && destination.droppableId !== 'subjects-list') {
      // Moving from subjects list to a time slot
      const slot = timetableData.slots[destination.droppableId];
      
      // Check if slot already has a subject
      if (slot.subjectIds.length > 0) {
        toast({
          title: "Slot already filled",
          description: "This time slot already has a subject assigned",
          variant: "destructive",
        });
        return;
      }
      
      // Check if the slot is a break or lunch
      if (slot.isBreak || slot.isLunch) {
        toast({
          title: "Invalid slot",
          description: "Cannot assign subjects to break or lunch slots",
          variant: "destructive",
        });
        return;
      }
      
      // Add subject to the slot
      const newSlot = {
        ...slot,
        subjectIds: [draggableId]
      };
      
      setTimetableData({
        ...timetableData,
        slots: {
          ...timetableData.slots,
          [destination.droppableId]: newSlot
        }
      });
    } else if (destination.droppableId === 'subjects-list') {
      // Moving back to subjects list (removing from slot)
      if (source.droppableId !== 'subjects-list') {
        const slot = timetableData.slots[source.droppableId];
        const newSlot = {
          ...slot,
          subjectIds: []
        };
        
        setTimetableData({
          ...timetableData,
          slots: {
            ...timetableData.slots,
            [source.droppableId]: newSlot
          }
        });
      }
    } else {
      // Moving from one slot to another
      const sourceSlot = timetableData.slots[source.droppableId];
      const destSlot = timetableData.slots[destination.droppableId];
      
      // Check if destination slot already has a subject
      if (destSlot.subjectIds.length > 0) {
        toast({
          title: "Slot already filled",
          description: "The destination slot already has a subject assigned",
          variant: "destructive",
        });
        return;
      }
      
      // Move subject from source to destination
      const newSourceSlot = {
        ...sourceSlot,
        subjectIds: []
      };
      
      const newDestSlot = {
        ...destSlot,
        subjectIds: [draggableId]
      };
      
      setTimetableData({
        ...timetableData,
        slots: {
          ...timetableData.slots,
          [source.droppableId]: newSourceSlot,
          [destination.droppableId]: newDestSlot
        }
      });
    }
  };
  
  const handleSaveTimetable = () => {
    // Convert the manual timetable data to TimetableEntry format
    const entries: TimetableEntry[] = [];
    
    Object.keys(timetableData.slots).forEach(slotId => {
      const slot = timetableData.slots[slotId];
      const { day, timeSlot, isBreak, isLunch, subjectIds } = slot;
      
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
      } else if (subjectIds.length > 0) {
        const subjectId = subjectIds[0];
        const subject = timetableData.subjects[subjectId];
        
        entries.push({
          day,
          timeSlot,
          subjectName: subject.subjectName,
          teacherName: subject.teacherName,
          isLab: subject.isLab,
          batchNumber: subject.batchNumber
        });
      } else {
        // Empty slot, add as free period
        const freeType = freeHours.length > 0 ? 
          (freeHours[0].type === 'Others' && freeHours[0].customType ? 
            freeHours[0].customType : freeHours[0].type) : 'Free';
          
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
        Drag subjects from the list on the left to the timetable slots on the right to create your manual schedule.
        You can also drag subjects between slots to rearrange them.
      </p>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Subjects</h3>
                <Droppable droppableId="subjects-list">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-h-[200px] space-y-2 border rounded-md p-2"
                    >
                      {Object.keys(timetableData.subjects || {}).map((subjectId, index) => {
                        const subject = timetableData.subjects[subjectId];
                        return (
                          <Draggable key={subjectId} draggableId={subjectId} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white border rounded p-2 shadow-sm"
                              >
                                <div className="font-medium text-sm">{subject.subjectName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {subject.teacherName}
                                  {subject.isLab && subject.batchNumber && ` (${subject.batchNumber})`}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
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
                            
                            return (
                              <Droppable key={slotId} droppableId={slotId}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="p-1 border min-h-[50px]"
                                  >
                                    {slot.subjectIds.length > 0 && (
                                      <div className="bg-blue-50 p-1 rounded text-xs h-full">
                                        {timetableData.subjects[slot.subjectIds[0]] && (
                                          <>
                                            <div className="font-medium">
                                              {timetableData.subjects[slot.subjectIds[0]].subjectName}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                              {timetableData.subjects[slot.subjectIds[0]].teacherName}
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    )}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
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
        </div>
      </DragDropContext>
      
      <div className="flex justify-end mt-4">
        <Button onClick={handleSaveTimetable}>Save Manual Timetable</Button>
      </div>
    </div>
  );
};

export default ManualSchedulingGrid;
