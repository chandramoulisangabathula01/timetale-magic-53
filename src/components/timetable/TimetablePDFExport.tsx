
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Timetable } from '@/utils/types';
import { FileDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TimetablePDFExportProps {
  timetable: Timetable;
  printRef: React.RefObject<HTMLDivElement>;
}

const TimetablePDFExport: React.FC<TimetablePDFExportProps> = ({ timetable, printRef }) => {
  const { toast } = useToast();
  
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
  
  return (
    <Button 
      onClick={handleDownloadPDF}
      className="flex items-center gap-1"
    >
      <FileDown className="h-4 w-4" />
      Download PDF
    </Button>
  );
};

export default TimetablePDFExport;
