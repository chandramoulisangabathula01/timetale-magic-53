
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarPlus, Users, BookOpen, Settings, BarChart } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Create Timetable Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-primary" />
              Create Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create a new timetable with automatic scheduling of classes and labs.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => navigate('/create-timetable')}
            >
              Create New
            </Button>
          </CardFooter>
        </Card>

        {/* Manage Faculty Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Manage Faculty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add, edit, or remove faculty members and their details.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => navigate('/manage-faculty')}
            >
              Manage Faculty
            </Button>
          </CardFooter>
        </Card>

        {/* Manage Subjects Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Manage Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add, edit, or remove subjects for different years and branches.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => navigate('/manage-subjects')}
            >
              Manage Subjects
            </Button>
          </CardFooter>
        </Card>
        
        {/* Faculty Workload Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              Faculty Workload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and monitor faculty subject assignment limits and workload distribution.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => navigate('/faculty-workload')}
            >
              View Workload
            </Button>
          </CardFooter>
        </Card>

        {/* Settings Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure system settings, data exports, and other options.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => navigate('/admin-settings')}
            >
              Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
