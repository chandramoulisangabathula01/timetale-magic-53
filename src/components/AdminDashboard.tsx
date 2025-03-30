
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Book, Settings, Edit, Eye, Trash2 } from 'lucide-react';
import { getTimetables } from '@/utils/timetableUtils';
import { Timetable } from '@/utils/types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  
  useEffect(() => {
    // Load timetables when component mounts
    const loadedTimetables = getTimetables();
    setTimetables(loadedTimetables);
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => navigate('/create-timetable')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 mr-2" />
              Create Timetable
            </CardTitle>
            <CardDescription>Generate a new timetable for a class.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Quickly create a timetable for any year, branch, and semester.
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => navigate('/manage-faculty')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 mr-2" />
              Manage Faculty
            </CardTitle>
            <CardDescription>Add, edit, or remove faculty members.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage faculty details, departments, and assigned subjects.
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => navigate('/manage-subjects')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-4 w-4 mr-2" />
              Manage Subjects
            </CardTitle>
            <CardDescription>Add, edit, or remove subjects.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Maintain a comprehensive list of subjects and their details.
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => navigate('/admin-settings')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4 mr-2" />
              Admin Settings
            </CardTitle>
            <CardDescription>Change username and password.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Update your admin credentials.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Available Timetables Section */}
      {timetables.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Available Timetables</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border rounded-md">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left border">Year</th>
                  <th className="p-2 text-left border">Branch</th>
                  <th className="p-2 text-left border">Semester</th>
                  <th className="p-2 text-left border">Room</th>
                  <th className="p-2 text-left border">Academic Year</th>
                  <th className="p-2 text-left border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timetables.map(timetable => (
                  <tr key={timetable.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 border">{timetable.formData.year}</td>
                    <td className="p-2 border">{timetable.formData.branch}</td>
                    <td className="p-2 border">{timetable.formData.semester}</td>
                    <td className="p-2 border">{timetable.formData.roomNumber}</td>
                    <td className="p-2 border">{timetable.formData.academicYear}</td>
                    <td className="p-2 border">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/view-timetable/${timetable.id}`);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/edit-timetable/${timetable.id}`);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
