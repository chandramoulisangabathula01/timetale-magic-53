
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileDown, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTimetablesForFaculty } from '@/utils/timetableUtils';
import { Timetable } from '@/utils/types';
import TimetableView from './TimetableView';
import { useToast } from '@/hooks/use-toast';

const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useAuth();
  const { toast } = useToast();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  
  useEffect(() => {
    if (username) {
      console.log("Fetching timetables for faculty:", username);
      // Force a fresh fetch of timetables for this faculty member
      const facultyTimetables = getTimetablesForFaculty(username);
      console.log("Found timetables:", facultyTimetables);
      
      if (facultyTimetables.length === 0) {
        toast({
          title: "No timetables found",
          description: `No timetables were found for faculty: ${username}`,
          variant: "default",
        });
      }
      
      setTimetables(facultyTimetables);
      
      // Set the first timetable as selected by default
      if (facultyTimetables.length > 0) {
        setSelectedTimetable(facultyTimetables[0]);
      } else {
        setSelectedTimetable(null);
      }
    }
  }, [username, toast]);
  
  const handleSelectTimetable = (timetable: Timetable) => {
    setSelectedTimetable(timetable);
  };
  
  const handleDownloadPDF = () => {
    // This is a placeholder - in a real app, this would trigger PDF generation
    window.print();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Logged in as: <span className="font-medium text-foreground">{username}</span>
        </div>
      </div>
      
      {timetables.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Info className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No timetables assigned</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                You don't have any classes assigned in the current timetables. Please check back later or contact the administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-medium">Your Timetables</h2>
            {timetables.map((timetable) => (
              <Card 
                key={timetable.id}
                className={`cursor-pointer transition-colors ${
                  selectedTimetable?.id === timetable.id ? 'border-primary' : ''
                }`}
                onClick={() => handleSelectTimetable(timetable)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base">
                    {timetable.formData.year}, {timetable.formData.branch}
                  </CardTitle>
                  <CardDescription>
                    {timetable.formData.courseName}, Semester {timetable.formData.semester}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">Room:</span> {timetable.formData.roomNumber}
                    </div>
                    <div>
                      <span className="font-medium">Academic Year:</span> {timetable.formData.academicYear}
                    </div>
                    <div>
                      <span className="font-medium">Classes:</span> {timetable.entries.filter(entry => 
                        entry.teacherName === username && !entry.isBreak && !entry.isLunch
                      ).length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="lg:col-span-2">
            {selectedTimetable ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">Your Schedule</h2>
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
                      {selectedTimetable.formData.courseName} - {selectedTimetable.formData.year} - {selectedTimetable.formData.branch} - Semester {selectedTimetable.formData.semester}
                    </h3>
                    <p className="text-center text-sm text-muted-foreground">
                      Academic Year: {selectedTimetable.formData.academicYear} | Room: {selectedTimetable.formData.roomNumber}
                    </p>
                    <p className="text-center text-sm font-medium mt-2">
                      Faculty View: {username}
                    </p>
                  </div>
                  
                  <TimetableView 
                    timetable={selectedTimetable} 
                    facultyFilter={username}
                  />
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center p-8 space-y-3">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Select a timetable</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a timetable from the left to view your teaching schedule
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
