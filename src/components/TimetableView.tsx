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
    '11:10-11:20', // Break slot
    '11:20-12:10', 
    '12:10-1:00', 
    '1:00-2:00',  // Lunch slot
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
  
  // Helper function to get a valid entry for a given day and time slot
  const getActualEntry = (day: Day, timeSlot: TimeSlot) => {
    // First, check if there's a direct entry for this time slot
    const directEntry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    
    if (directEntry) return directEntry;
    
    // If no direct entry, check if this slot might be part of a lab group
    // This handles the case where a lab spans multiple time slots
    const possibleLabEntry = filteredEntries.find(e => 
      e.day === day && 
      e.isLabGroup && 
      e.labGroupId && 
      getLabGroupEntries(e.labGroupId).some(labEntry => labEntry.timeSlot === timeSlot)
    );
    
    return possibleLabEntry;
  };
  
  // Helper function to get cell content for a specific day and time slot
  const getCellContent = (day: Day, timeSlot: TimeSlot) => {
    // Special handling for break and lunch slots
    if (timeSlot === '11:10-11:20') {
      return <div className="text-sm italic text-center">Break</div>;
    }
    
    if (timeSlot === '1:00-2:00') {
      return <div className="text-sm italic text-center">Lunch</div>;
    }
    
    const entry = getActualEntry(day, timeSlot);
    
    if (!entry) return null;
    
    // These conditions are kept for compatibility but should not be needed
    // since we now always render break and lunch in their respective slots above
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
        // For lab entries, we're going to treat each segment separately
        // (before break, after break, before lunch, after lunch)
        return (
          <div className="font-medium text-center">
            <div>{entry.subjectName}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {entry.teacherName}
              {entry.batchNumber && <span> ({entry.batchNumber})</span>}
            </div>
          </div>
        );
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
    // For break and lunch time slots
    if (timeSlot === '11:10-11:20') return "bg-gray-100 break-slot";
    if (timeSlot === '1:00-2:00') return "bg-gray-100 lunch-slot";
    
    const entry = getActualEntry(day, timeSlot);
    
    if (!entry) return "";
    
    if (entry.isBreak) return "bg-gray-100 break-slot";
    if (entry.isLunch) return "bg-gray-100 lunch-slot";
    if (entry.isFree) return "bg-blue-50 free-slot";
    
    // Special handling for lab entries
    if (entry.isLab) {
      return "bg-green-50 lab-slot";
    }
    
    if (entry.subjectName) return "bg-white";
    
    return "";
  };
  
  // Helper function to determine if a cell should span multiple rows
  const getCellRowSpan = (day: Day, timeSlot: TimeSlot) => {
    // Don't apply row spans to break and lunch slots
    if (timeSlot === '11:10-11:20' || timeSlot === '1:00-2:00') {
      return 1;
    }
    
    const entry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    
    if (!entry || !entry.isLabGroup || !entry.labGroupId) return 1;
    
    const labGroupEntries = getLabGroupEntries(entry.labGroupId);
    
    // Calculate consecutive slots that should be spanned (excluding breaks and lunch)
    let consecutiveSlots = 0;
    let slotIndex = timeSlots.indexOf(timeSlot);
    
    // Count consecutive slots until we hit a break, lunch, or end of lab group
    while (slotIndex < timeSlots.length) {
      const currentSlot = timeSlots[slotIndex];
      
      // Skip break and lunch slots
      if (currentSlot === '11:10-11:20' || currentSlot === '1:00-2:00') {
        slotIndex++;
        continue;
      }
      
      // Check if this time slot is part of the lab group
      const isPartOfGroup = labGroupEntries.some(e => e.timeSlot === currentSlot);
      
      if (!isPartOfGroup) break;
      
      consecutiveSlots++;
      slotIndex++;
      
      // Stop if we've reached a break or lunch
      if (slotIndex < timeSlots.length && 
          (timeSlots[slotIndex] === '11:10-11:20' || timeSlots[slotIndex] === '1:00-2:00')) {
        break;
      }
    }
    
    return consecutiveSlots;
  };
  
  // Helper function to determine if a cell should be rendered
  const shouldRenderCell = (day: Day, timeSlot: TimeSlot) => {
    // Always render break and lunch slots
    if (timeSlot === '11:10-11:20' || timeSlot === '1:00-2:00') {
      return true;
    }
    
    const entry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    
    if (!entry || !entry.isLabGroup || !entry.labGroupId) return true;
    
    // For lab groups, we need to check if this is the first slot in a consecutive series
    const slotIndex = timeSlots.indexOf(timeSlot);
    if (slotIndex === 0) return true;
    
    const prevSlot = timeSlots[slotIndex - 1];
    if (prevSlot === '11:10-11:20' || prevSlot === '1:00-2:00') {
      // This is the first slot after a break or lunch, so we should render it
      return true;
    }
    
    // Check if the previous slot is part of the same lab group
    const prevEntry = filteredEntries.find(e => 
      e.day === day && 
      e.timeSlot === prevSlot && 
      e.labGroupId === entry.labGroupId
    );
    
    // If the previous slot isn't part of the same lab group, render this cell
    return !prevEntry;
  };
  
  // Generate table for printMode=false (normal view)
  if (!printMode) {
    // Include break and lunch slots for display
    const displayTimeSlots = timeSlots;
    
    // Generate table rows based on time slots
    const tableRows = displayTimeSlots.map(timeSlot => (
      <TableRow key={timeSlot}>
        <TableCell className="border p-2 text-xs bg-gray-50 font-medium">
          {timeSlot}
        </TableCell>
        {days.map(day => {
          const rowSpan = getCellRowSpan(day, timeSlot);
          
          if (rowSpan === 0 || !shouldRenderCell(day, timeSlot)) {
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
  
  // Generate printable table that includes breaks and lunch
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
                let content = '';
                let teacher = '';
                
                // Special handling for breaks and lunch
                if (timeSlot === '11:10-11:20') {
                  content = 'Break';
                } else if (timeSlot === '1:00-2:00') {
                  content = 'Lunch';
                } else {
                  // Regular slot handling
                  const entry = getActualEntry(day, timeSlot);
                  
                  if (entry) {
                    if (entry.subjectName) {
                      content = entry.subjectName;
                      teacher = entry.teacherName || '';
                    } else if (entry.isFree && entry.freeType) {
                      content = entry.freeType;
                    }
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
