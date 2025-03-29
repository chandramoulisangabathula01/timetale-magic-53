
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
  
  // Helper function to get cell content for a specific day and time slot
  const getCellContent = (day: Day, timeSlot: TimeSlot) => {
    const entry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    
    if (!entry) return null;
    
    if (entry.isBreak) {
      return <div className="text-sm italic">Break</div>;
    }
    
    if (entry.isLunch) {
      return <div className="text-sm italic">Lunch</div>;
    }
    
    if (entry.isFree && entry.freeType) {
      return <div className="text-sm italic">{entry.freeType}</div>;
    }
    
    if (entry.subjectName && entry.teacherName) {
      return (
        <div className={`text-sm ${entry.isLab ? 'font-medium' : ''}`}>
          <div>{entry.subjectName}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {entry.teacherName}
            {entry.batchNumber && ` (${entry.batchNumber})`}
          </div>
        </div>
      );
    }
    
    return <div className="text-sm text-muted-foreground">-</div>;
  };
  
  // Helper function to get cell class for styling
  const getCellClass = (day: Day, timeSlot: TimeSlot) => {
    const entry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    
    if (!entry) return "";
    
    if (entry.isBreak) return "bg-gray-100 break-slot";
    if (entry.isLunch) return "bg-gray-100 lunch-slot";
    if (entry.isFree) return "bg-blue-50 free-slot";
    if (entry.isLab) return "bg-green-50 lab-slot";
    if (entry.subjectName) return "bg-white";
    
    return "";
  };
  
  return (
    <div className={printMode ? "print-timetable" : ""}>
      <div className="overflow-x-auto timetable-container">
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead className="border p-2 bg-gray-50 font-bold">Time / Day</TableHead>
              {days.map(day => (
                <TableHead key={day} className="border p-2 bg-gray-50 font-bold">{day}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlots.map(timeSlot => (
              <TableRow key={timeSlot}>
                <TableCell className="border p-2 text-xs bg-gray-50 font-medium">{timeSlot}</TableCell>
                {days.map(day => (
                  <TableCell 
                    key={`${day}-${timeSlot}`} 
                    className={`border p-2 ${getCellClass(day, timeSlot)}`}
                  >
                    {getCellContent(day, timeSlot)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
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
};

export default TimetableView;
