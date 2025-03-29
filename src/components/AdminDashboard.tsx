import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Calendar, FileEdit, FilePlus, Info, Trash2, BookOpen, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTimetables, deleteTimetable } from '@/utils/timetableUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Timetable } from '@/utils/types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timetables, setTimetables] = useState<Timetable[]>(getTimetables());
  const [timetableToDelete, setTimetableToDelete] = useState<string | null>(null);

  const handleCreateNew = () => {
    navigate('/create-timetable');
  };

  const handleEditTimetable = (id: string) => {
    navigate(`/edit-timetable/${id}`);
  };

  const handleViewTimetable = (id: string) => {
    navigate(`/view-timetable/${id}`);
  };

  const handleDeleteTimetable = (id: string) => {
    deleteTimetable(id);
    setTimetables(getTimetables());
    toast({
      title: "Timetable deleted",
      description: "The timetable has been permanently removed",
    });
    setTimetableToDelete(null);
  };

  const refreshTimetables = () => {
    setTimetables(getTimetables());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/manage-subjects')} variant="outline" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Manage Subjects
          </Button>
          <Button onClick={() => navigate('/manage-faculty')} variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Manage Faculty
          </Button>
          <Button onClick={handleCreateNew} className="flex items-center gap-2">
            <FilePlus className="h-4 w-4" />
            Create New Timetable
          </Button>
        </div>
      </div>

      <Tabs defaultValue="timetables">
        <TabsList>
          <TabsTrigger value="timetables">Timetables</TabsTrigger>
          <TabsTrigger value="help">Help & Instructions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timetables" className="space-y-4">
          {timetables.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-3 py-6">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">No timetables yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Start by creating a new timetable. You'll be able to manage them all from here.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleCreateNew}
                    className="mt-4"
                  >
                    Create Your First Timetable
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {timetables.map((timetable) => (
                <Card key={timetable.id} className="overflow-hidden">
                  <CardHeader className="bg-primary/5 p-4">
                    <CardTitle className="flex justify-between items-center">
                      <span className="truncate">
                        {timetable.formData.year}, {timetable.formData.branch}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {timetable.formData.courseName}, Semester {timetable.formData.semester}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Class Incharge:</span> {timetable.formData.classInchargeName}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Room:</span> {timetable.formData.roomNumber}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Academic Year:</span> {timetable.formData.academicYear}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Created:</span> {new Date(timetable.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-4 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewTimetable(timetable.id)}
                        className="flex items-center gap-1"
                      >
                        <Calendar className="h-3 w-3" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditTimetable(timetable.id)}
                        className="flex items-center gap-1"
                      >
                        <FileEdit className="h-3 w-3" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 text-destructive"
                            onClick={() => setTimetableToDelete(timetable.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Timetable</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this timetable? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteTimetable(timetable.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Help & Instructions
              </CardTitle>
              <CardDescription>
                Learn how to use the timetable generation system effectively
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Creating a Timetable</h3>
                <p className="text-sm text-muted-foreground">
                  Click on "Create New Timetable" to start the creation process. You'll need to provide academic details, subject and faculty information, and scheduling preferences.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Managing Subjects and Faculty</h3>
                <p className="text-sm text-muted-foreground">
                  Use the "Manage Subjects" and "Manage Faculty" sections to create, edit, and organize your subjects and teachers before creating timetables.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Managing Timetables</h3>
                <p className="text-sm text-muted-foreground">
                  From the "Timetables" tab, you can view, edit, or delete any existing timetable. Each timetable card shows a summary of the key information.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Key Constraints</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Each teacher can be assigned a maximum of 3 non-lab subjects</li>
                  <li>Lab subjects must be allocated in merged timeslots</li>
                  <li>A teacher cannot be allocated two classes at the same time</li>
                  <li>Each non-lab subject receives 4 periods per week</li>
                  <li>Free hours are primarily allocated on Saturday</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Export Options</h3>
                <p className="text-sm text-muted-foreground">
                  When viewing a timetable, you can export it as PDF or DOCX for sharing or printing. The export will include only the timetable content without any navigation elements.
                </p>
              </div>
              
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Important Note</h4>
                  <p className="text-sm text-amber-700">
                    The timetable generation algorithm follows strict constraints to ensure there are no scheduling conflicts. If you encounter any issues with generation, check that your input data doesn't create impossible constraints.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
