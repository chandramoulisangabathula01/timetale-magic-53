
import React from 'react';
import { Timetable, Day, TimeSlot } from '@/utils/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TimetableViewProps {
  timetable: Timetable;
  facultyFilter?: string;
  printMode?: boolean;
}

const TimetableView: React.FC<TimetableViewProps> = ({ timetable, facultyFilter, printMode = false }) => {
  const days: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDays: Record<Day, string> = {
    'Monday': 'MON',
    'Tuesday': 'TUE',
    'Wednesday': 'WED',
    'Thursday': 'THU',
    'Friday': 'FRI',
    'Saturday': 'SAT'
  };
  
  // Regular time slots (including breaks and lunch)
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
  
  // Filter timetable entries based on faculty name if provided
  const filteredEntries = facultyFilter
    ? timetable.entries.map(entry => {
        if (entry.teacherName === facultyFilter) {
          return entry;
        } else {
          // Keep break and lunch slots
          if (entry.isBreak || entry.isLunch) {
            return entry;
          }
          // Empty out other slots
          return {
            ...entry,
            subjectName: undefined,
            teacherName: undefined,
            isLab: undefined,
            isFree: undefined,
            freeType: undefined
          };
        }
      })
    : timetable.entries;
  
  // Get subject list with teachers for the footer
  const subjectTeacherList = timetable.formData.subjectTeacherPairs.filter(pair => {
    // If faculty filter is provided, only show subjects taught by that faculty
    return !facultyFilter || pair.teacherName === facultyFilter;
  });
  
  // Helper function to check if a cell is part of a lab group
  const isLabGroup = (day: Day, timeSlot: TimeSlot) => {
    const entry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    return entry?.isLabGroup && entry?.labGroupId;
  };
  
  // Helper function to get all entries in the same lab group
  const getLabGroupEntries = (labGroupId: string) => {
    return filteredEntries.filter(entry => entry.labGroupId === labGroupId);
  };
  
  // Helper function to get cell content for a specific day and time slot
  const getCellContent = (day: Day, timeSlot: TimeSlot) => {
    const entry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    
    if (!entry) return null;
    
    if (entry.isBreak) {
      return <div className="text-sm italic text-center">Break</div>;
    }
    
    if (entry.isLunch) {
      return <div className="text-sm italic text-center">Lunch</div>;
    }
    
    if (entry.isFree && entry.freeType) {
      return <div className="text-sm italic text-center">{entry.freeType}</div>;
    }
    
    if (entry.subjectName && entry.teacherName) {
      // Special handling for lab entries
      if (entry.isLab && entry.isLabGroup && entry.labGroupId) {
        const labGroupEntries = getLabGroupEntries(entry.labGroupId);
        const firstEntry = labGroupEntries[0]; // This will be the current entry
        
        // Only render content for the first slot in the lab group to avoid duplication
        if (firstEntry && firstEntry.day === day && firstEntry.timeSlot === timeSlot) {
          // Determine the time span for this lab group
          const allTimeSlots = labGroupEntries.map(e => e.timeSlot);
          const firstTimeSlot = allTimeSlots[0];
          const lastTimeSlot = allTimeSlots[allTimeSlots.length - 1];
          
          return (
            <div className="font-medium text-center">
              <div>{entry.subjectName}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {entry.teacherName}
                {entry.batchNumber && <span> ({entry.batchNumber})</span>}
              </div>
              <div className="text-xs mt-1 font-normal">{firstTimeSlot} - {lastTimeSlot}</div>
            </div>
          );
        } else {
          // This is a continuation slot - leave empty
          return null;
        }
      }
      
      // Regular subject entry
      return (
        <div className={`text-sm ${entry.isLab ? 'font-medium' : ''} text-center`}>
          <div>{entry.subjectName}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {entry.teacherName}
            {entry.batchNumber && ` (${entry.batchNumber})`}
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Helper function to get cell class for styling
  const getCellClass = (day: Day, timeSlot: TimeSlot) => {
    const entry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    
    if (!entry) return "";
    
    if (entry.isBreak) return "bg-gray-100 break-slot";
    if (entry.isLunch) return "bg-gray-100 lunch-slot";
    if (entry.isFree) return "bg-blue-50 free-slot";
    
    // Special handling for lab entries
    if (entry.isLab && entry.isLabGroup && entry.labGroupId) {
      const labGroupEntries = getLabGroupEntries(entry.labGroupId);
      
      // Apply lab styles to all entries in the group
      if (labGroupEntries.some(e => e.day === day && e.timeSlot === timeSlot)) {
        return "bg-green-50 lab-slot";
      }
    }
    
    if (entry.isLab) return "bg-green-50 lab-slot";
    if (entry.subjectName) return "bg-white";
    
    return "";
  };
  
  // Helper function to determine if a cell should span multiple rows
  const getCellRowSpan = (day: Day, timeSlot: TimeSlot) => {
    const entry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    
    if (!entry || !entry.isLabGroup || !entry.labGroupId) return 1;
    
    const labGroupEntries = getLabGroupEntries(entry.labGroupId);
    const firstEntry = labGroupEntries[0];
    
    // Only the first cell in the lab group should span rows
    if (firstEntry && firstEntry.day === day && firstEntry.timeSlot === timeSlot) {
      return labGroupEntries.length;
    }
    
    // Other cells in the group should be skipped
    return 0;
  };
  
  // Helper function to determine if a cell should be rendered
  const shouldRenderCell = (day: Day, timeSlot: TimeSlot) => {
    const entry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    
    if (!entry || !entry.isLabGroup || !entry.labGroupId) return true;
    
    const labGroupEntries = getLabGroupEntries(entry.labGroupId);
    const firstEntry = labGroupEntries[0];
    
    // Only render the first cell in a lab group
    return !firstEntry || firstEntry.day === day && firstEntry.timeSlot === timeSlot;
  };
  
  // Generate table for printMode=false (normal view)
  if (!printMode) {
    // Generate table rows based on time slots
    const tableRows = timeSlots.map(timeSlot => (
      <TableRow key={timeSlot}>
        <TableCell className="border p-2 text-xs bg-gray-50 font-medium">
          {timeSlot}
        </TableCell>
        {days.map(day => {
          const rowSpan = getCellRowSpan(day, timeSlot);
          
          if (rowSpan === 0) {
            // Skip this cell as it's part of a lab group and not the first cell
            return null;
          }
          
          return (
            <TableCell 
              key={`${day}-${timeSlot}`} 
              className={`border p-2 ${getCellClass(day, timeSlot)}`}
              rowSpan={rowSpan}
            >
              {getCellContent(day, timeSlot)}
            </TableCell>
          );
        })}
      </TableRow>
    ));
    
    return (
      <div className={printMode ? "print-timetable" : ""}>
        <div className="overflow-x-auto timetable-container">
          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="border p-2 bg-gray-50 font-bold text-center">Time / Day</TableHead>
                {days.map(day => (
                  <TableHead key={day} className="border p-2 bg-gray-50 font-bold text-center">{day}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows}
            </TableBody>
          </Table>
        </div>
        
        {/* Subject and Teacher List */}
        {subjectTeacherList.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold mb-2">Subject Details</h4>
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {subjectTeacherList.map(pair => (
                <div key={pair.id} className="text-sm">
                  <span className="font-medium">{pair.subjectName}</span>
                  {pair.isLab && <span className="text-xs ml-1">(Lab)</span>}
                  <span> - {pair.teacherName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Generate printable table that matches the requested format for printMode=true
  return (
    <div className="print-timetable">
      <Table className="w-full border-collapse border table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="border p-2 bg-gray-50 font-bold text-center">DAY</TableHead>
            {timeSlots.map(slot => (
              <TableHead key={slot} className="border p-2 bg-gray-50 font-bold text-center">
                {slot}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map(day => (
            <TableRow key={day}>
              <TableCell className="border p-2 text-center font-bold bg-gray-50">
                {shortDays[day]}
              </TableCell>
              {timeSlots.map(timeSlot => {
                const entry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
                let content = '';
                let teacher = '';
                
                if (entry) {
                  if (entry.isBreak) {
                    content = 'Break';
                  } else if (entry.isLunch) {
                    content = 'Lunch';
                  } else if (entry.subjectName) {
                    content = entry.subjectName;
                    teacher = entry.teacherName || '';
                  } else if (entry.isFree && entry.freeType) {
                    content = entry.freeType;
                  }
                }
                
                return (
                  <TableCell 
                    key={`${day}-${timeSlot}`} 
                    className={`border p-1 text-center ${getCellClass(day, timeSlot)}`}
                  >
                    {content && (
                      <>
                        <div className="font-medium text-sm">{content}</div>
                        {teacher && <div className="text-xs text-muted-foreground">{teacher}</div>}
                      </>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TimetableView;
