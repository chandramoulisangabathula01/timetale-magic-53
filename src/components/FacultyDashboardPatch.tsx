
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TimetableList from './TimetableList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ClipboardList } from 'lucide-react';

const FacultyDashboard = () => {
  const { username } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Faculty Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {username}. View your assigned classes and schedules.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            <CardTitle>Your Teaching Schedule</CardTitle>
          </div>
          <CardDescription>
            All timetables containing classes assigned to you are listed below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimetableList role="faculty" username={username} facultySpecific={true} />
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyDashboard;
