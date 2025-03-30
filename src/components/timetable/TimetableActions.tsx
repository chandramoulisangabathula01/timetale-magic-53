
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from 'lucide-react';
import TimetablePDFExport from './TimetablePDFExport';
import { Timetable } from '@/utils/types';
import { UserRole } from '@/utils/types';

interface TimetableActionsProps {
  timetable: Timetable;
  printRef: React.RefObject<HTMLDivElement>;
  userRole?: UserRole;
  timetableId?: string;
}

const TimetableActions: React.FC<TimetableActionsProps> = ({ 
  timetable, 
  printRef, 
  userRole,
  timetableId 
}) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  const handleEdit = () => {
    if (timetableId) {
      navigate(`/edit-timetable/${timetableId}`);
    }
  };
  
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBack}
          className="flex items-center gap-1 print:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">View Timetable</h1>
      </div>
      
      <div className="flex items-center gap-2 print:hidden">
        {userRole === 'admin' && (
          <Button 
            variant="outline" 
            onClick={handleEdit}
            className="flex items-center gap-1"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
        <TimetablePDFExport timetable={timetable} printRef={printRef} />
      </div>
    </div>
  );
};

export default TimetableActions;
