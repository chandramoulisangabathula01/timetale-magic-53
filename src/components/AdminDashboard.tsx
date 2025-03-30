import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Book } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
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
              <Book className="h-4 w-4 mr-2" />
              Admin Settings
            </CardTitle>
            <CardDescription>Change username and password.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Change username and password.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
