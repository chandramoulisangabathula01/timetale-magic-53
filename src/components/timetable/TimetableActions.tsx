
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from 'lucide-react';
import TimetablePDFExport from './TimetablePDFExport';
import { Timetable } from '@/utils/types';
import { UserRole } from '@/utils/types';

/**
 * Interface defining the props required by the TimetableActions component
 * @property {Timetable} timetable - The timetable data to be displayed and exported
 * @property {React.RefObject<HTMLDivElement>} printRef - Reference to the printable timetable content
 * @property {UserRole} userRole - Optional user role to determine edit permissions
 * @property {string} timetableId - Optional ID of the timetable for edit navigation
 */
interface TimetableActionsProps {
  timetable: Timetable;
  printRef: React.RefObject<HTMLDivElement>;
  userRole?: UserRole;
  timetableId?: string;
}

/**
 * TimetableActions Component
 * 
 * This component renders action buttons for timetable operations including:
 * - Navigation back to dashboard
 * - Edit button (only visible to admin users)
 * - Print/Export functionality
 * 
 * The component is typically displayed at the top of the timetable view page
 * and provides contextual actions based on user role.
 */
const TimetableActions: React.FC<TimetableActionsProps> = ({ 
  timetable, 
  printRef, 
  userRole,
  timetableId 
}) => {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  
  /**
   * Handler for the back button click
   * Navigates user back to the dashboard page
   */
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  /**
   * Handler for the edit button click
   * Navigates to the edit page for the current timetable
   * Only proceeds if timetableId is available
   */
  const handleEdit = () => {
    if (timetableId) {
      navigate(`/edit-timetable/${timetableId}`);
    }
  };
  
  return (
    <div className="flex justify-between  items-center">
      {/* Left side - Back button and title */}
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
        <h1 className="text-lg bg-white rounded-xl p-1 font-bold">View Timetable</h1>
      </div>
      
      {/* Right side - Edit button (admin only) and PDF export */}
      <div className="flex items-center gap-2 print:hidden">
        {/* Conditional rendering of Edit button based on user role */}
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
        {/* PDF Export component with timetable data and print reference */}
        <TimetablePDFExport timetable={timetable} printRef={printRef} />
      </div>
    </div>
  );
};

export default TimetableActions;
