
import React from 'react';
import { Timetable, TimetableEntry, Day, TimeSlot } from '@/utils/types';

interface TimetableViewProps {
  timetable: Timetable;
  facultyFilter?: string;
  printMode?: boolean;
}

const TimetableView: React.FC<TimetableViewProps> = ({ timetable, facultyFilter, printMode }) => {
  const days: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots: TimeSlot[] = [
    '9:30-10:20', 
    '10:20-11:10', 
    '11:10-11:20', // Break
    '11:20-12:10', 
    '12:10-1:00', 
    '1:00-2:00',   // Lunch
    '2:00-2:50', 
    '2:50-3:40', 
    '3:40-4:30'
  ];
  
  // Determine which days to show based on year and dayOptions
  let visibleDays: Day[];
  
  if (timetable.formData.year === '4th Year') {
    // For 4th year, use the selected day options
    visibleDays = timetable.formData.dayOptions.useCustomDays 
      ? timetable.formData.dayOptions.selectedDays
      : timetable.formData.dayOptions.fourContinuousDays 
        ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
        : days;
  } else {
    // For 1st to 3rd year, always use all 6 days
    visibleDays = days;
  }
  
  // Filter entries for faculty view if needed
  const entries = facultyFilter
    ? timetable.entries.filter(entry => entry.teacherName === facultyFilter)
    : timetable.entries;
  
  // Helper function to get entry for a specific day and time
  const getEntry = (day: Day, timeSlot: TimeSlot): TimetableEntry | undefined => {
    return entries.find(entry => entry.day === day && entry.timeSlot === timeSlot);
  };

  // Function to get lab entries by labGroupId
  const getLabEntries = (labGroupId: string): TimetableEntry[] => {
    return entries.filter(entry => entry.labGroupId === labGroupId);
  }
  
  // Function to render cell content
  const renderCellContent = (day: Day, timeSlot: TimeSlot) => {
    const entry = getEntry(day, timeSlot);
    
    if (!entry) return null;
    
    if (entry.isBreak) {
      return <div className="font-medium text-muted-foreground italic">Break</div>;
    }
    
    if (entry.isLunch) {
      return <div className="font-medium text-muted-foreground italic">Lunch</div>;
    }
    
    if (entry.isFree) {
      let freeType = entry.freeType;
      // Fix the customFreeType property access
      if (entry.freeType === 'Others' && entry.customFreeType) {
        freeType = entry.customFreeType;
      }
      return <div className="italic text-blue-600">{freeType}</div>;
    }
    
    // For lab rotation display (showing both lab options)
    if (entry.isLabGroup && entry.labGroupId) {
      const labEntries = getLabEntries(entry.labGroupId);
      
      if (labEntries.length > 0) {
        return (
          <div className="text-sm bg-green-50 p-1 rounded">
            {labEntries.map((lab, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <div className="my-1 border-t border-dashed" />}
                <div className="font-medium">{lab.subjectName}</div>
                <div className="text-xs text-muted-foreground">{lab.teacherName}</div>
                {lab.batchNumber && <div className="text-xs text-primary">({lab.batchNumber})</div>}
              </React.Fragment>
            ))}
          </div>
        );
      }
    }
    
    // For direct lab entries (non-grouped)
    if (entry.isLab) {
      return (
        <div className="text-sm bg-green-50 p-1 rounded">
          <div className="font-medium">{entry.subjectName}</div>
          <div className="text-xs text-muted-foreground">{entry.teacherName}</div>
          {entry.batchNumber && <div className="text-xs text-primary">({entry.batchNumber})</div>}
        </div>
      );
    }
    
    // For regular subjects
    if (entry.subjectName && entry.teacherName) {
      return (
        <div>
          <div className="font-medium">{entry.subjectName}</div>
          <div className="text-xs text-muted-foreground">{entry.teacherName}</div>
          {entry.batchNumber && (
            <div className="text-xs text-primary">({entry.batchNumber})</div>
          )}
        </div>
      );
    }
    
    // Empty cell
    return null;
  };
  
  // Debug function to check if there are lab entries
  const debugLabEntries = () => {
    const labEntries = entries.filter(entry => entry.isLab || entry.isLabGroup);
    console.log('Lab entries found:', labEntries.length, labEntries);
  };
  
  // Call the debug function
  React.useEffect(() => {
    debugLabEntries();
  }, [entries]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border">
        <thead>
          <tr className={`${printMode ? 'bg-gray-100' : 'bg-muted'}`}>
            <th className="border p-2 text-sm font-medium">Time / Day</th>
            {visibleDays.map(day => (
              <th key={day} className="border p-2 text-sm font-medium">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((timeSlot) => (
            <tr 
              key={timeSlot} 
              className={`
                ${timeSlot === '11:10-11:20' ? 'bg-gray-100' : ''} 
                ${timeSlot === '1:00-2:00' ? 'bg-gray-100' : ''}
              `}
            >
              <td className="border p-2 text-sm font-medium whitespace-nowrap">
                {timeSlot}
              </td>
              {visibleDays.map(day => {
                const entry = getEntry(day, timeSlot);
                
                return (
                  <td 
                    key={`${day}-${timeSlot}`} 
                    className={`
                      border p-2 text-center 
                      ${entry?.isLab ? 'bg-green-50' : ''}
                      ${entry?.isLabGroup ? 'bg-green-50' : ''}
                      ${entry?.isFree ? 'bg-blue-50' : ''}
                    `}
                  >
                    {renderCellContent(day, timeSlot)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableView;
