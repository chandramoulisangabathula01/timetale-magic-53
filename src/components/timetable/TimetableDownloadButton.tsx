
// Main React imports and component dependencies
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Timetable } from '@/utils/types';
import TimetableHeaderInfo from './TimetableHeaderInfo';
import TimetableView from '../TimetableView';
import TimetableFacultyDetails from './TimetableFacultyDetails';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TimetableDownloadButtonProps {
  timetable: Timetable;
}

// Main component that handles timetable download and print functionality
const TimetableDownloadButton: React.FC<TimetableDownloadButtonProps> = ({ timetable }) => {
  const { toast } = useToast();
  
  // Function to handle direct printing of the current page
const handlePrint = () => {
    window.print();
  };
  
  // Function to handle PDF download by creating a new print-optimized window
const handleDownloadPDF = () => {
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

          <table border="1" cellspacing="0" cellpadding="5" style="width: 100%;">
            <thead>
              <tr>
                <th style="width: 10%;">Day/Time</th>
                ${generateTimeSlotHeaders(timetable)}
              </tr>
            </thead>
            <tbody>
              ${generateTimetableRows(timetable)}
            </tbody>
          </table>
          
          <div class="faculty-details">
            <h4 style="margin-bottom: 10px;">Faculty Details</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              ${generateFacultyDetails(timetable)}
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
  
  // Helper function to generate time slot headers
  // Helper function to generate table headers for timetable time slots
const generateTimeSlotHeaders = (timetable: Timetable) => {
    const timeSlots = new Set<string>();
    timetable.entries.forEach(entry => timeSlots.add(entry.timeSlot));
    
    const sortedTimeSlots = Array.from(timeSlots).sort((a, b) => {
      const timeA = a.split('-')[0];
      const timeB = b.split('-')[0];
      return timeA.localeCompare(timeB);
    });
    
    return sortedTimeSlots
      .filter(slot => !slot.includes('11:10-11:20') && !slot.includes('1:00-2:00'))
      .map(slot => `<th>${slot}</th>`)
      .join('');
  };
  
  // Helper function to generate timetable rows
  // Helper function to generate timetable rows with proper formatting and styling
const generateTimetableRows = (timetable: Timetable) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = new Set<string>();
    timetable.entries.forEach(entry => timeSlots.add(entry.timeSlot));
    
    const sortedTimeSlots = Array.from(timeSlots)
      .filter(slot => !slot.includes('11:10-11:20') && !slot.includes('1:00-2:00'))
      .sort((a, b) => {
        const timeA = a.split('-')[0];
        const timeB = b.split('-')[0];
        return timeA.localeCompare(timeB);
      });
    
    return days.map(day => {
      const dayEntries = timetable.entries.filter(entry => entry.day === day);
      const isActiveDayInTimetable = dayEntries.length > 0;
      
      if (!isActiveDayInTimetable) return '';
      
      let rowHtml = `<tr><td><strong>${day}</strong></td>`;
      
      for (const slot of sortedTimeSlots) {
        const entry = dayEntries.find(e => e.timeSlot === slot);
        
        if (entry) {
          let cellClass = '';
          let content = '';
          
          if (entry.isBreak) {
            cellClass = 'break-slot';
            content = 'Break';
          } else if (entry.isLunch) {
            cellClass = 'lunch-slot';
            content = 'Lunch';
          } else if (entry.isFree) {
            cellClass = 'free-slot';
            content = entry.freeType || 'Free';
          } else if (entry.isLab) {
            cellClass = 'lab-slot';
            content = `${entry.subjectName}<br/>(${entry.teacherName})`;
            if (entry.batchNumber) {
              content += `<br/>Batch: ${entry.batchNumber}`;
            }
          } else if (entry.subjectName) {
            content = `${entry.subjectName}<br/>(${entry.teacherName})`;
          } else {
            content = '-';
          }
          
          rowHtml += `<td class="${cellClass}">${content}</td>`;
        } else {
          rowHtml += '<td>-</td>';
        }
      }
      
      rowHtml += '</tr>';
      return rowHtml;
    }).join('');
  };
  
  // Helper function to generate faculty details
  // Helper function to generate faculty details section for the timetable
const generateFacultyDetails = (timetable: Timetable) => {
    return timetable.formData.subjectTeacherPairs.map(pair => {
      return `
        <div style="margin-bottom: 5px;">
          <span style="font-weight: 500;">${pair.subjectName}</span>
          ${pair.isLab ? '<span style="font-size: 0.8rem; margin-left: 4px;">(Lab)</span>' : ''}
          <span> - ${pair.teacherName}</span>
        </div>
      `;
    }).join('');
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePrint} className="cursor-pointer">
          <Printer className="h-4 w-4 mr-2" />
          Print Timetable
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadPDF} className="cursor-pointer">
          <FileDown className="h-4 w-4 mr-2" />
          Download PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TimetableDownloadButton;
