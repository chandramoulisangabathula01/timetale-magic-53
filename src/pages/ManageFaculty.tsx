
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
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [faculty, setFaculty] = useState<FacultyData[]>([]);
  const [newFacultyName, setNewFacultyName] = useState<string>('');
  const [newFacultyShortName, setNewFacultyShortName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingFaculty, setEditingFaculty] = useState<FacultyData | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    // Load faculty from storage
    setFaculty(getFaculty());
  }, [isAuthenticated, userRole, navigate]);
  
  const filteredFaculty = faculty.filter(teacher => 
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddFaculty = () => {
    if (!newFacultyName.trim()) {
      toast({
        title: "Faculty name required",
        description: "Please enter a faculty name",
        variant: "destructive",
      });
      return;
    }
    
    // Check for duplicate faculty name
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
    
    const shortName = newFacultyShortName.trim() || 
      newFacultyName.split(' ').map(word => word[0]).join('').toUpperCase();
    
    const newFacultyData: FacultyData = {
      id: Date.now().toString(),
      name: newFacultyName,
      shortName: shortName
    };
    
    // Add faculty to storage
    addFaculty(newFacultyData);
    
    // Update state
    setFaculty(getFaculty());
    setNewFacultyName('');
    setNewFacultyShortName('');
    
    toast({
      title: "Faculty added",
      description: `"${newFacultyName}" has been added successfully`,
    });
  };
  
  const handleUpdateFaculty = () => {
    if (!editingFaculty || !editingFaculty.name.trim()) {
      toast({
        title: "Faculty name required",
        description: "Please enter a faculty name",
        variant: "destructive",
      });
      return;
    }
    
    // Check for duplicate faculty name
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
    
    // Update faculty in storage
    updateFaculty(editingFaculty);
    
    // Update state
    setFaculty(getFaculty());
    setEditingFaculty(null);
    
    toast({
      title: "Faculty updated",
      description: `"${editingFaculty.name}" has been updated successfully`,
    });
  };
  
  const handleDeleteFaculty = (id: string) => {
    // Delete faculty from storage
    deleteFaculty(id);
    
    // Update state
    setFaculty(getFaculty());
    
    toast({
      title: "Faculty deleted",
      description: "The faculty has been deleted successfully",
    });
  };
  
  const handleEditFaculty = (faculty: FacultyData) => {
    setEditingFaculty(faculty);
  };
  
  const handleCancelEdit = () => {
    setEditingFaculty(null);
  };
  
  return (
    <DashboardLayout>
    
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl bg-white p-4 rounded-full font-bold ">Manage Faculty</h1>
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Add New Faculty</CardTitle>
              <CardDescription>
                Create faculty members with full names and abbreviations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facultyName">Full Name</Label>
                <Input
                  id="facultyName"
                  value={newFacultyName}
                  onChange={(e) => setNewFacultyName(e.target.value)}
                  placeholder="e.g., Dr. John Smith"
                />
              </div>
              
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
              
              <Button 
                onClick={handleAddFaculty}
                className="w-full"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Faculty
              </Button>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Faculty List</CardTitle>
              <CardDescription>
                View, edit and delete faculty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                
                {filteredFaculty.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No faculty found. Add faculty members or change your search.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFaculty.map((teacher) => (
                      <div 
                        key={teacher.id}
                        className={`p-3 rounded-md border ${
                          editingFaculty?.id === teacher.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        }`}
                      >
                        {editingFaculty?.id === teacher.id ? (
                          <div className="space-y-3">
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
                            <div>
                              <div className="font-medium">{teacher.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Short Name: {teacher.shortName}
                              </div>
                            </div>
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
