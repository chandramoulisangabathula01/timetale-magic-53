
# College Timetable Management System: Project Structure and Logic

This document provides an overview of the project structure, explaining where different functionalities live and how they work together.

## Core Logic Files

### 1. `src/utils/timetableUtils.ts`

The heart of the timetable generation logic. This file contains:

- **Timetable Generation Algorithm**: The core function `generateTimetable()` that creates a complete timetable based on form inputs
- **Batch Rotation Logic**: Handles alternating lab batches (B1/B2) between different days
- **Conflict Detection**: Prevents scheduling conflicts for faculty and rooms
- **Free Period Allocation**: Distributes free periods (library, sports, project, etc.)
- **Teacher Availability Checks**: Functions like `isTeacherAvailable()` to prevent double-booking

### 2. `src/utils/facultyUtils.ts` 

Manages faculty-related operations:

- **Faculty Data Management**: CRUD operations for faculty members
- **Faculty Filtering**: Functions to filter and search faculty members
- **Faculty Validation**: Validate faculty data before creation/update

### 3. `src/utils/facultyLabUtils.ts`

Handles lab-related faculty operations:

- **Teacher Names Formatting**: `formatTeacherNames()` for displaying single or multiple teachers
- **Lab Teacher Assignment**: Logic for mapping teachers to lab sessions
- **Teacher Group Management**: Functions for working with teacher groups

### 4. `src/utils/subjectsUtils.ts`

Contains subject-related functionality:

- **Subject Data Management**: CRUD operations for subjects
- **Subject Validation**: Validates subject data
- **Subject Filtering**: Functions to filter and search subjects

### 5. `src/utils/types.ts`

Defines TypeScript interfaces used throughout the application:

- **Timetable Types**: Interfaces for timetable data structures
- **Form Types**: Types for form data and validation
- **User Types**: Interfaces for user roles and authentication

## Component Structure

### Core Components

#### Timetable Display Components

1. **`src/components/TimetableView.tsx`**:
   - Main component for rendering the timetable grid
   - Handles various display modes (student, faculty, admin)
   - Contains logic for rendering lab sessions, breaks, and regular classes
   - Manages filtering and display options

2. **`src/components/timetable/TimetableHeaderInfo.tsx`**:
   - Renders timetable metadata (branch, year, semester, etc.)

3. **`src/components/timetable/TimetableFacultyDetails.tsx`**:
   - Displays faculty assignment details below the timetable

4. **`src/components/timetable/TimetableActions.tsx`**:
   - Action buttons for timetable operations (edit, delete, etc.)

5. **`src/components/timetable/TimetableDownloadButton.tsx`**:
   - PDF export functionality

6. **`src/components/MultiTeacherDisplay.tsx`**:
   - Specialized component for displaying multiple teachers for lab sessions

#### Timetable Creation Components

1. **`src/components/CreateTimetableForm.tsx`**:
   - Form for creating new timetables
   - Handles subject-teacher pairings
   - Collects metadata (year, branch, semester, etc.)

2. **`src/components/ManualSchedulingGrid.tsx`**:
   - Interactive grid for manual timetable adjustments
   - Drag and drop functionality for scheduling

3. **`src/components/LabFacultySelector.tsx`**:
   - Component for assigning multiple faculty to lab sessions

#### Dashboard Components

1. **`src/components/DashboardLayout.tsx`**:
   - Main layout component with sidebar navigation
   - Responsive design for mobile and desktop views

2. **`src/components/AdminDashboard.tsx`**:
   - Admin-specific dashboard with timetable management functions

3. **`src/components/FacultyDashboard.tsx`**:
   - Faculty view showing assigned classes

4. **`src/components/StudentDashboard.tsx`**:
   - Student view showing class timetables

### Page Components

These components assemble the various smaller components into complete pages:

1. **`src/pages/Dashboard.tsx`**:
   - Entry point that renders appropriate dashboard based on user role

2. **`src/pages/CreateTimetable.tsx`**:
   - Page for timetable creation

3. **`src/pages/EditTimetable.tsx`**:
   - Page for editing existing timetables

4. **`src/pages/ViewTimetablePage.tsx`**:
   - Page for viewing a complete timetable

5. **`src/pages/AdminSettingsPage.tsx`**:
   - Page for admin settings

## Authentication and User Management

1. **`src/contexts/AuthContext.tsx`**:
   - Manages authentication state
   - Provides user role information
   - Handles login, logout, and session management

## Data Flow for Timetable Generation

1. User inputs data in `CreateTimetableForm`
2. Form data is passed to `timetableUtils.ts` via the `generateTimetable()` function
3. Algorithm processes inputs and generates a set of timetable entries
4. Output is stored in localStorage and/or passed to `TimetableView` for display

## Mobile Responsiveness Implementation

The application has been made responsive with:

1. **Responsive Grid System**: Using Tailwind CSS's responsive prefixes (`sm:`, `md:`, `lg:`)
2. **Mobile-First Design**: Base styles for mobile with enhancements for larger screens
3. **Overflow Handling**: Horizontal scrolling for timetable on small screens
4. **Adaptive Font Sizes**: Smaller text on mobile screens
5. **Flexible Layouts**: Components adjust based on screen size
6. **Touch-Friendly Interfaces**: Larger hit areas on mobile

## Key UI Components from Shadcn UI

The application leverages several Shadcn UI components:

1. **Cards**: For info displays and form sections
2. **Buttons**: For actions and form submissions
3. **Dialogs**: For confirmations and alerts
4. **Forms**: For data input and validation
5. **Dropdowns**: For selection menus
6. **Sidebar**: For navigation
7. **Tabs**: For organizing content

## Print Mode

The application includes specialized printing functionality:

1. **CSS Print Styles**: Hide UI elements during printing
2. **Optimized Layout**: Adjusts for paper format
3. **Faculty Details Section**: Shows complete faculty assignments

## Performance Considerations

1. **Memoization**: Used in components like `TimetableView` for performance
2. **Lazy Loading**: Components loaded only when needed
3. **State Management**: Local React state for UI, localStorage for persistence

## Future Enhancement Areas

1. **Backend Integration**: Replacing localStorage with a proper database
2. **Advanced Conflict Resolution**: More sophisticated algorithms for handling scheduling conflicts
3. **Batch Scheduling**: Additional options for handling different batch configurations
4. **Analytics Dashboard**: Add reporting and visualization tools
5. **Calendar Integration**: Export to calendar apps (iCal, Google Calendar)
