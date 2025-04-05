
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, 
  ClipboardList, 
  Users, 
  Settings, 
  BookOpen, 
  Database,
  Calendar,
  ChevronRight,
  BriefcaseBusiness
} from 'lucide-react';
import { getTimetables } from '@/utils/timetableUtils';
import { Timetable } from '@/utils/types';
import { formatDistanceToNow, parseISO } from 'date-fns';

const AdminDashboard = () => {
  const [recentTimetables, setRecentTimetables] = useState<Timetable[]>([]);
  
  useEffect(() => {
    const timetables = getTimetables();
    // Sort by creation date (newest first)
    const sorted = [...timetables].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setRecentTimetables(sorted.slice(0, 5)); // Take the 5 most recent
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Create and manage timetables, faculty, and subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/create-timetable">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <PlusCircle className="h-6 w-6" />
                  <span>Create New Timetable</span>
                </Button>
              </Link>
              
              <Link to="/manage-faculty">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>Manage Faculty</span>
                </Button>
              </Link>
              
              <Link to="/manage-subjects">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span>Manage Subjects</span>
                </Button>
              </Link>
              
              <Link to="/admin-settings">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Settings className="h-6 w-6" />
                  <span>Settings</span>
                </Button>
              </Link>
              
              <Link to="/faculty-workload">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <BriefcaseBusiness className="h-6 w-6" />
                  <span>Faculty Workload</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              View system statistics and information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">Total Timetables</span>
                </div>
                <span className="text-2xl font-bold">{getTimetables().length}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">Faculty Count</span>
                </div>
                <span className="text-2xl font-bold">{/* Add faculty count here */}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <span className="font-medium">Data Storage</span>
                </div>
                <span className="text-sm font-medium">Local Storage</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="recent">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Recent Timetables</TabsTrigger>
          <TabsTrigger value="all">View All</TabsTrigger>
        </TabsList>
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recently Created Timetables</CardTitle>
              <CardDescription>
                View and manage your most recent timetables
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTimetables.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No timetables created yet. Click "Create New Timetable" to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTimetables.map((timetable) => (
                    <div 
                      key={timetable.id} 
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div>
                        <div className="font-medium">{timetable.formData.year} - {timetable.formData.branch} - Sem {timetable.formData.semester}</div>
                        <div className="text-sm text-muted-foreground">
                          Created {formatDistanceToNow(parseISO(timetable.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      <Link to={`/view-timetable/${timetable.id}`}>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <span>View</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link to="/dashboard" className="w-full">
                <Button variant="outline" className="w-full">
                  View All Timetables
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Timetables</CardTitle>
              <CardDescription>
                A comprehensive list of all created timetables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Link to="/dashboard">
                  <Button>Go to Timetable Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
