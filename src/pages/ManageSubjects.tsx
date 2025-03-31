
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, ArrowLeft, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSubjects, saveSubject, deleteSubject } from '@/utils/subjectsUtils';
import { Subject, YearType, BranchType } from '@/utils/types';
import DashboardLayout from '@/components/DashboardLayout';
import { v4 as uuidv4 } from 'uuid';

const ManageSubjects: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState<Subject>({
    id: '',
    name: '',
    year: '1st Year',
    branch: 'CSE',
    customBranch: '',
    isLab: false,
    creditHours: 3
  });
  
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  useEffect(() => {
    loadSubjects();
  }, []);
  
  const loadSubjects = () => {
    const loadedSubjects = getSubjects();
    setSubjects(loadedSubjects);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (isEditing && editingSubject) {
      setEditingSubject({
        ...editingSubject,
        [name]: value
      });
    } else {
      setNewSubject({
        ...newSubject,
        [name]: value
      });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (isEditing && editingSubject) {
      setEditingSubject({
        ...editingSubject,
        [name]: value
      });
    } else {
      setNewSubject({
        ...newSubject,
        [name]: value
      });
    }
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (isEditing && editingSubject) {
      setEditingSubject({
        ...editingSubject,
        [name]: checked
      });
    } else {
      setNewSubject({
        ...newSubject,
        [name]: checked
      });
    }
  };
  
  const handleSaveSubject = () => {
    try {
      const subjectToSave = isEditing ? editingSubject : newSubject;
      
      if (!subjectToSave) return;
      
      // Validate inputs
      if (!subjectToSave.name.trim()) {
        toast({
          title: "Missing information",
          description: "Subject name is required",
          variant: "destructive",
        });
        return;
      }
      
      // If branch is "Other", ensure customBranch is provided
      if (subjectToSave.branch === 'Other' && !subjectToSave.customBranch.trim()) {
        toast({
          title: "Missing information",
          description: "Custom branch name is required",
          variant: "destructive",
        });
        return;
      }
      
      try {
        const savedSubject = saveSubject({
          ...subjectToSave,
          id: subjectToSave.id || uuidv4()
        });
        
        toast({
          title: isEditing ? "Subject updated" : "Subject added",
          description: isEditing 
            ? `Subject "${savedSubject.name}" has been updated` 
            : `Subject "${savedSubject.name}" has been added`,
          variant: "default",
        });
        
        // Reset form
        setNewSubject({
          id: '',
          name: '',
          year: '1st Year',
          branch: 'CSE',
          customBranch: '',
          isLab: false,
          creditHours: 3
        });
        
        setIsEditing(false);
        setEditingSubject(null);
        
        // Reload subjects
        loadSubjects();
      } catch (error) {
        // Handle subject duplicate error
        toast({
          title: "Duplicate Subject",
          description: error instanceof Error ? error.message : "This subject already exists",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the subject",
        variant: "destructive",
      });
    }
  };
  
  const handleEditSubject = (subject: Subject) => {
    setIsEditing(true);
    setEditingSubject({...subject});
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingSubject(null);
  };
  
  const handleDeleteSubject = (id: string) => {
    try {
      deleteSubject(id);
      
      toast({
        title: "Subject deleted",
        description: "The subject has been deleted",
        variant: "default",
      });
      
      // Reload subjects
      loadSubjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the subject",
        variant: "destructive",
      });
    }
  };
  
  // Filter subjects based on selected filters and search query
  const filteredSubjects = subjects
    .filter(subject => filterYear === 'all' || subject.year === filterYear)
    .filter(subject => {
      if (filterBranch === 'all') return true;
      if (filterBranch === 'Other') return subject.branch === 'Other';
      return subject.branch === filterBranch || subject.branch === 'All';
    })
    .filter(subject => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        subject.name.toLowerCase().includes(query) ||
        subject.year.toLowerCase().includes(query) ||
        subject.branch.toLowerCase().includes(query) ||
        (subject.customBranch && subject.customBranch.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      // Sort by year, then by branch, then by name
      if (a.year !== b.year) {
        return a.year.localeCompare(b.year);
      }
      if (a.branch !== b.branch) {
        return a.branch.localeCompare(b.branch);
      }
      return a.name.localeCompare(b.name);
    });
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manage Subjects</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Subject' : 'Add New Subject'}</CardTitle>
            <CardDescription>
              {isEditing 
                ? 'Update the details of an existing subject' 
                : 'Add a new subject to the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={isEditing && editingSubject ? editingSubject.name : newSubject.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select 
                  value={isEditing && editingSubject ? editingSubject.year : newSubject.year}
                  onValueChange={(value) => handleSelectChange('year', value)}
                >
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select 
                  value={isEditing && editingSubject ? editingSubject.branch : newSubject.branch}
                  onValueChange={(value) => handleSelectChange('branch', value)}
                >
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Branches</SelectItem>
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="ECE">ECE</SelectItem>
                    <SelectItem value="EEE">EEE</SelectItem>
                    <SelectItem value="CSD">CSD</SelectItem>
                    <SelectItem value="AI & ML">AI & ML</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {((isEditing && editingSubject && editingSubject.branch === 'Other') || 
                (!isEditing && newSubject.branch === 'Other')) && (
                <div className="space-y-2">
                  <Label htmlFor="customBranch">Custom Branch Name</Label>
                  <Input
                    id="customBranch"
                    name="customBranch"
                    value={isEditing && editingSubject ? editingSubject.customBranch : newSubject.customBranch}
                    onChange={handleInputChange}
                    placeholder="e.g., BIOTECH"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="creditHours">Credit Hours</Label>
                <Input
                  id="creditHours"
                  name="creditHours"
                  type="number"
                  min="1"
                  max="6"
                  value={isEditing && editingSubject ? editingSubject.creditHours : newSubject.creditHours}
                  onChange={(e) => handleInputChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: e.target.name,
                      value: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-8">
                <Checkbox 
                  id="isLab" 
                  checked={isEditing && editingSubject ? editingSubject.isLab : newSubject.isLab}
                  onCheckedChange={(checked) => handleCheckboxChange('isLab', checked === true)}
                />
                <Label htmlFor="isLab">This is a lab subject</Label>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              {isEditing && (
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              )}
              <Button onClick={handleSaveSubject}>
                {isEditing ? 'Update Subject' : 'Add Subject'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Subject List</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                <SelectItem value="Other">Custom Branches</SelectItem>
              </SelectContent>
            </Select>
            
            <Input 
              type="search" 
              placeholder="Search subjects..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No subjects found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try changing your filters or add a new subject.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSubjects.map((subject) => (
                <div 
                  key={subject.id} 
                  className="flex items-center justify-between p-4 border rounded-md"
                >
                  <div>
                    <div className="font-medium">
                      {subject.name} 
                      {subject.isLab && <span className="ml-2 text-primary text-sm">(Lab)</span>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {subject.year}, {subject.branch === 'Other' ? subject.customBranch : subject.branch}, 
                      {subject.creditHours} credit {subject.creditHours === 1 ? 'hour' : 'hours'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSubject(subject)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{subject.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageSubjects;
