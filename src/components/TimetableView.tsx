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
  
  const filteredEntries = facultyFilter
    ? timetable.entries.map(entry => {
        if (entry.teacherName === facultyFilter || 
            entry.batch1Teacher === facultyFilter || 
            entry.batch2Teacher === facultyFilter) {
          return entry;
        } else {
          if (entry.isBreak || entry.isLunch) {
            return entry;
          }
          return {
            ...entry,
            subjectName: undefined,
            teacherName: undefined,
            isLab: undefined,
            isFree: undefined,
            freeType: undefined,
            isBatchRotationLab: undefined,
            batch1Subject: undefined,
            batch1Teacher: undefined,
            batch2Subject: undefined,
            batch2Teacher: undefined
          };
        }
      })
    : timetable.entries;
  
  const subjectTeacherList = timetable.formData.subjectTeacherPairs.filter(pair => {
    if (!facultyFilter || pair.teacherName === facultyFilter) {
      return true;
    }
    return false;
  });
  
  const isLabGroup = (day: Day, timeSlot: TimeSlot) => {
    const entry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    return entry?.isLabGroup && entry?.labGroupId;
  };
  
  const getLabGroupEntries = (labGroupId: string) => {
    return filteredEntries.filter(entry => entry.labGroupId === labGroupId);
  };
  
  const getActualEntry = (day: Day, timeSlot: TimeSlot) => {
    const directEntry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    
    if (directEntry) return directEntry;
    
    const possibleLabEntry = filteredEntries.find(e => 
      e.day === day && 
      e.isLabGroup && 
      e.labGroupId && 
      getLabGroupEntries(e.labGroupId).some(labEntry => labEntry.timeSlot === timeSlot)
    );
    
    return possibleLabEntry;
  };
  
  const getCellContent = (day: Day, timeSlot: TimeSlot) => {
    if (timeSlot === '11:10-11:20') {
      return <div className="text-sm italic text-center">Break</div>;
    }
    
    if (timeSlot === '1:00-2:00') {
      return <div className="text-sm italic text-center">Lunch</div>;
    }
    
    const entry = getActualEntry(day, timeSlot);
    
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
    
    if (entry.isBatchRotationLab) {
      return (
        <div className="font-medium text-center">
          <div className="text-xs">
            &#8592;--- {entry.batch1Subject} (B1 - {entry.batch1Teacher}) / {entry.batch2Subject} (B2 - {entry.batch2Teacher}) ---&#8594;
          </div>
        </div>
      );
    }
    
    if (entry.subjectName && entry.teacherName) {
      if (entry.isLab && entry.isLabGroup && entry.labGroupId) {
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
  
  const getCellClass = (day: Day, timeSlot: TimeSlot) => {
    if (timeSlot === '11:10-11:20' || timeSlot === '1:00-2:00') {
      return "bg-gray-100 break-slot";
    }
    
    const entry = getActualEntry(day, timeSlot);
    
    if (!entry) return "";
    
    if (entry.isBreak) return "bg-gray-100 break-slot";
    if (entry.isLunch) return "bg-gray-100 lunch-slot";
    if (entry.isFree) return "bg-blue-50 free-slot";
    
    if (entry.isBatchRotationLab) {
      return "bg-green-50 lab-slot";
    }
    
    if (entry.isLab) {
      return "bg-green-50 lab-slot";
    }
    
    if (entry.subjectName) return "bg-white";
    
    return "";
  };
  
  const getCellRowSpan = (day: Day, timeSlot: TimeSlot) => {
    if (timeSlot === '11:10-11:20' || timeSlot === '1:00-2:00') {
      return 1;
    }
    
    const entry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    
    if (!entry || !entry.isLabGroup || !entry.labGroupId) return 1;
    
    if (entry.isBatchRotationLab) {
      if (timeSlot === '10:20-11:10') return 2;
      if (timeSlot === '2:00-2:50') return 3;
      return 1;
    }
    
    const labGroupEntries = getLabGroupEntries(entry.labGroupId);
    
    let consecutiveSlots = 0;
    let slotIndex = timeSlots.indexOf(timeSlot);
    
    while (slotIndex < timeSlots.length) {
      const currentSlot = timeSlots[slotIndex];
      
      if (currentSlot === '11:10-11:20' || currentSlot === '1:00-2:00') {
        slotIndex++;
        continue;
      }
      
      const isPartOfGroup = labGroupEntries.some(e => e.timeSlot === currentSlot);
      
      if (!isPartOfGroup) break;
      
      consecutiveSlots++;
      slotIndex++;
      
      if (slotIndex < timeSlots.length && 
          (timeSlots[slotIndex] === '11:10-11:20' || timeSlots[slotIndex] === '1:00-2:00')) {
        break;
      }
    }
    
    return consecutiveSlots;
  };
  
  const shouldRenderCell = (day: Day, timeSlot: TimeSlot) => {
    if (timeSlot === '11:10-11:20' || timeSlot === '1:00-2:00') {
      return true;
    }
    
    const entry = filteredEntries.find(e => e.day === day && e.timeSlot === timeSlot);
    
    if (!entry || !entry.isLabGroup || !entry.labGroupId) return true;
    
    if (entry.isBatchRotationLab) {
      if (timeSlot === '10:20-11:10') return true;
      if (timeSlot === '11:20-12:10' || timeSlot === '12:10-1:00') return false;
      
      if (timeSlot === '2:00-2:50') return true;
      if (timeSlot === '2:50-3:40' || timeSlot === '3:40-4:30') return false;
      
      return true;
    }
    
    const slotIndex = timeSlots.indexOf(timeSlot);
    if (slotIndex === 0) return true;
    
    const prevSlot = timeSlots[slotIndex - 1];
    if (prevSlot === '11:10-11:20' || prevSlot === '1:00-2:00') {
      return true;
    }
    
    const prevEntry = filteredEntries.find(e => 
      e.day === day && 
      e.timeSlot === prevSlot && 
      e.labGroupId === entry.labGroupId
    );
    
    return !prevEntry;
  };
  
  const getPrintCellContent = (day: Day, timeSlot: TimeSlot) => {
    if (timeSlot === '11:10-11:20') {
      return { content: 'Break', teacher: '', batchInfo: '' };
    } else if (timeSlot === '1:00-2:00') {
      return { content: 'Lunch', teacher: '', batchInfo: '' };
    }
    
    const entry = getActualEntry(day, timeSlot);
    
    if (!entry) return { content: '', teacher: '', batchInfo: '' };
    
    if (entry.isBreak) {
      return { content: 'Break', teacher: '', batchInfo: '' };
    }
    
    if (entry.isLunch) {
      return { content: 'Lunch', teacher: '', batchInfo: '' };
    }
    
    if (entry.isFree && entry.freeType) {
      return { content: entry.freeType, teacher: '', batchInfo: '' };
    }
    
    if (entry.isBatchRotationLab) {
      return { 
        content: `${entry.batch1Subject} (B1) / ${entry.batch2Subject} (B2)`,
        teacher: `${entry.batch1Teacher} / ${entry.batch2Teacher}`,
        batchInfo: '' 
      };
    }
    
    if (entry.subjectName) {
      return { 
        content: entry.subjectName,
        teacher: entry.teacherName || '',
        batchInfo: entry.batchNumber || ''
      };
    }
    
    return { content: '', teacher: '', batchInfo: '' };
  };
  
  if (!printMode) {
    const displayTimeSlots = timeSlots;
    
    const tableRows = displayTimeSlots.map(timeSlot => (
      <TableRow key={timeSlot}>
        <TableCell className="border p-2 text-xs bg-gray-50 font-medium">
          {timeSlot}
        </TableCell>
        {days.map(day => {
          const rowSpan = getCellRowSpan(day, timeSlot);
          
          if (rowSpan === 0 || !shouldRenderCell(day, timeSlot)) {
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
  
  if (printMode) {
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
                  const { content, teacher, batchInfo } = getPrintCellContent(day, timeSlot);
                  
                  return (
                    <TableCell 
                      key={`${day}-${timeSlot}`} 
                      className={`border p-1 text-center ${getCellClass(day, timeSlot)}`}
                    >
                      {content && (
                        <>
                          <div className="font-medium text-sm">{content}</div>
                          {teacher && <div className="text-xs text-muted-foreground">{teacher}</div>}
                          {batchInfo && <div className="text-xs">({batchInfo})</div>}
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
  }
};

export default TimetableView;
