
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Calendar, FileDown, ArrowLeft, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTimetableById } from '@/utils/timetableUtils';
import TimetableView from './TimetableView';
import { useAuth } from '@/contexts/AuthContext';

const ViewTimetable: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const { userRole } = useAuth();
  
  const timetable = id ? getTimetableById(id) : null;
  
  const handleDownloadPDF = () => {
    // This is a placeholder - in a real app, this would trigger PDF generation
    window.print();
  };
  
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  const handleEdit = () => {
    if (id) {
      navigate(`/edit-timetable/${id}`);
    }
  };
  
  if (!timetable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Calendar className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Timetable Not Found</h2>
        <p className="text-muted-foreground">
          The timetable you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={handleBack}>Go Back to Dashboard</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">View Timetable</h1>
        </div>
        
        <div className="flex items-center gap-2">
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
          <Button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1"
          >
            <FileDown className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg p-6 print:border-none">
        <div className="mb-6 print:mb-8">
          <h2 className="font-bold text-center text-xl mb-1">College of Engineering</h2>
          <h3 className="font-bold text-center text-lg">
            {timetable.formData.courseName} - {timetable.formData.year} - {timetable.formData.branch} - Semester {timetable.formData.semester}
          </h3>
          <p className="text-center text-sm text-muted-foreground">
            Academic Year: {timetable.formData.academicYear} | Room: {timetable.formData.roomNumber}
          </p>
          <p className="text-center text-sm mt-2">
            Class Incharge: <span className="font-medium">{timetable.formData.classInchargeName}</span> | Contact: {timetable.formData.mobileNumber}
          </p>
        </div>
        
        <TimetableView 
          timetable={timetable} 
        />
      </div>
    </div>
  );
};

export default ViewTimetable;
