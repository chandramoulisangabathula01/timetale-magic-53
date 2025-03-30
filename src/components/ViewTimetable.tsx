
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
          printMode={false}
        />

        {/* Always show faculty details in the timetable view */}
        <div className="mt-8">
          <h4 className="font-semibold mb-2">Faculty Details</h4>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {timetable.formData.subjectTeacherPairs.map((pair) => (
              <div key={pair.id} className="text-sm">
                <span className="font-medium">{pair.subjectName}</span>
                {pair.isLab && <span className="text-xs ml-1">(Lab)</span>}
                <span> - {pair.teacherName}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Include the TimetableFacultyDetails component for print mode only */}
        <TimetableFacultyDetails timetable={timetable} printMode={true} />
      </div>
    </div>
  );
};

export default ViewTimetable;
