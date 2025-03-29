
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { filterTimetables, getTimetables } from '@/utils/timetableUtils';
import { Timetable } from '@/utils/types';
import TimetableView from './TimetableView';

const StudentDashboard: React.FC = () => {
  const { studentFilters } = useAuth();
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (studentFilters.year && studentFilters.branch && studentFilters.semester) {
      setLoading(true);
      // Force a fresh fetch of timetables from localStorage
      const filteredTimetables = filterTimetables(
        studentFilters.year,
        studentFilters.branch,
        studentFilters.semester
      );

      if (filteredTimetables.length > 0) {
        setTimetable(filteredTimetables[0]);
      } else {
        setTimetable(null);
      }
      setLoading(false);
    }
  }, [studentFilters]);

  const handleDownloadPDF = () => {
    // This is a placeholder - in a real app, this would trigger PDF generation
    window.print();
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
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <div className="text-sm text-muted-foreground">
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
              onClick={handleDownloadPDF}
            >
              <FileDown className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
          
          <div className="border rounded-lg p-4 print:border-none">
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
