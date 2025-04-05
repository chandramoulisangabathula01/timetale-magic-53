
// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, FileDown, Edit, Trash2, AlertCircle } from 'lucide-react';
import { getTimetables, deleteTimetable } from '@/utils/timetableUtils';
import { Timetable, YearType, BranchType, SemesterType } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';
import TimetableDownloadButton from './timetable/TimetableDownloadButton';

// Define the AdminDashboard component
const AdminDashboard: React.FC = () => {
  // Initialize navigation and toast hooks
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State variables for managing timetables and filters
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredTimetables, setFilteredTimetables] = useState<Timetable[]>([]);
  
  // Load timetables on component mount
  useEffect(() => {
    const loadedTimetables = getTimetables();
    setTimetables(loadedTimetables);
  }, []);
  
  // Apply filters and search query to timetables
  useEffect(() => {
    let filtered = [...timetables];
    
    // Filter by year
    if (filterYear !== 'all') {
      filtered = filtered.filter(t => t.formData.year === filterYear);
    }
    
    // Filter by branch
    if (filterBranch !== 'all') {
      filtered = filtered.filter(t => t.formData.branch === filterBranch);
    }
    
    // Filter by semester
    if (filterSemester !== 'all') {
      filtered = filtered.filter(t => t.formData.semester === filterSemester);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.formData.branch.toLowerCase().includes(query) || 
        t.formData.year.toLowerCase().includes(query) ||
        t.formData.academicYear.toLowerCase().includes(query) ||
        t.formData.classInchargeName.toLowerCase().includes(query)
      );
    }
    
    // Sort timetables by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredTimetables(filtered);
  }, [timetables, filterYear, filterBranch, filterSemester, searchQuery]);
  
  // Handle timetable deletion
  const handleDeleteTimetable = (id: string) => {
    deleteTimetable(id);
    setTimetables(getTimetables());
    
    toast({
      title: "Timetable deleted",
      description: "The timetable has been permanently deleted.",
    });
  };
  
  // Navigation functions
  const navigateToCreateTimetable = () => {
    navigate('/create-timetable');
  };
  
  const navigateToEditTimetable = (id: string) => {
    navigate(`/edit-timetable/${id}`);
  };
  
  const navigateToViewTimetable = (id: string) => {
    navigate(`/view-timetable/${id}`);
  };

  // Render the Admin Dashboard UI
  return (
    <div className="space-y-6 " >
      
      <div className="flex justify-between items-center " >
        <h1 className="text-2xl font-bold text-black bg-white p-4 rounded-full ">Admin Dashboard</h1>
        <Button onClick={navigateToCreateTimetable} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Timetable
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage System</CardTitle>
          <CardDescription>Access admin controls to manage the timetable system</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => navigate('/manage-subjects')}>
            <div className="text-lg font-medium">Manage Subjects</div>
            <div className="text-xs text-muted-foreground">Add, edit and delete subjects</div>
          </Button>
          
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => navigate('/manage-faculty')}>
            <div className="text-lg font-medium">Manage Faculty</div>
            <div className="text-xs text-muted-foreground">Add, edit and delete faculty members</div>
          </Button>
          
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => navigate('/admin-settings')}>
            <div className="text-lg font-medium">Settings</div>
            <div className="text-xs text-muted-foreground">Configure system settings</div>
          </Button>
        </CardContent>
      </Card>

      <Card className='p-4 '>
        <h2 className="text-xl font-semibold mb-4 ">Available Timetables</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="1st Year">1st Year</SelectItem>
              <SelectItem value="2nd Year">2nd Year</SelectItem>
              <SelectItem value="3rd Year">3rd Year</SelectItem>
              <SelectItem value="4th Year">4th Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterBranch} onValueChange={setFilterBranch}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="CSE">CSE</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="ECE">ECE</SelectItem>
              <SelectItem value="EEE">EEE</SelectItem>
              <SelectItem value="CSD">CSD</SelectItem>
              <SelectItem value="AI & ML">AI & ML</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterSemester} onValueChange={setFilterSemester}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              <SelectItem value="I">Semester I</SelectItem>
              <SelectItem value="II">Semester II</SelectItem>
            </SelectContent>
          </Select>
          
          <Input 
            type="search" 
            placeholder="Search timetables..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {filteredTimetables.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No timetables found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try changing your filters or create a new timetable.
            </p>
            <Button onClick={navigateToCreateTimetable} className="mt-4">
              Create New Timetable
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTimetables.map((timetable) => (
              <Card key={timetable.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {timetable.formData.year} {timetable.formData.branch}
                  </CardTitle>
                  <CardDescription>
                    Semester {timetable.formData.semester} | {timetable.formData.academicYear}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm pb-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Room:</span> {timetable.formData.roomNumber}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Course:</span> {timetable.formData.courseName}
                    </div>
                    <div>
                      <span className="text-muted-foreground">In-charge:</span> {timetable.formData.classInchargeName}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span> {new Date(timetable.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigateToViewTimetable(timetable.id)}
                    >
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigateToEditTimetable(timetable.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <TimetableDownloadButton timetable={timetable} />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
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
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
