
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
            .logo-container {
              text-align: center;
              margin-bottom: 10px;
            }
            .logo {
              width: 80px;
              height: 80px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #000;
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
            .details-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .faculty-details {
              margin-top: 20px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
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
            <div class="logo-container">
              <img src="/public/lovable-uploads/eb4f9a1c-adf2-4f9d-b5b7-86a8c285a2ec.png" class="logo" alt="College Logo">
            </div>
            <h2 style="margin-bottom: 5px;">University College of Engineering & Technology for Women</h2>
            <p style="margin-top: 0; margin-bottom: 10px;">Kakatiya University Campus, Warangal (T.S) - 506009</p>
            <h3 style="margin-top: 0; margin-bottom: 5px; text-decoration: underline;">
              ${timetable?.formData.courseName}.${timetable?.formData.branch} (${timetable?.formData.semester}) SEMESTER TIME TABLE STATEMENT ${timetable?.formData.academicYear}
            </h3>
            <p style="margin-top: 0; margin-bottom: 15px;">
              ${timetable?.formData.year} ${timetable?.formData.branch} - ${timetable?.formData.academicYear}
            </p>
          </div>

          <div class="details-row">
            <div><strong>Class In-Charge:</strong> ${timetable?.formData.classInchargeName}</div>
            <div><strong>Room No:</strong> ${timetable?.formData.roomNumber}</div>
          </div>
          <div class="details-row">
            <div><strong>Mobile Number:</strong> ${timetable?.formData.mobileNumber}</div>
            <div><strong>W.E.F:</strong> ${timetable?.formData.date || new Date().toISOString().split('T')[0]}</div>
          </div>

          ${content.innerHTML}
          
          <div class="faculty-details">
            <h3>FACULTY DETAILS:</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              ${timetable?.formData.subjectTeacherPairs.map(pair => `
                <div class="subject-item">
                  ${pair.subjectName} - ${pair.teacherName} ${pair.isLab ? '(Lab)' : ''}
                </div>
              `).join('')}
            </div>
          </div>
          
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
        <div className="print-only">
          <div className="flex justify-center mb-4">
            <img src="/public/lovable-uploads/eb4f9a1c-adf2-4f9d-b5b7-86a8c285a2ec.png" alt="College Logo" className="w-20 h-20" />
          </div>
          <h2 className="font-bold text-center text-xl mb-1">University College of Engineering & Technology for Women</h2>
          <p className="text-center text-sm mb-2">Kakatiya University Campus, Warangal (T.S) - 506009</p>
          <h3 className="font-bold text-center text-lg underline mb-2">
            {timetable.formData.courseName}.{timetable.formData.branch} ({timetable.formData.semester}) SEMESTER TIME TABLE STATEMENT {timetable.formData.academicYear}
          </h3>
          <p className="text-center text-sm mb-4">
            {timetable.formData.year} {timetable.formData.branch} - {timetable.formData.academicYear}
          </p>
          
          <div className="flex justify-between items-center mb-2 px-2">
            <div><span className="font-semibold">Class In-Charge:</span> {timetable.formData.classInchargeName}</div>
            <div><span className="font-semibold">Room No:</span> {timetable.formData.roomNumber}</div>
          </div>
          <div className="flex justify-between items-center mb-4 px-2">
            <div><span className="font-semibold">Mobile Number:</span> {timetable.formData.mobileNumber}</div>
            <div><span className="font-semibold">W.E.F:</span> {timetable.formData.date || new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>
        
        <div className="mb-6 no-print">
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

        <div className="print-only mt-6">
          <h3 className="font-bold text-lg mb-2">FACULTY DETAILS:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {timetable.formData.subjectTeacherPairs.map((pair) => (
              <div key={pair.id} className="text-sm">
                <span>{pair.subjectName} - {pair.teacherName}</span>
                {pair.isLab && <span className="text-xs ml-1">(Lab)</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTimetable;
