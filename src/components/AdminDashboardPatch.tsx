
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import TimetableList from './TimetableList';
import { Plus, Users, BookOpen, Settings } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage timetables, faculty, subjects, and system settings.
          </p>
        </div>
        <Button asChild>
          <Link to="/create-timetable">
            <Plus className="mr-2 h-4 w-4" /> Create New Timetable
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Link to="/manage-faculty" className="no-underline">
          <Card className="hover:bg-muted/50 transition-colors h-full">
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Manage Faculty</CardTitle>
              <CardDescription>Add, edit, or remove faculty members</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/manage-subjects" className="no-underline">
          <Card className="hover:bg-muted/50 transition-colors h-full">
            <CardHeader>
              <BookOpen className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Manage Subjects</CardTitle>
              <CardDescription>Add, edit, or remove subjects and map with faculty</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/admin-settings" className="no-underline">
          <Card className="hover:bg-muted/50 transition-colors h-full">
            <CardHeader>
              <Settings className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Settings</CardTitle>
              <CardDescription>System settings and admin credentials</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Your Timetables</h2>
      <TimetableList role="admin" />
    </div>
  );
};

export default AdminDashboard;
