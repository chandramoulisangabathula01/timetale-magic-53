import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getSubjects, 
  addSubject, 
  updateSubject, 
  deleteSubject,
  initializeDefaultSubjects,
  SubjectData
} from '@/utils/subjectsUtils';
import { YearType, BranchType } from '@/utils/types';

const ManageSubjects = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<SubjectData[]>([]);
  const [newSubject, setNewSubject] = useState<string>('');
  const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null);
  const [filterYear, setFilterYear] = useState<YearType | 'all'>('all');
  const [filterBranch, setFilterBranch] = useState<BranchType | 'all'>('all');
  const [subjectYear, setSubjectYear] = useState<YearType>('1st Year');
  const [subjectBranch, setSubjectBranch] = useState<BranchType>('CSE');
  const [customBranch, setCustomBranch] = useState<string>('');
  
  useEffect(() => {
    // Make sure we have default subjects
    initializeDefaultSubjects();
    
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    // Load subjects from storage
    setSubjects(getSubjects());
  }, [isAuthenticated, userRole, navigate]);
  
  useEffect(() => {
    // Apply filters
    let filtered = [...subjects];
    
    if (filterYear !== 'all') {
      filtered = filtered.filter(subject => 
        subject.years && Array.isArray(subject.years) && subject.years.includes(filterYear)
      );
    }
    
    if (filterBranch !== 'all') {
      filtered = filtered.filter(subject => 
        (subject.branches && Array.isArray(subject.branches) && subject.branches.includes(filterBranch as BranchType)) ||
        (filterBranch === 'Other' && subject.customBranch)
      );
    }
    
    setFilteredSubjects(filtered);
  }, [subjects, filterYear, filterBranch]);
  
  const handleAddSubject = () => {
    if (!newSubject.trim()) {
      toast({
        title: "Subject name required",
        description: "Please enter a subject name",
        variant: "destructive",
      });
      return;
    }
    
    if (subjectBranch === 'Other' && !customBranch.trim()) {
      toast({
        title: "Custom branch required",
        description: "Please enter a custom branch name",
        variant: "destructive",
      });
      return;
    }
    
    // Check for duplicate subject name in the same year and branch
    const branchToCheck = subjectBranch === 'Other' ? customBranch : subjectBranch;
    
    const isDuplicate = subjects.some(
      subject => 
        subject.name.toLowerCase() === newSubject.toLowerCase() && 
        subject.years && 
        subject.years.includes(subjectYear) && 
        ((subject.branches && subject.branches.includes(branchToCheck as any)) ||
         (subject.customBranch && subject.customBranch === customBranch))
    );
    
    if (isDuplicate) {
      toast({
        title: "Duplicate subject",
        description: `"${newSubject}" already exists for ${subjectYear}, ${branchToCheck}`,
        variant: "destructive",
      });
      return;
    }
    
    const newSubjectData: SubjectData = {
      id: Date.now().toString(),
      name: newSubject,
      code: '',
      credits: 0,
      years: [subjectYear],
      branches: subjectBranch === 'Other' ? [] : [subjectBranch],
      customBranch: subjectBranch === 'Other' ? customBranch : undefined,
      isLab: newSubject.toLowerCase().includes('lab')
    };
    
    // Add subject to storage
    addSubject(newSubjectData);
    
    // Update state
    setSubjects(getSubjects());
    setNewSubject('');
    setCustomBranch('');
    
    toast({
      title: "Subject added",
      description: `"${newSubject}" has been added successfully",
    });
  };
  
  const handleUpdateSubject = () => {
    if (!editingSubject || !editingSubject.name.trim()) {
      toast({
        title: "Subject name required",
        description: "Please enter a subject name",
        variant: "destructive",
      });
      return;
    }
    
    // Check for duplicate subject name in the same year and branch
    const isDuplicate = subjects.some(
      subject => 
        subject.id !== editingSubject.id &&
        subject.name.toLowerCase() === editingSubject.name.toLowerCase() && 
        subject.years &&
        Array.isArray(subject.years) &&
        editingSubject.years &&
        Array.isArray(editingSubject.years) &&
        subject.years.some(y => editingSubject.years.includes(y)) && 
        ((subject.branches && Array.isArray(subject.branches) &&
         editingSubject.branches && Array.isArray(editingSubject.branches) &&
         subject.branches.some(b => editingSubject.branches.includes(b))) ||
         (subject.customBranch === editingSubject.customBranch &&
          subject.customBranch !== undefined))
    );
    
    if (isDuplicate) {
      toast({
        title: "Duplicate subject",
        description: `"${editingSubject.name}" already exists for the selected years and branches`,
        variant: "destructive",
      });
      return;
    }
    
    // Update subject in storage
    updateSubject(editingSubject);
    
    // Update state
    setSubjects(getSubjects());
    setEditingSubject(null);
    
    toast({
      title: "Subject updated",
      description: `"${editingSubject.name}" has been updated successfully",
    });
  };
  
  const handleDeleteSubject = (id: string) => {
    // Delete subject from storage
    deleteSubject(id);
    
    // Update state
    setSubjects(getSubjects());
    
    toast({
      title: "Subject deleted",
      description: "The subject has been deleted successfully",
    });
  };
  
  const handleEditSubject = (subject: SubjectData) => {
    setEditingSubject(subject);
  };
  
  const handleCancelEdit = () => {
    setEditingSubject(null);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Subjects</h1>
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Add New Subject</CardTitle>
              <CardDescription>
                Create subjects categorized by year and branch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input
                  id="subjectName"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g., Mathematics or Physics Lab"
                />
                <p className="text-xs text-muted-foreground">
                  Add "lab" suffix for lab subjects (e.g., Physics Lab)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subjectYear">Year</Label>
                <Select 
                  value={subjectYear} 
                  onValueChange={(value) => setSubjectYear(value as YearType)}
                >
                  <SelectTrigger id="subjectYear">
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
                <Label htmlFor="subjectBranch">Branch</Label>
                <Select 
                  value={subjectBranch} 
                  onValueChange={(value) => setSubjectBranch(value as BranchType)}
                >
                  <SelectTrigger id="subjectBranch">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="ECE">ECE</SelectItem>
                    <SelectItem value="EEE">EEE</SelectItem>
                    <SelectItem value="CSD">CSD</SelectItem>
                    <SelectItem value="AI & ML">AI & ML</SelectItem>
                    <SelectItem value="Other">Custom Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {subjectBranch === 'Other' && (
                <div className="space-y-2">
                  <Label htmlFor="customBranch">Custom Branch Name</Label>
                  <Input
                    id="customBranch"
                    value={customBranch}
                    onChange={(e) => setCustomBranch(e.target.value)}
                    placeholder="e.g., MECH, AERO, BIOTECH"
                  />
                </div>
              )}
              
              <Button 
                onClick={handleAddSubject}
                className="w-full"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Subject
              </Button>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Subject List</CardTitle>
              <CardDescription>
                View, edit and delete subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/2">
                    <Label htmlFor="filterYear">Filter by Year</Label>
                    <Select 
                      value={filterYear} 
                      onValueChange={(value) => setFilterYear(value as YearType | 'all')}
                    >
                      <SelectTrigger id="filterYear">
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
                  </div>
                  
                  <div className="md:w-1/2">
                    <Label htmlFor="filterBranch">Filter by Branch</Label>
                    <Select 
                      value={filterBranch} 
                      onValueChange={(value) => setFilterBranch(value as BranchType | 'all')}
                    >
                      <SelectTrigger id="filterBranch">
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
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                {filteredSubjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No subjects found. Add some subjects or change your filters.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSubjects.map((subject) => (
                      <div 
                        key={subject.id}
                        className={`p-3 rounded-md border ${
                          editingSubject?.id === subject.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        }`}
                      >
                        {editingSubject?.id === subject.id ? (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor={`edit-subject-${subject.id}`}>Subject Name</Label>
                              <Input
                                id={`edit-subject-${subject.id}`}
                                value={editingSubject.name}
                                onChange={(e) => setEditingSubject({
                                  ...editingSubject,
                                  name: e.target.value,
                                  isLab: e.target.value.toLowerCase().includes('lab')
                                })}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label htmlFor={`edit-year-${subject.id}`}>Year</Label>
                                <Select 
                                  value={editingSubject.years && editingSubject.years.length > 0 ? editingSubject.years[0] : '1st Year'} 
                                  onValueChange={(value) => setEditingSubject({
                                    ...editingSubject,
                                    years: [value as YearType]
                                  })}
                                >
                                  <SelectTrigger id={`edit-year-${subject.id}`}>
                                    <SelectValue />
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
                                <Label htmlFor={`edit-branch-${subject.id}`}>Branch</Label>
                                <Select 
                                  value={editingSubject.branches && editingSubject.branches.length > 0 ? editingSubject.branches[0] : 'CSE'} 
                                  onValueChange={(value) => setEditingSubject({
                                    ...editingSubject,
                                    branches: [value as BranchType]
                                  })}
                                >
                                  <SelectTrigger id={`edit-branch-${subject.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
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
                                onClick={handleUpdateSubject}
                              >
                                <Save className="mr-1 h-3 w-3" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{subject.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {subject.years && subject.years.length > 0 ? subject.years[0] : 'N/A'}, 
                                {subject.branches && subject.branches.length > 0 
                                  ? subject.branches[0] 
                                  : (subject.customBranch ? subject.customBranch : 'N/A')}
                                {subject.isLab && <span className="ml-2 text-primary">Lab</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSubject(subject)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSubject(subject.id)}
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

export default ManageSubjects;
