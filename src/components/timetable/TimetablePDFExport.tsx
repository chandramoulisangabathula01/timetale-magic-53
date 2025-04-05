
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Timetable } from '@/utils/types';
import { FileDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

/**
 * Interface defining the props required by the TimetablePDFExport component
 * @property {Timetable} timetable - The timetable data to be exported
 * @property {React.RefObject<HTMLDivElement>} printRef - Reference to the printable timetable content
 */
interface TimetablePDFExportProps {
  timetable: Timetable;
  printRef: React.RefObject<HTMLDivElement>;
}

/**
 * TimetablePDFExport Component
 * 
 * This component provides functionality to export a timetable as a printable document.
 * It creates a new browser window with a formatted version of the timetable
 * optimized for printing, including college header, timetable details, and faculty information.
 */
const TimetablePDFExport: React.FC<TimetablePDFExportProps> = ({ timetable, printRef }) => {
  // Hook for displaying toast notifications
  const { toast } = useToast();
  
  /**
   * Handles the PDF download/print process
   * Creates a new window with formatted timetable content and triggers the print dialog
   */
  const handleDownloadPDF = () => {
    // Get the timetable content from the reference
    const content = printRef.current;
    if (!content) return;
    
    // Create a new window for printing only the timetable
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // Show error toast if popup is blocked
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
              margin: 0.5cm;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 15px;
              margin: 0 auto;
              font-size: 14px;
              max-width: 90%;
            }
            .print-header {
              text-align: center;
              margin-bottom: 15px;
            }
            .logo-container {
              text-align: center;
              margin-bottom: 8px;
              float: left;
              width: 80px;
            }
            .logo {
              width: 60px;
              height: 60px;
            }
            .header-text {
              text-align: center;
              width: calc(100% - 80px);
              float: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 0 auto 15px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #000;
              padding: 4px 6px;
              text-align: center;
              height: 24px;
              vertical-align: middle;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
              font-size: 11px;
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
              clear: both;
            }
            .details-left {
              float: left;
              text-align: left;
              width: 50%;
            }
            .details-right {
              float: right;
              text-align: right;
              width: 50%;
            }
            .faculty-details {
              margin-top: 20px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
              clear: both;
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
              clear: both;
            }
            .header-container {
              overflow: hidden;
              margin-bottom: 15px;
            }
            .uppercase {
              text-transform: uppercase;
            }
            @media print {
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <!-- College header with logo and institution details -->
          <div class="header-container">
            <div class="logo-container">
              <img src="/images/college logo.jpg" class="logo" alt="College Logo">
            </div>
            <div class="header-text">
              <h2 style="margin-bottom: 5px; font-size: 16px; text-decoration: underline;">University College of Engineering & Technology for Women</h2>
              <p style="margin-top: 0; margin-bottom: 8px; font-size: 12px;">Kakatiya University Campus, Warangal (T.S) - 506009</p>
              <h3 style="margin-top: 0; margin-bottom: 5px; text-decoration: underline; font-size: 14px;">
                ${timetable?.formData.courseName}.${timetable?.formData.branch} (${timetable?.formData.semester}) SEMESTER TIME TABLE STATEMENT ${timetable?.formData.academicYear}
              </h3>
              <p style="margin-top: 0; margin-bottom: 10px; font-size: 12px;">
                ${timetable?.formData.year} ${timetable?.formData.branch} - ${timetable?.formData.academicYear}
              </p>
            </div>
          </div>

          <!-- Class details section with incharge and room info -->
          <div class="details-row">
            <div class="details-left"><strong>Class In-Charge:</strong> ${timetable?.formData.classInchargeName}</div>
            <div class="details-right"><strong>Room No:</strong> ${timetable?.formData.roomNumber}</div>
          </div>
          <div class="details-row">
            <div class="details-left"><strong>Mobile Number:</strong> ${timetable?.formData.mobileNumber}</div>
            <div class="details-right"><strong>W.E.F:</strong> ${timetable?.formData.date || new Date().toISOString().split('T')[0]}</div>
          </div>

          <!-- Convert the table to put time slots on top row and days on first column -->
          ${(() => {
            // Extract the table HTML
            const table = content.querySelector('table');
            if (!table) return '';
            
            // Type assertion since we know table is an HTMLElement
            const tableElement = table as HTMLElement;
            
            // The table is already in the correct format after our TimetableView changes
            return tableElement.outerHTML;
          })()}
          
          <!-- Faculty details section with subject-teacher mappings -->
          <div class="faculty-details">
            <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 10px;">FACULTY DETAILS:</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
              ${timetable.formData.subjectTeacherPairs.map(pair => `
                <div style="font-size: 12px; background-color: #ffffff80; padding: 8px; border-radius: 6px; border: 1px solid #f0f0f0;">
                  <span style="font-weight: 500;">${pair.subjectName}</span>
                  ${pair.isLab ? '<span style="font-size: 10px; margin-left: 4px;">(Lab)</span>' : ''}
                  <span> - </span>
                  ${pair.teacherNames && pair.teacherNames.length > 0 ? 
                    `<span>${pair.teacherNames.join(' & ')}</span>` : 
                    `<span>${pair.teacherName}</span>`
                  }
                  ${pair.batchNumber ? 
                    `<span style="font-size: 10px; margin-left: 4px;">(${pair.batchNumber})</span>` : 
                    ''
                  }
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Print button that triggers browser print dialog -->
          <button class="print-button" onclick="window.print(); setTimeout(() => window.close(), 500);">
            Print Timetable
          </button>
        </body>
      </html>
    `);
    
    // Close the document to finish writing
    printWindow.document.close();
    
    // Automatically trigger print after content is loaded
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
      }, 100);
    };
  };
  
  // Render a button that triggers the PDF download/print process
  return (
    <Button 
      onClick={handleDownloadPDF}
      className="flex items-center gap-1"
    >
      <FileDown className="h-4 w-4" />
      Print
    </Button>
  );
};

export default TimetablePDFExport;
