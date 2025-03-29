
import React, { useRef } from 'react';
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
  const printRef = useRef<HTMLDivElement>(null);
  
  const timetable = id ? getTimetableById(id) : null;
  
  const handleDownloadPDF = () => {
    const content = printRef.current;
    if (!content) return;
    
    // Create a new window for printing only the timetable
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Could not open print window. Please check your popup settings.",
        variant: "destructive"
      });
      return;
    }
    
    // Add necessary styles for a clean print layout
    printWindow.document.write(`
      <html>
        <head>
          <title>Timetable - ${timetable?.formData.year} ${timetable?.formData.branch}</title>
          <style>
            @page {
              size: landscape;
              margin: 1cm;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .break-slot, .lunch-slot {
              background-color: #f5f5f5;
              font-style: italic;
            }
            .free-slot {
              background-color: #e6f7ff;
            }
            .lab-slot {
              background-color: #e6ffe6;
              font-weight: 500;
            }
            .subject-list {
              margin-top: 20px;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
            }
            .subject-item {
              margin-bottom: 5px;
            }
            .print-button {
              display: block;
              margin: 20px auto;
              padding: 8px 16px;
              background-color: #4f46e5;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            @media print {
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h2 style="margin-bottom: 5px;">College of Engineering</h2>
            <h3 style="margin-top: 0; margin-bottom: 5px;">
              ${timetable?.formData.courseName} - ${timetable?.formData.year} - ${timetable?.formData.branch} - Semester ${timetable?.formData.semester}
            </h3>
            <p style="margin-top: 0; margin-bottom: 5px; font-size: 14px; color: #666;">
              Academic Year: ${timetable?.formData.academicYear} | Room: ${timetable?.formData.roomNumber}
            </p>
            <p style="margin-top: 0; font-size: 14px;">
              Class Incharge: <span style="font-weight: bold;">${timetable?.formData.classInchargeName}</span> | Contact: ${timetable?.formData.mobileNumber}
            </p>
          </div>
          ${content.innerHTML}
          <button class="print-button" onclick="window.print(); setTimeout(() => window.close(), 500);">
            Print Timetable
          </button>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Automatically trigger print after content is loaded
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
      }, 100);
    };
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
          <Button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1"
          >
            <FileDown className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg p-6 print:border-none" ref={printRef}>
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
          printMode={true}
        />
      </div>
    </div>
  );
};

export default ViewTimetable;
