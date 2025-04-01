
# Multiple Lab Faculty Implementation

This document provides instructions for implementing the multiple faculty members for lab sessions feature.

## Overview

Since we cannot directly modify some core components due to them being read-only, we've created patch files with instructions on how to integrate this feature. The implementation allows assigning up to two faculty members to lab sessions, while maintaining backward compatibility.

## Key Components Created

1. `facultyLabUtils.ts` - Utility functions for handling multiple faculty members
2. `MultiTeacherDisplay.tsx` - Component to display multiple teachers in the timetable
3. `LabFacultySelector.tsx` - Component for selecting multiple faculty members

## Integration Steps for Admin

1. **Types**: The types.ts file has been updated to support multiple faculty members with the new `teacherNames` array field.

2. **CreateTimetableForm**: Follow the instructions in `CreateTimetableFormPatch.tsx` to update the form to support multiple faculty selection.

3. **TimetableView**: Follow the instructions in `TimetableViewPatch.tsx` to update the timetable display to show multiple faculty members.

4. **TimetableUtils**: Follow the instructions in `timetableUtilsPatch.ts` to update the timetable generation logic.

5. **ManualSchedulingGrid**: Follow the instructions in `ManualSchedulingGridPatch.tsx` to update the manual scheduling interface.

## Testing the Implementation

After integrating all components:

1. Create a new timetable with a lab that has two faculty members
2. Verify that both faculty names appear in the timetable
3. Test the manual scheduling interface to ensure it supports multiple faculty selection
4. View the timetable in faculty view to ensure both faculty members can see their assigned labs

## Backwards Compatibility

The implementation maintains backward compatibility by:

- Keeping the `teacherName` field for single faculty entries
- Adding a new `teacherNames` array field for multiple faculty entries
- Converting between formats as needed using utility functions

This ensures that existing timetables will continue to work correctly while supporting the new feature.
