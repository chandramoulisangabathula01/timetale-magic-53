
# College Timetable Management System Documentation

## Introduction

The College Timetable Management System is a comprehensive web application designed to create and manage academic timetables for educational institutions. This system simplifies the complex task of scheduling classes, assigning faculty, and managing academic resources across multiple departments and years.

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [User Roles](#user-roles)
4. [System Modules](#system-modules)
5. [Timetable Management](#timetable-management)
6. [Database Structure](#database-structure)
7. [Process Flow](#process-flow)
8. [Installation and Setup](#installation-and-setup)
9. [Screenshots](#screenshots)

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

## Conclusion

The College Timetable Management System provides a comprehensive solution for educational institutions to efficiently manage their class scheduling needs. With its user-friendly interface and powerful features, it significantly reduces the time and effort required for timetable creation while ensuring conflict-free schedules.

## Acknowledgements

This project was developed using React, Tailwind CSS, and Shadcn UI, with special thanks to the open source community for their valuable contributions to the libraries and tools used in this project.
