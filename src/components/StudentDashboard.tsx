
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Printer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { filterTimetables } from '@/utils/timetableUtils';
import { Timetable, YearType, BranchType, SemesterType } from '@/utils/types';
import TimetableView from './TimetableView';
import { useToast } from '@/hooks/use-toast';

const StudentDashboard: React.FC = () => {
  const { studentFilters } = useAuth();
  const { toast } = useToast();
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const printRef = useRef<HTMLDivElement>(null);

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
          <title>Class Timetable - ${timetable.formData.year} ${timetable.formData.branch}</title>
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
              <img src="/lovable-uploads/eb4f9a1c-adf2-4f9d-b5b7-86a8c285a2ec.png" class="logo" alt="College Logo">
            </div>
            <h2 style="margin-bottom: 5px;">University College of Engineering & Technology</h2>
            <h3 style="margin-top: 5px; margin-bottom: 10px;">
              ${timetable.formData.courseName} - ${timetable.formData.year} - ${timetable.formData.branch} - Semester ${timetable.formData.semester}
            </h3>
            <p style="margin-top: 0; margin-bottom: 15px;">
              Academic Year: ${timetable.formData.academicYear} | Room: ${timetable.formData.roomNumber}
            </p>
          </div>

          ${printRef.current.innerHTML}
          
          <button class="print-button" onclick="window.print(); setTimeout(() => window.close(), 500);">
            Print Timetable
          </button>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl bg-white p-4 rounded-full font-bold">Student Dashboard</h1>
        <div className="text-sm  bg-white p-4 rounded-full text-muted-foreground">
          <span className="font-medium text-foreground">
            {studentFilters.year} | {studentFilters.branch} | Semester {studentFilters.semester}
          </span>
        </div>
      </div>

      {!timetable ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 p-6">
              <AlertCircle className="h-6 w-6 text-amber-500 mt-1" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No timetable found</h3>
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Your Class Timetable</h2>
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
          
          <div className="border rounded-lg p-4 print:border-none" ref={printRef}>
            <div className="mb-4 print:mb-6">
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
      )}
    </div>
  );
};

export default StudentDashboard;
