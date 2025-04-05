
# Timetable Generator System - Project Structure

## Core Components and Logic

### Timetable Generation and Management
- **src/utils/timetableUtils.ts**: 
  - Core logic for generating and managing timetables
  - Functions for saving, retrieving, and filtering timetables
  - Lab scheduling and batch rotation implementation
  - Faculty subject assignment validation
  
- **src/utils/facultyWorkloadUtils.ts**: 
  - Handles faculty workload calculations
  - Tracks faculty subject assignments across all timetables
  - Enforces maximum subject assignment limit (3 subjects per faculty)

### Data Models
- **src/utils/types.ts**: 
  - TypeScript definitions for all data models
  - Timetable, Subject, Faculty, and related interfaces

### Faculty Management
- **src/utils/facultyUtils.ts**: 
  - Faculty data management functions
  - CRUD operations for faculty members

- **src/utils/facultyLabUtils.ts**: 
  - Helper functions for handling lab faculty
  - Formatting teacher names for display

### Subject Management
- **src/utils/subjectsUtils.ts**: 
  - Subject data management
  - Subject filtering based on year/branch

## User Interface Components

### Core Timetable Components
- **src/components/TimetableView.tsx**: Main timetable display
- **src/components/ViewTimetable.tsx**: Timetable viewing wrapper
- **src/components/timetable/TimetableFacultyDetails.tsx**: Faculty information section
- **src/components/timetable/TimetableHeaderInfo.tsx**: Timetable header section
- **src/components/timetable/TimetableActions.tsx**: Timetable action buttons
- **src/components/timetable/TimetableDownloadButton.tsx**: PDF export functionality

### Form Components
- **src/components/CreateTimetableForm.tsx**: Main form for timetable creation
- **src/components/ManualSchedulingGrid.tsx**: Manual timetable scheduling interface

### Faculty Workload Components
- **src/components/FacultyWorkloadView.tsx**: Shows faculty workload information
- **src/components/MultiTeacherDisplay.tsx**: Display for multiple teachers in labs

### Dashboard Components
- **src/components/AdminDashboard.tsx**: Admin dashboard view
- **src/components/FacultyDashboard.tsx**: Faculty dashboard view
- **src/components/StudentDashboard.tsx**: Student dashboard view
- **src/components/DashboardLayout.tsx**: Common layout for all dashboards

## Pages
- **src/pages/CreateTimetable.tsx**: Page for creating new timetables
- **src/pages/EditTimetable.tsx**: Page for editing existing timetables
- **src/pages/ViewTimetablePage.tsx**: Page for viewing a single timetable
- **src/pages/ManageFaculty.tsx**: Page for faculty management
- **src/pages/ManageSubjects.tsx**: Page for subject management
- **src/pages/Dashboard.tsx**: Main dashboard page
- **src/pages/Login.tsx**: Authentication page
- **src/pages/Index.tsx**: Home/landing page

## Key Logic & Workflows

### Timetable Generation Logic
1. User fills out the timetable form with academic details, subjects, and scheduling options
2. System validates inputs including faculty workload limits
3. Either auto-generates timetable or accepts manual input
4. Saves timetable to localStorage

### Faculty Subject Assignment Limit Logic
1. Each faculty can teach a maximum of 3 subjects across all timetables
2. When assigning subjects, system checks current workload
3. Prevents assignment if limit is reached
4. Provides workload visibility through FacultyWorkloadView component

### Batch Rotation for Labs
1. Lab subjects can be assigned to different batches (B1/B2)
2. System schedules rotating lab sessions across different days
3. Each batch gets exposure to all lab subjects through rotation

## Mobile Responsiveness
- All components use responsive Tailwind CSS classes
- Layout adjusts based on screen size with grid/flex containers
- Media queries ensure proper display on small screens
