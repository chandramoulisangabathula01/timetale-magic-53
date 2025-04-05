
// This file will be imported in relevant components to apply the patches

import { getShortName } from './utils/timetableSystemPatch';
import { formatDateToDDMMYYYY } from './components/timetable/TimetableHeaderInfoDateFix';
import { 
  patchTimetableViewWithShortNames, 
  patchDateFormatting, 
  patchLabAllocation 
} from './integration/timetableIntegration';

// Export all the patches so they can be used by existing components
export {
  getShortName,
  formatDateToDDMMYYYY,
  patchTimetableViewWithShortNames,
  patchDateFormatting,
  patchLabAllocation
};

// Initialize the patches
const initializePatches = () => {
  console.log('Timetable system patches initialized');
  // This function will be called in the main.tsx file
};

export default initializePatches;
