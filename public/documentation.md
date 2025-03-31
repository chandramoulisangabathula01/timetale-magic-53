# College Timetable Management System Documentation

## Introduction

The College Timetable Management System is a comprehensive web application designed to create and manage academic timetables for educational institutions. This system simplifies the complex task of scheduling classes, assigning faculty, and managing academic resources across multiple departments and years.

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [User Roles](#user-roles)
4. [System Modules](#system-modules)
5. [Timetable Management](#timetable-management)
6. [Timetable Logic and Constraints](#timetable-logic-and-constraints)
7. [Database Structure](#database-structure)
8. [Process Flow](#process-flow)
9. [Installation and Setup](#installation-and-setup)
10. [Screenshots](#screenshots)
11. [Code Organization](#code-organization)

## Features

- **Automated Timetable Generation**: Generate complete timetables with a single click
- **Manual Scheduling**: Fine-tune timetables with a user-friendly interface
- **Lab Session Management**: Handle lab sessions that span multiple periods
- **Conflict Detection**: Automatically detect and prevent faculty scheduling conflicts
- **Multiple User Roles**: Admin, Faculty, and Student views with appropriate permissions
- **Free Period Management**: Designate slots for library, sports, projects, etc.
- **PDF Export**: Print or download timetables in PDF format from any dashboard
- **Faculty Workload Management**: Track and balance faculty workload
- **Multi-Department Support**: Create timetables for various departments and years
- **Custom Branch Management**: Create and assign custom branches for specialized departments
- **User-Friendly Interface**: Intuitive design with responsive layout

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Routing**: React Router
- **State Management**: React Hooks
- **Data Visualization**: Recharts
- **Build Tool**: Vite
- **Client-Side Storage**: localStorage for data persistence

## User Roles

### Admin
- Create, edit, and delete timetables
- Manage faculty and subjects, including custom branches
- Override scheduling conflicts
- Update admin credentials
- View all timetables

### Faculty
- View assigned classes and schedules
- View personal timetable filtered by faculty name
- Print personalized timetable with clean formatting

### Student
- View class timetable based on year, branch, and semester
- Print class timetable with appropriate formatting

## System Modules

### Authentication System
The system uses a role-based authentication system with three distinct user types: admin, faculty, and student. Authentication data is stored in the browser's localStorage for persistent sessions.

```typescript
// Sample authentication context structure
{
  isAuthenticated: boolean;
  userRole: 'admin' | 'faculty' | 'student';
  username: string;
  studentFilters?: {
    year: string;
    branch: string;
    semester: string;
  }
}
```

### Admin Dashboard
The admin dashboard provides access to all administrative functions:
- Create new timetables
- View and edit existing timetables
- Manage faculty and subjects
- Access admin settings

### Faculty Management
Administrators can add, edit, and delete faculty records, including:
- Name and department
- Contact information
- Assigned subjects
- Faculty expertise

### Subject Management
The subject management module allows administrators to:
- Add new subjects with credit hours
- Assign subjects to specific years and branches, including custom branches
- Mark subjects as theory or lab
- Map subjects to qualified faculty members

### Timetable Creator
The timetable creator is the core functionality of the system with features like:
- Year, branch, and semester selection
- Room assignment
- Class incharge designation
- Subject-teacher mapping
- Free period configuration
- Day selection for 4th year (4/6 day options)

## Timetable Management

### Automatic Generation
The system can automatically generate a complete timetable following these rules:
- Each subject gets appropriate time allocation
- Lab sessions are allocated in continuous blocks
- Faculty conflicts are prevented
- Free periods are distributed appropriately
- Breaks and lunch periods are scheduled

### Manual Scheduling
For fine-tuning, the system provides a grid interface where administrators can:
- Drag and drop subjects into time slots
- Assign free periods (library, sports, etc.)
- Manually resolve conflicts
- Clear individual slots

### Printing and Exporting
Each user role has access to specialized printing functionality:
- Faculty can print their personalized teaching schedule
- Students can print their class timetable
- Admins can print any timetable with complete details
- All printed timetables are formatted for clean and professional presentation

## Timetable Logic and Constraints

### Core Scheduling Constraints

1. **No Scheduling Conflicts**:
   - A faculty member cannot be assigned to two different classes at the same time
   - Implementation: `isTeacherAvailable()` function in `timetableUtils.ts` checks for conflicts

2. **Lab Session Rules**:
   - Labs require continuous time blocks (e.g., 9:30-1:00 or 2:00-4:30)
   - Labs are prioritized in scheduling before regular classes
   - Implementation: Labs are scheduled first in the `generateTimetable()` function

3. **Batch Rotation for Labs**:
   - When enabled, lab sessions are rotated between batches (B1 and B2)
   - Each batch gets a different lab on the same day
   - Implementation: `batchGroups` handling in `generateTimetable()`

4. **Time Slot Restrictions**:
   - Fixed break time (11:10-11:20) and lunch period (1:00-2:00)
   - Cannot schedule classes during these periods
   - Implementation: These slots are pre-allocated in the timetable generation

5. **4th Year Special Handling**:
   - 4th year timetables can use either 4 days or 6 days per week
   - Custom day selection is available
   - Implementation: `visibleDays` logic in `TimetableView.tsx`

### Lab Rendering Logic

Labs are rendered in the timetable using specialized logic:

1. **Lab Group Detection**:
   - Labs are grouped by `labGroupId` for batch rotation
   - Function: `getLabEntries()` in `TimetableView.tsx`

2. **Multi-slot Lab Display**:
   - Labs spanning multiple time slots (9:30-1:00 or 2:00-4:30)
   - Function: `getLabsForTimeSlot()` in `TimetableView.tsx`

3. **Batch Information Display**:
   - Rendering of batch numbers (B1/B2) for lab sessions
   - Implementation: Conditional rendering in `renderCellContent()`

### Free Period Allocation

1. **Free Period Types**:
   - Library, Sports, Project, Others (with custom text)
   - Implementation: Free periods are allocated after regular subjects

2. **Distribution Logic**:
   - Free periods are allocated to remaining empty slots
   - Random selection from available free hour types
   - Implementation: Final phase of `generateTimetable()`

## Database Structure

The system uses localStorage for data persistence with the following key structures:

### Timetables
```typescript
interface Timetable {
  id: string;
  formData: TimetableFormData;
  entries: TimetableEntry[];
  createdAt: string;
}
```

### Subject-Teacher Pairs
```typescript
interface SubjectTeacherPair {
  id: string;
  subjectName: string;
  teacherName: string;
  isLab: boolean;
  batchNumber?: string;
}
```

### Timetable Entries
```typescript
interface TimetableEntry {
  day: Day;
  timeSlot: TimeSlot;
  subjectName?: string;
  teacherName?: string;
  isLab?: boolean;
  batchNumber?: string;
  isFree?: boolean;
  freeType?: string;
  isBreak?: boolean;
  isLunch?: boolean;
  isLabGroup?: boolean;
  labGroupId?: string;
}
```

## Process Flow

1. **Admin Login**: Administrator logs in with credentials
2. **Create Timetable**: Admin initiates timetable creation
3. **Basic Information**: Add timetable metadata (year, branch, etc.)
4. **Subject-Teacher Mapping**: Assign teachers to subjects
5. **Free Hour Configuration**: Set up free periods
6. **Generate/Schedule**: Either auto-generate or manually schedule
7. **Review and Adjust**: Fine-tune the timetable as needed
8. **Save Timetable**: Store the completed timetable
9. **Student/Faculty Access**: Users can view and print relevant timetables

## Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/college-timetable-system.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the application at `http://localhost:5173`

5. Default admin credentials:
   - Username: admin
   - Password: admin123

## Screenshots

### Login Page
![Login Page](/documentation-images/login.png)

### Admin Dashboard
![Admin Dashboard](/documentation-images/admin-dashboard.png)

### Create Timetable
![Create Timetable](/documentation-images/create-timetable.png)

### Manual Scheduling
![Manual Scheduling](/documentation-images/manual-scheduling.png)

### View Timetable
![View Timetable](/documentation-images/view-timetable.png)

### Faculty View
![Faculty View](/documentation-images/faculty-view.png)

### Student View
![Student View](/documentation-images/student-view.png)

## Code Organization

### Core Files and Their Responsibilities

1. **Utility Files**:
   - `timetableUtils.ts`: Contains the core logic for timetable generation, manipulation, and retrieval
   - `types.ts`: Defines TypeScript interfaces and types used throughout the application

2. **View Components**:
   - `TimetableView.tsx`: Responsible for rendering the timetable grid with proper display of subjects, labs, and free periods
   - `ViewTimetable.tsx`: Container component that sets up timetable viewing with header information and actions

3. **Creation/Editing Components**:
   - `CreateTimetableForm.tsx`: Form for inputting timetable metadata and subject-teacher pairs
   - `ManualSchedulingGrid.tsx`: Grid interface for manual scheduling and adjustments

4. **Page Components**:
   - `CreateTimetable.tsx`: Page for creating new timetables
   - `EditTimetable.tsx`: Page for modifying existing timetables

### Key Logic Locations

1. **Timetable Generation Logic**:
   - File: `src/utils/timetableUtils.ts`
   - Function: `generateTimetable()`
   - Handles automatic generation of timetable entries based on form data

2. **Lab Session Logic**:
   - Batch rotation: `timetableUtils.ts` - handled in the middle section of `generateTimetable()`
   - Lab rendering: `TimetableView.tsx` - functions `getLabsForTimeSlot()` and `renderCellContent()`

3. **Conflict Prevention Logic**:
   - File: `src/utils/timetableUtils.ts`
   - Functions: `isTeacherAvailable()`, `isSlotAllocated()`, `isTeacherAllocated()`
   - Prevents double-booking faculty or rooms

4. **Free Period Logic**:
   - File: `src/utils/timetableUtils.ts`
   - Located in the final section of `generateTimetable()`
   - Allocates remaining slots as free periods

5. **UI Rendering Logic**:
   - File: `src/components/TimetableView.tsx`
   - Function: `renderCellContent()` 
   - Handles display of subjects, labs, free periods, breaks and lunch

### Constraint Implementation Details

1. **Lab Session Constraints**:
   - Labs are allocated first to ensure they get continuous time slots
   - Morning labs: 9:30-1:00
   - Afternoon labs: 2:00-4:30
   - Implementation: First major section in `generateTimetable()`

2. **Batch Rotation Constraints**:
   - Pairs of labs are created for B1 and B2 batches
   - Each pair is assigned to different days with rotation
   - Implementation: Batch rotation section in `generateTimetable()`

3. **Year-Specific Constraints**:
   - 4th year can have custom day selections
   - Implementation: Day selection in `TimetableView.tsx` and `timetableUtils.ts`

4. **Faculty Workload Constraints**:
   - Regular subjects are allocated 4 periods per week
   - Faculty conflicts are prevented through allocation tracking
   - Implementation: Non-lab subject allocation in `generateTimetable()`

## Conclusion

The College Timetable Management System provides a comprehensive solution for educational institutions to efficiently manage their class scheduling needs. With its user-friendly interface and powerful features, it significantly reduces the time and effort required for timetable creation while ensuring conflict-free schedules.

## Acknowledgements

This project was developed using React, Tailwind CSS, and Shadcn UI, with special thanks to the open source community for their valuable contributions to the libraries and tools used in this project.
