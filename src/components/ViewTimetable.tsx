
import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTimetableById } from '@/utils/timetableUtils';
import TimetableView from './TimetableView';
import { useAuth } from '@/contexts/AuthContext';
import TimetableNotFound from './timetable/TimetableNotFound';
import TimetableActions from './timetable/TimetableActions';
import TimetableHeaderInfo from './timetable/TimetableHeaderInfo';
import TimetableFacultyDetails from './timetable/TimetableFacultyDetails';

/**
 * ViewTimetable Component
 * 
 * This component serves as the main container for displaying a complete timetable.
 * It coordinates multiple sub-components to create a cohesive timetable view including:
 * - Action buttons (back, edit, print)
 * - Timetable header information (class, department, dates)
 * - The actual timetable grid
 * - Faculty details section
 * 
 * The component handles fetching the timetable data based on the URL parameter
 * and provides appropriate UI for both successful retrieval and not-found cases.
 */
const ViewTimetable: React.FC = () => {
  // Get timetable ID from URL parameters
  const { id } = useParams<{ id: string }>();
  // Get current user role and username for permission-based UI
  const { userRole, username } = useAuth();
  // Reference to the printable content for PDF export
  const printRef = useRef<HTMLDivElement>(null);
  
  // Fetch the timetable data using the ID from URL
  const timetable = id ? getTimetableById(id) : null;
  
  // Show not found component if timetable doesn't exist
  if (!timetable) {
    return <TimetableNotFound />;
  }

  // If user is a faculty, filter timetable to only show their classes
  const shouldFilterForFaculty = userRole === 'faculty' && username;
  const facultyFilter = shouldFilterForFaculty ? username : undefined;
  
  return (
    <div className="space-y-6 text-left">
      {/* Action buttons for navigation, editing and printing */}
      <TimetableActions 
        timetable={timetable}
        printRef={printRef}
        userRole={userRole}
        timetableId={id}
      />
      
      {/* Main timetable content container (referenced for printing) */}
      <div className="border rounded-lg p-6 bg-white print:border-none" ref={printRef}>
        {/* Header with class, department and date information */}
        <div className="mb-6">
          <TimetableHeaderInfo timetable={timetable} />
        </div>
        
        {/* The actual timetable grid display */}
        <TimetableView 
          timetable={timetable} 
          printMode={false}
          facultyFilter={facultyFilter}
        />

        {/* Faculty details shown in both print and normal view */}
        <TimetableFacultyDetails 
          timetable={timetable} 
          printMode={false} 
          facultyFilter={facultyFilter}
        />
      </div>
    </div>
  );
};

export default ViewTimetable;
