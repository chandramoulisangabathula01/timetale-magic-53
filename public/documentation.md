
# College Timetable Management System - Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [User Roles](#user-roles)
5. [System Architecture](#system-architecture)
6. [Core Components](#core-components)
7. [Workflows](#workflows)
8. [Data Models](#data-models)
9. [Future Enhancements](#future-enhancements)

## Introduction

The College Timetable Management System is a comprehensive web application designed to simplify the process of creating, managing, and viewing academic timetables for educational institutions. This system allows administrators to generate timetables automatically or manually for different academic years, branches, and semesters, while providing faculty and students with personalized views of their schedules.

## Tech Stack

The application is built using modern web technologies:

- **Frontend Framework**: React with TypeScript
- **State Management**: React Context API and React Query
- **Routing**: React Router
- **UI Component Library**: Shadcn UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Persistence**: Browser LocalStorage
- **Build Tool**: Vite

## Features

### For Administrators

- **Timetable Creation**: Generate timetables automatically or manually for different academic years, branches, and semesters
- **Faculty Management**: Add, edit, and manage faculty members and their teaching assignments
- **Subject Management**: Maintain a database of subjects with their details
- **Conflict Detection**: Prevent scheduling conflicts for faculty members
- **PDF Export**: Export timetables as PDF documents
- **Admin Settings**: Update admin credentials

### For Faculty Members

- **Personalized Schedule**: View only the classes they are teaching
- **Multi-timetable View**: Access all timetables where they're assigned
- **PDF Export**: Download their teaching schedule

### For Students

- **Class Timetable**: View the timetable for their specific year, branch, and semester
- **PDF Export**: Download their class timetable

## User Roles

The system supports three types of users:

1. **Administrator**: Has full access to create, edit, and manage all aspects of the timetable system
2. **Faculty**: Can view their teaching schedule across multiple classes
3. **Student**: Can view the timetable for their specific class

## System Architecture

The application follows a component-based architecture with clear separation of concerns:

- **Pages**: Main views of the application (Dashboard, Create Timetable, etc.)
- **Components**: Reusable UI elements
- **Utils**: Utility functions for data manipulation and business logic
- **Contexts**: Global state management
- **Hooks**: Custom React hooks

## Core Components

### Timetable Generation Engine

The timetable generation engine is the heart of the system, responsible for automatically creating timetables based on input parameters. The algorithm:

1. Takes course details, faculty assignments, and constraints as input
2. Creates a schedule grid for the week
3. Allocates labs in continuous time slots
4. Distributes regular subjects throughout the week
5. Handles faculty availability to prevent conflicts
6. Adds breaks and free periods

Key files:
- `src/utils/timetableUtils.ts`: Contains the timetable generation logic
- `src/components/CreateTimetableForm.tsx`: User interface for timetable creation

### Manual Scheduling Grid

For fine-grained control, the system allows administrators to manually design timetables:

1. Drag-and-drop interface for subjects
2. Real-time conflict detection
3. Support for lab sessions spanning multiple periods

Key files:
- `src/components/ManualSchedulingGrid.tsx`: The interactive scheduling interface

### Timetable View

A versatile component that renders the timetable in different formats:

1. Regular view for normal usage
2. Faculty-filtered view that shows only a specific faculty's classes
3. Print-optimized view for PDF export

Key files:
- `src/components/TimetableView.tsx`: The main timetable rendering component

## Workflows

### Creating a New Timetable

1. Administrator logs in
2. Navigates to "Create Timetable"
3. Enters timetable details (year, branch, semester, etc.)
4. Adds subject-teacher pairs
5. Configures free hours and day options
6. Chooses automatic generation or manual scheduling
7. Reviews and finalizes the timetable

### Viewing Faculty Schedule

1. Faculty member logs in
2. Automatically redirected to their dashboard
3. Views their teaching schedule across all classes
4. Can select different timetables if teaching multiple classes
5. Can download their schedule as PDF

### Viewing Student Timetable

1. Student logs in
2. Automatically redirected to their dashboard
3. Views the timetable for their class
4. Can download the timetable as PDF

## Data Models

The system uses several key data structures:

### Timetable

```typescript
interface Timetable {
  id: string;
  formData: TimetableFormData;
  entries: TimetableEntry[];
  createdAt: string;
}
```

### TimetableEntry

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

### Faculty

```typescript
interface Faculty {
  id: string;
  name: string;
  shortName: string;
  department: string;
  designation: string;
  email: string;
  subjects: string[];
}
```

### Subject

```typescript
interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  isLab: boolean;
  years: YearType[];
  branches: BranchType[];
}
```

## Future Enhancements

Potential areas for future development:

1. **Server-Side Database**: Move from localStorage to a proper database system
2. **Authentication System**: Implement a robust authentication system with password reset
3. **Notification System**: Alert faculty and students about timetable changes
4. **Room Allocation**: Add classroom management and intelligent room allocation
5. **Conflict Resolution**: Add AI-based suggestions for resolving timetable conflicts
6. **Mobile App**: Develop a mobile application for easier access
7. **Calendar Integration**: Allow users to sync timetables with their calendar applications
