
// Import necessary dependencies and components
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getFaculty, 
  addFaculty, 
  updateFaculty, 
  deleteFaculty,
  FacultyData
} from '@/utils/facultyUtils';
import DashboardLayout from '@/components/DashboardLayout';

const ManageFaculty = () => {
  // Authentication and navigation hooks
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management for faculty data and form inputs
  const [faculty, setFaculty] = useState<FacultyData[]>([]); // Stores all faculty members
  const [newFacultyName, setNewFacultyName] = useState<string>(''); // New faculty name input
  const [newFacultyShortName, setNewFacultyShortName] = useState<string>(''); // New faculty short name input
  const [searchQuery, setSearchQuery] = useState<string>(''); // Search query for filtering faculty
  const [editingFaculty, setEditingFaculty] = useState<FacultyData | null>(null); // Currently editing faculty member
  
  // Authentication and initial data loading
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Only allow admin access to this page
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    // Load faculty list from storage when component mounts
    setFaculty(getFaculty());
  }, [isAuthenticated, userRole, navigate]);
  
  // Filter faculty based on search query (name or short name)
  const filteredFaculty = faculty.filter(teacher => 
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle adding new faculty member
  const handleAddFaculty = () => {
    // Validate faculty name is not empty
    if (!newFacultyName.trim()) {
      toast({
        title: "Faculty name required",
        description: "Please enter a faculty name",
        variant: "destructive",
      });
      return;
    }
    
    // Check for duplicate faculty names (case-insensitive)
    const isDuplicate = faculty.some(
      teacher => teacher.name.toLowerCase() === newFacultyName.toLowerCase()
    );
    
    if (isDuplicate) {
      toast({
        title: "Duplicate faculty",
        description: `"${newFacultyName}" already exists`,
        variant: "destructive",
      });
      return;
    }
    
    // Generate short name from initials if not provided
    const shortName = newFacultyShortName.trim() || 
      newFacultyName.split(' ').map(word => word[0]).join('').toUpperCase();
    
    // Create new faculty object
    const newFacultyData: FacultyData = {
      id: Date.now().toString(),
      name: newFacultyName,
      shortName: shortName
    };
    
    // Save to storage and update state
    addFaculty(newFacultyData);
    setFaculty(getFaculty());
    
    // Reset form inputs
    setNewFacultyName('');
    setNewFacultyShortName('');
    
    // Show success message
    toast({
      title: "Faculty added",
      description: `"${newFacultyName}" has been added successfully`,
    });
  };
  
  // Handle updating existing faculty member
  const handleUpdateFaculty = () => {
    // Validate faculty name is not empty
    if (!editingFaculty || !editingFaculty.name.trim()) {
      toast({
        title: "Faculty name required",
        description: "Please enter a faculty name",
        variant: "destructive",
      });
      return;
    }
    
    // Check for duplicate faculty names, excluding current faculty
    const isDuplicate = faculty.some(
      teacher => 
        teacher.id !== editingFaculty.id &&
        teacher.name.toLowerCase() === editingFaculty.name.toLowerCase()
    );
    
    if (isDuplicate) {
      toast({
        title: "Duplicate faculty",
        description: `"${editingFaculty.name}" already exists`,
        variant: "destructive",
      });
      return;
    }
    
    // Save updates to storage and refresh state
    updateFaculty(editingFaculty);
    setFaculty(getFaculty());
    setEditingFaculty(null);
    
    // Show success message
    toast({
      title: "Faculty updated",
      description: `"${editingFaculty.name}" has been updated successfully`,
    });
  };
  
  // Handle deleting faculty member
  const handleDeleteFaculty = (id: string) => {
    deleteFaculty(id);
    setFaculty(getFaculty());
    
    toast({
      title: "Faculty deleted",
      description: "The faculty has been deleted successfully",
    });
  };
  
  // Set faculty member for editing
  const handleEditFaculty = (faculty: FacultyData) => {
    setEditingFaculty(faculty);
  };
  
  // Cancel editing mode
  const handleCancelEdit = () => {
    setEditingFaculty(null);
  };
  
  return (
    <DashboardLayout>
      {/* Main container with padding and z-index for proper layering */}
      <div className="container mx-auto py-8 px-4 relative z-10">
        {/* Header section with title and back button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl bg-white p-4 rounded-full font-bold ">Manage Faculty</h1>
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>
        
        {/* Grid layout for add faculty form and faculty list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Faculty Form Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Add New Faculty</CardTitle>
              <CardDescription>
                Create faculty members with full names and abbreviations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Full Name Input Field */}
              <div className="space-y-2">
                <Label htmlFor="facultyName">Full Name</Label>
                <Input
                  id="facultyName"
                  value={newFacultyName}
                  onChange={(e) => setNewFacultyName(e.target.value)}
                  placeholder="e.g., Dr. John Smith"
                />
              </div>
              
              {/* Short Name Input Field with helper text */}
              <div className="space-y-2">
                <Label htmlFor="facultyShortName">Short Name (Optional)</Label>
                <Input
                  id="facultyShortName"
                  value={newFacultyShortName}
                  onChange={(e) => setNewFacultyShortName(e.target.value)}
                  placeholder="e.g., JS"
                />
                <p className="text-xs text-muted-foreground">
                  If left empty, initials will be used automatically
                </p>
              </div>
              
              {/* Add Faculty Button */}
              <Button 
                onClick={handleAddFaculty}
                className="w-full"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Faculty
              </Button>
            </CardContent>
          </Card>
          
          {/* Faculty List Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Faculty List</CardTitle>
              <CardDescription>
                View, edit and delete faculty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Input Field */}
                <div className="mb-4">
                  <Label htmlFor="searchFaculty">Search Faculty</Label>
                  <Input
                    id="searchFaculty"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or abbreviation"
                  />
                </div>
                
                <Separator />
                
                {/* Conditional rendering for empty state or faculty list */}
                {filteredFaculty.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No faculty found. Add faculty members or change your search.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Map through filtered faculty list */}
                    {filteredFaculty.map((teacher) => (
                      <div 
                        key={teacher.id}
                        className={`p-3 rounded-md border ${
                          editingFaculty?.id === teacher.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        }`}
                      >
                        {/* Conditional rendering for edit mode or display mode */}
                        {editingFaculty?.id === teacher.id ? (
                          <div className="space-y-3">
                            {/* Edit Full Name Field */}
                            <div className="space-y-2">
                              <Label htmlFor={`edit-faculty-${teacher.id}`}>Full Name</Label>
                              <Input
                                id={`edit-faculty-${teacher.id}`}
                                value={editingFaculty.name}
                                onChange={(e) => setEditingFaculty({
                                  ...editingFaculty,
                                  name: e.target.value
                                })}
                              />
                            </div>
                            
                            {/* Edit Short Name Field */}
                            <div className="space-y-2">
                              <Label htmlFor={`edit-short-${teacher.id}`}>Short Name</Label>
                              <Input
                                id={`edit-short-${teacher.id}`}
                                value={editingFaculty.shortName}
                                onChange={(e) => setEditingFaculty({
                                  ...editingFaculty,
                                  shortName: e.target.value
                                })}
                              />
                            </div>
                            
                            {/* Edit Mode Action Buttons */}
                            <div className="flex justify-end gap-2 mt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm"
                                onClick={handleUpdateFaculty}
                              >
                                <Save className="mr-1 h-3 w-3" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            {/* Faculty Information Display */}
                            <div>
                              <div className="font-medium">{teacher.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Short Name: {teacher.shortName}
                              </div>
                            </div>
                            {/* Action Buttons for Edit and Delete */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditFaculty(teacher)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteFaculty(teacher.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageFaculty;
