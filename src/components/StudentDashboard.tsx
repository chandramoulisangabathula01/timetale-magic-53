
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Printer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { filterTimetables } from '@/utils/timetableUtils';
import { Timetable, YearType, BranchType, SemesterType } from '@/utils/types';
import TimetableView from './TimetableView';
import { useToast } from '@/hooks/use-toast';

/**
 * StudentDashboard Component
 * 
 * A React component that displays a student's timetable based on their year, branch, and semester.
 * Provides functionality to view and print timetables with a clean, formatted layout.
 * 
 * Features:
 * - Automatic timetable loading based on student filters
 * - Print functionality with custom styling
 * - Loading state handling
 * - Error state for missing timetables
 */
const StudentDashboard: React.FC = () => {
  // Access student filter settings from auth context
  const { studentFilters } = useAuth();
  const { toast } = useToast();
  
  // State for managing timetable data and loading status
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Reference for the printable timetable section
  const printRef = useRef<HTMLDivElement>(null);

  /**
   * Effect hook to fetch and filter timetables based on student criteria
   * Runs whenever student filters (year, branch, semester) change
   */
  useEffect(() => {
    if (studentFilters.year && studentFilters.branch && studentFilters.semester) {
      setLoading(true);
      // Force a fresh fetch of timetables from localStorage
      const filteredTimetables = filterTimetables(
        studentFilters.year as YearType, 
        studentFilters.branch as BranchType, 
        studentFilters.semester as SemesterType
      );

      if (filteredTimetables.length > 0) {
        setTimetable(filteredTimetables[0]);
      } else {
        setTimetable(null);
      }
      setLoading(false);
    }
  }, [studentFilters]);

  /**
   * Handles the print functionality for the timetable
   * Creates a new window with formatted timetable content optimized for printing
   * Includes styling for different sections (header, table, faculty details)
   */
  const handlePrint = () => {
    if (!timetable || !printRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Could not open print window. Please check your popup settings.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a simplified and clean printable view
    printWindow.document.write(`
      <html>
        <head>
          <title>Timetable - ${timetable.formData.year} ${timetable.formData.branch}</title>
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
              max-width: 50%;
            }
            .print-header {
              text-align: center;
              margin-bottom: 15px;
            }
            .logo-container {
              text-align: center;
              margin-bottom: 8px;
            }
            .logo {
              width: 60px;
              height: 60px;
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
              <img src="/images/college logo.jpg" class="logo" alt="College Logo">
            </div>
            <h2 style="margin-bottom: 5px; font-size: 16px;">University College of Engineering & Technology for Women</h2>
            <p style="margin-top: 0; margin-bottom: 8px; font-size: 12px;">Kakatiya University Campus, Warangal (T.S) - 506009</p>
            <h3 style="margin-top: 0; margin-bottom: 5px; text-decoration: underline; font-size: 14px;">
              ${timetable.formData.courseName}.${timetable.formData.branch} (${timetable.formData.semester}) SEMESTER TIME TABLE STATEMENT ${timetable.formData.academicYear}
            </h3>
            <p style="margin-top: 0; margin-bottom: 10px; font-size: 12px;">
              ${timetable.formData.year} ${timetable.formData.branch} - ${timetable.formData.academicYear}
            </p>
          </div>

          <div class="details-row">
            <div><strong>Class In-Charge:</strong> ${timetable.formData.classInchargeName}</div>
            <div><strong>Room No:</strong> ${timetable.formData.roomNumber}</div>
          </div>
          <div class="details-row">
            <div><strong>Mobile Number:</strong> ${timetable.formData.mobileNumber}</div>
            <div><strong>W.E.F:</strong> ${timetable.formData.date || new Date().toISOString().split('T')[0]}</div>
          </div>

          ${printRef.current.querySelector('table').outerHTML} 
          
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

          <button class="print-button" onclick="window.print(); setTimeout(() => window.close(), 500);">
            Print Timetable
          </button>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  /**
   * Loading state UI
   * Shows a centered loading indicator with animation
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center space-y-3">
          <Search className="h-10 w-10 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading your timetable...</p>
        </div>
      </div>
    );
  }

  /**
   * Main component render
   * Displays:
   * 1. Dashboard header with student info
   * 2. Error card if no timetable found
   * 3. Timetable view with print option if timetable exists
   */
  return (
    <div className="space-y-6">
      {/* Dashboard header with student info */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl bg-white p-2 rounded-xl font-bold">Student Dashboard</h1>
        {/* Display current filter settings */}
        <div className="text-sm  bg-white p-4 rounded-full text-muted-foreground">
          <span className="font-medium text-foreground">
            {studentFilters.year} | {studentFilters.branch} | Semester {studentFilters.semester}
          </span>
        </div>
      </div>

      {/* Show error card if no timetable found */}
      {!timetable ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 p-6">
              <AlertCircle className="h-6 w-6 text-amber-500 mt-1" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No timetable found</h3>
                {/* Error message with possible reasons */}
                <p className="text-sm text-muted-foreground">
                  We couldn't find a timetable for {studentFilters.year}, {studentFilters.branch}, Semester {studentFilters.semester}. This may be because:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>The timetable hasn't been created yet</li>
                  <li>There might be an error in your selected criteria</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Please check back later or contact your department coordinator.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Timetable view section */
        <div className="space-y-4">
          {/* Timetable header with print button */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg bg-white p-2 rounded-xl font-medium">Your Class Timetable</h2>
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              Print Timetable
            </Button>
          </div>
          
          {/* Printable timetable container */}
          <div className="border bg-white rounded-lg p-4 print:border-none" ref={printRef}>
            {/* Timetable header with institution and class details */}
            <div className="mb-4 print:mb-6">
              <h2 style={{ marginBottom: "5px" }} className="font-bold text-xl text-center">
                University College of Engineering & Technology for Women
              </h2>
              <h3 className="font-bold text-center text-lg">
                {timetable.formData.courseName} - {timetable.formData.year} - {timetable.formData.branch} - Semester {timetable.formData.semester}
              </h3>
              {/* Academic and room information */}
              <p className="text-center text-sm text-muted-foreground">
                Academic Year: {timetable.formData.academicYear} | Room: {timetable.formData.roomNumber}
              </p>
              {/* Class incharge details */}
              <p className="text-center text-sm mt-2">
                Class Incharge: <span className="font-medium">{timetable.formData.classInchargeName}</span> | Contact: {timetable.formData.mobileNumber}
              </p>
            </div>
            
            {/* Render the actual timetable grid */}
            <TimetableView 
              timetable={timetable} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
