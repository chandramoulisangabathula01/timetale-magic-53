
import { getShortName } from '../utils/timetableSystemPatch';
import { formatDateToDDMMYYYY } from '../components/timetable/TimetableHeaderInfoDateFix';
import { morningLabTimeSlots, afternoonLabTimeSlots } from '../utils/labTimeSlotFix';
import { TimeSlot, Day, TimetableEntry } from '../utils/types';

// Integration functions to patch the existing system

// Function to patch the timetable view with short names
export const patchTimetableViewWithShortNames = () => {
  // This function will be called from the existing TimetableView component
  // to modify how teacher names are displayed in cells
  return {
    getShortName
  };
};

// Function to patch the date formatting in the header
export const patchDateFormatting = () => {
  return {
    formatDate: formatDateToDDMMYYYY
  };
};

// Function to patch the lab allocation logic
export const patchLabAllocation = () => {
  return {
    morningLabTimeSlots,
    afternoonLabTimeSlots,
    // Function to check if a time slot is part of a lab block
    isLabTimeSlot: (timeSlot: TimeSlot): boolean => {
      return morningLabTimeSlots.includes(timeSlot) || afternoonLabTimeSlots.includes(timeSlot);
    },
    // Function to get the corresponding lab block for a time slot
    getLabBlockForTimeSlot: (timeSlot: TimeSlot): TimeSlot[] => {
      if (morningLabTimeSlots.includes(timeSlot)) {
        return morningLabTimeSlots;
      }
      if (afternoonLabTimeSlots.includes(timeSlot)) {
        return afternoonLabTimeSlots;
      }
      return [];
    }
  };
};

// Function to determine if an entry should be processed as a lab
export const shouldProcessAsLab = (
  entries: TimetableEntry[],
  day: Day,
  timeSlot: TimeSlot
): boolean => {
  // Check if this time slot is part of a lab block
  const isLabSlot = patchLabAllocation().isLabTimeSlot(timeSlot);
  if (!isLabSlot) return false;
  
  // Get the lab block for this time slot
  const labBlock = patchLabAllocation().getLabBlockForTimeSlot(timeSlot);
  
  // Check if any entry in this lab block is marked as a lab
  return labBlock.some(slot => 
    entries.some(entry => 
      entry.day === day && 
      entry.timeSlot === slot && 
      entry.isLab
    )
  );
};
