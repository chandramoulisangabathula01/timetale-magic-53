
import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTimetableById } from '@/utils/timetableUtils';
import TimetableView from './TimetableView';
import { useAuth } from '@/contexts/AuthContext';
import TimetableNotFound from './timetable/TimetableNotFound';
import TimetableActions from './timetable/TimetableActions';
import TimetableHeaderInfo from './timetable/TimetableHeaderInfo';
import TimetableFacultyDetails from './timetable/TimetableFacultyDetails';

const ViewTimetable: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userRole } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  
  const timetable = id ? getTimetableById(id) : null;
  
  if (!timetable) {
    return <TimetableNotFound />;
  }
  
  return (
    <div className="space-y-6">
      <TimetableActions 
        timetable={timetable}
        printRef={printRef}
        userRole={userRole}
        timetableId={id}
      />
      
      <div className="border rounded-lg p-6 print:border-none" ref={printRef}>
        <div className="mb-6">
          <TimetableHeaderInfo timetable={timetable} />
        </div>
        
        <TimetableView 
          timetable={timetable} 
          printMode={true}
        />

        <div className="mt-8">
          <TimetableFacultyDetails timetable={timetable} />
        </div>
      </div>
    </div>
  );
};

export default ViewTimetable;
