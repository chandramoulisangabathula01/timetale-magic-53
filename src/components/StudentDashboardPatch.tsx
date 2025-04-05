
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TimetableList from './TimetableList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar } from 'lucide-react';
import { getAllBranches } from '@/utils/subjectsUtils';
import { BranchType } from '@/utils/types';

const StudentDashboard = () => {
  const { username, studentFilters } = useAuth();
  const [availableBranches, setAvailableBranches] = useState<(BranchType | string)[]>([]);
  
  // Load all branches including custom ones
  useEffect(() => {
    const branches = getAllBranches();
    setAvailableBranches(branches);
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {username}. View your class timetable.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <CardTitle>Your Class Timetable</CardTitle>
          </div>
          <CardDescription>
            Timetables for {studentFilters?.year} Year, {studentFilters?.branch}, Semester {studentFilters?.semester}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimetableList 
            role="student" 
            filters={{
              year: studentFilters?.year,
              branch: studentFilters?.branch,
              semester: studentFilters?.semester
            }} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
