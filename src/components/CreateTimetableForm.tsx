
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, AlertCircle, Plus, Trash2, Edit } from 'lucide-react';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { 
  YearType, 
  SemesterType, 
  BranchType, 
  Day, 
  FreeHourType, 
  SubjectTeacherPair,
  TimetableFormData,
  Timetable
} from '@/utils/types';
import { generateTimetable, saveTimetable, countNonLabSubjectsForTeacher } from '@/utils/timetableUtils';

interface CreateTimetableFormProps {
  existingTimetable?: Timetable;
}

const CreateTimetableForm: React.FC<CreateTimetableFormProps> = ({ existingTimetable }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!existingTimetable;
  
  // Form data state
  const [formData, setFormData] = useState<TimetableFormData>(
    existingTimetable?.formData || {
      year: '1st Year' as YearType,
      semester: 'I' as SemesterType,
      branch: 'CSE' as BranchType,
      customBranch: '',
      courseName: 'B.Tech',
      roomNumber: '',
      academicYear: '',
      classInchargeName: '',
      mobileNumber: '',
      date: new Date().toISOString().split('T')[0],
      subjectTeacherPairs: [],
      freeHours: [
        { type: 'Library' as FreeHourType }
      ],
      dayOptions: {
        fourContinuousDays: true,
        useCustomDays: false,
        selectedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'] as Day[]
      }
    }
  );
  
  // New subject-teacher pair state
  const [newSubject, setNewSubject] = useState('');
  const [newTeacher, setNewTeacher] = useState('');
  const [isLabSubject, setIsLabSubject] = useState(false);
  const [batchNumber, setBatchNumber] = useState('');
  
  // New free hour state
  const [newFreeHourType, setNewFreeHourType] = useState<FreeHourType>('Library');
  const [customFreeHourType, setCustomFreeHourType] = useState('');
  const [mergeFreeSlots, setMergeFreeSlots] = useState(false);
  
  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  
  // Handle input change for academic details
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user selects
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Add a new subject-teacher pair
  const handleAddSubjectTeacherPair = () => {
    if (!newSubject.trim() || !newTeacher.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both subject and teacher name",
        variant: "destructive",
      });
      return;
    }
    
    // Check if teacher is already assigned to 3 non-lab subjects
    if (!isLabSubject && countNonLabSubjectsForTeacher(newTeacher, formData.subjectTeacherPairs) >= 3) {
      toast({
        title: "Teacher limit reached",
        description: "This teacher is already allotted for 3 non-lab subjects",
        variant: "destructive",
      });
      return;
    }
    
    // Validate batch number for lab subjects
    if (isLabSubject && !batchNumber.trim()) {
      toast({
        title: "Missing batch number",
        description: "Please specify a batch number for lab subjects",
        variant: "destructive",
      });
      return;
    }
    
    const newPair: SubjectTeacherPair = {
      id: uuidv4(),
      subjectName: newSubject,
      teacherName: newTeacher,
      isLab: isLabSubject,
      batchNumber: isLabSubject ? batchNumber : undefined
    };
    
    setFormData(prev => ({
      ...prev,
      subjectTeacherPairs: [...prev.subjectTeacherPairs, newPair]
    }));
    
    // Reset inputs
    setNewSubject('');
    setNewTeacher('');
    setIsLabSubject(false);
    setBatchNumber('');
  };
  
  // Remove a subject-teacher pair
  const handleRemoveSubjectTeacherPair = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subjectTeacherPairs: prev.subjectTeacherPairs.filter(pair => pair.id !== id)
    }));
  };
  
  // Add a new free hour type
  const handleAddFreeHour = () => {
    // Validate custom type if "Others" is selected
    if (newFreeHourType === 'Others' && !customFreeHourType.trim()) {
      toast({
        title: "Missing information",
        description: "Please specify the custom free hour type",
        variant: "destructive",
      });
      return;
    }
    
    const newFreeHour = {
      type: newFreeHourType,
      customType: newFreeHourType === 'Others' ? customFreeHourType : undefined,
      mergeSlots: mergeFreeSlots
    };
    
    setFormData(prev => ({
      ...prev,
      freeHours: [...prev.freeHours, newFreeHour]
    }));
    
    // Reset inputs
    setNewFreeHourType('Library');
    setCustomFreeHourType('');
    setMergeFreeSlots(false);
  };
  
  // Remove a free hour type
  const handleRemoveFreeHour = (index: number) => {
    setFormData(prev => ({
      ...prev,
      freeHours: prev.freeHours.filter((_, i) => i !== index)
    }));
  };
  
  // Handle day option changes
  const handleDayOptionChange = (option: 'fourContinuousDays' | 'useCustomDays', value: boolean) => {
    setFormData(prev => ({
      ...prev,
      dayOptions: {
        ...prev.dayOptions,
        [option]: value,
        // If selecting four continuous days, disable custom days
        ...(option === 'fourContinuousDays' && value ? { useCustomDays: false } : {}),
        // If selecting custom days, disable four continuous days
        ...(option === 'useCustomDays' && value ? { fourContinuousDays: false } : {})
      }
    }));
  };
  
  // Toggle a day in the custom days selection
  const toggleCustomDay = (day: Day) => {
    setFormData(prev => {
      const isSelected = prev.dayOptions.selectedDays.includes(day);
      return {
        ...prev,
        dayOptions: {
          ...prev.dayOptions,
          selectedDays: isSelected
            ? prev.dayOptions.selectedDays.filter(d => d !== day)
            : [...prev.dayOptions.selectedDays, day]
        }
      };
    });
  };
  
  // Validate the current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 0) {
      // Validate academic details
      if (!formData.year) newErrors.year = "Year is required";
      if (!formData.semester) newErrors.semester = "Semester is required";
      if (!formData.branch) newErrors.branch = "Branch is required";
      if (formData.branch === 'Other' && !formData.customBranch) {
        newErrors.customBranch = "Custom branch name is required";
      }
      if (!formData.courseName) newErrors.courseName = "Course name is required";
      if (!formData.roomNumber) newErrors.roomNumber = "Room number is required";
      if (!formData.academicYear) newErrors.academicYear = "Academic year is required";
      if (!formData.classInchargeName) newErrors.classInchargeName = "Class incharge name is required";
      if (!formData.mobileNumber) newErrors.mobileNumber = "Mobile number is required";
      if (formData.mobileNumber && formData.mobileNumber.length < 10) {
        newErrors.mobileNumber = "Mobile number must be at least 10 digits";
      }
      if (!formData.date) newErrors.date = "Date is required";
    }
    else if (currentStep === 1) {
      // Validate subject-teacher pairs
      if (formData.subjectTeacherPairs.length === 0) {
        newErrors.subjectTeacherPairs = "At least one subject-teacher pair is required";
      }
    }
    else if (currentStep === 2) {
      // Validate free hours
      if (formData.freeHours.length === 0) {
        newErrors.freeHours = "At least one free hour type is required";
      }
      
      // Validate day options for 4th year
      if (formData.year === '4th Year' && formData.dayOptions.useCustomDays && formData.dayOptions.selectedDays.length === 0) {
        newErrors.selectedDays = "Please select at least one day";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Move to next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Move to previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Generate timetable and save
  const handleGenerateTimetable = () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    try {
      // Generate the timetable
      const newTimetable = generateTimetable(formData);
      
      // If in edit mode, preserve the original ID
      if (isEditMode && existingTimetable) {
        newTimetable.id = existingTimetable.id;
        newTimetable.createdAt = existingTimetable.createdAt;
      }
      
      // Save the timetable
      saveTimetable(newTimetable);
      
      toast({
        title: isEditMode ? "Timetable updated" : "Timetable created",
        description: isEditMode 
          ? "The timetable has been successfully updated" 
          : "The timetable has been successfully generated",
      });
      
      // Navigate to view the new timetable
      navigate(`/view-timetable/${newTimetable.id}`);
    } catch (error) {
      console.error("Error generating timetable:", error);
      toast({
        title: "Error",
        description: "An error occurred while generating the timetable. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Timetable' : 'Create New Timetable'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode 
            ? 'Update the timetable details below' 
            : 'Fill in the required information to generate a new timetable'}
        </p>
      </div>
      
      <div className="space-y-8">
        <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="0" disabled={currentStep < 0}>
              Academic Details
            </TabsTrigger>
            <TabsTrigger value="1" disabled={currentStep < 1}>
              Subjects & Teachers
            </TabsTrigger>
            <TabsTrigger value="2" disabled={currentStep < 2}>
              Scheduling
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="0" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Details</CardTitle>
                <CardDescription>
                  Enter the basic information for this timetable
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select 
                      value={formData.year} 
                      onValueChange={(value) => handleSelectChange('year', value)}
                    >
                      <SelectTrigger id="year" className={errors.year ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.year && <p className="text-sm text-destructive">{errors.year}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select 
                      value={formData.semester} 
                      onValueChange={(value) => handleSelectChange('semester', value)}
                    >
                      <SelectTrigger id="semester" className={errors.semester ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="I">I</SelectItem>
                        <SelectItem value="II">II</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.semester && <p className="text-sm text-destructive">{errors.semester}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select 
                      value={formData.branch} 
                      onValueChange={(value) => handleSelectChange('branch', value)}
                    >
                      <SelectTrigger id="branch" className={errors.branch ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select Branch" />
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
                    {errors.branch && <p className="text-sm text-destructive">{errors.branch}</p>}
                  </div>
                  
                  {formData.branch === 'Other' && (
                    <div className="space-y-2">
                      <Label htmlFor="customBranch">Custom Branch Name</Label>
                      <Input
                        id="customBranch"
                        name="customBranch"
                        placeholder="Enter branch name"
                        value={formData.customBranch}
                        onChange={handleInputChange}
                        className={errors.customBranch ? 'border-destructive' : ''}
                      />
                      {errors.customBranch && <p className="text-sm text-destructive">{errors.customBranch}</p>}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="courseName">Course Name</Label>
                    <Input
                      id="courseName"
                      name="courseName"
                      placeholder="e.g., B.Tech"
                      value={formData.courseName}
                      onChange={handleInputChange}
                      className={errors.courseName ? 'border-destructive' : ''}
                    />
                    {errors.courseName && <p className="text-sm text-destructive">{errors.courseName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      name="roomNumber"
                      placeholder="e.g., 301"
                      value={formData.roomNumber}
                      onChange={handleInputChange}
                      className={errors.roomNumber ? 'border-destructive' : ''}
                    />
                    {errors.roomNumber && <p className="text-sm text-destructive">{errors.roomNumber}</p>}
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      name="academicYear"
                      placeholder="e.g., 2023-2024"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      className={errors.academicYear ? 'border-destructive' : ''}
                    />
                    {errors.academicYear && <p className="text-sm text-destructive">{errors.academicYear}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="classInchargeName">Class Incharge Name</Label>
                    <Input
                      id="classInchargeName"
                      name="classInchargeName"
                      placeholder="e.g., Dr. Vanisree"
                      value={formData.classInchargeName}
                      onChange={handleInputChange}
                      className={errors.classInchargeName ? 'border-destructive' : ''}
                    />
                    {errors.classInchargeName && <p className="text-sm text-destructive">{errors.classInchargeName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input
                      id="mobileNumber"
                      name="mobileNumber"
                      placeholder="e.g., 9876543210"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      className={errors.mobileNumber ? 'border-destructive' : ''}
                    />
                    {errors.mobileNumber && <p className="text-sm text-destructive">{errors.mobileNumber}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={errors.date ? 'border-destructive' : ''}
                    />
                    {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end mt-4">
              <Button onClick={handleNextStep}>Next Step</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="1" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Subjects & Teachers</CardTitle>
                <CardDescription>
                  Add subjects and assign teachers for this timetable
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      For lab subjects, add "lab" at the end of the subject name (e.g., "Physics lab"). 
                      Each teacher can be assigned a maximum of 3 non-lab subjects.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="newSubject">Subject Name</Label>
                      <Input
                        id="newSubject"
                        placeholder="e.g., Mathematics or Physics lab"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newTeacher">Teacher Name</Label>
                      <Input
                        id="newTeacher"
                        placeholder="e.g., Dr. Vanisree"
                        value={newTeacher}
                        onChange={(e) => setNewTeacher(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 pt-7">
                        <Checkbox 
                          id="isLabSubject" 
                          checked={isLabSubject} 
                          onCheckedChange={(checked) => setIsLabSubject(checked === true)}
                        />
                        <Label htmlFor="isLabSubject">This is a lab subject</Label>
                      </div>
                      
                      {isLabSubject && (
                        <div className="space-y-2 mt-2">
                          <Label htmlFor="batchNumber">Batch Number</Label>
                          <Input
                            id="batchNumber"
                            placeholder="e.g., B1"
                            value={batchNumber}
                            onChange={(e) => setBatchNumber(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddSubjectTeacherPair}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Subject
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Added Subjects</h3>
                    {formData.subjectTeacherPairs.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No subjects added yet. Use the form above to add subjects and teachers.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formData.subjectTeacherPairs.map((pair) => (
                          <div 
                            key={pair.id} 
                            className="flex items-center justify-between p-3 border rounded-md"
                          >
                            <div>
                              <div className="font-medium">{pair.subjectName}</div>
                              <div className="text-sm text-muted-foreground">
                                Teacher: {pair.teacherName}
                                {pair.isLab && pair.batchNumber && ` (${pair.batchNumber})`}
                                {pair.isLab && <span className="ml-2 text-primary">Lab</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSubjectTeacherPair(pair.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {errors.subjectTeacherPairs && (
                      <p className="text-sm text-destructive mt-2">{errors.subjectTeacherPairs}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handlePrevStep}>Previous Step</Button>
              <Button onClick={handleNextStep}>Next Step</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="2" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduling Options</CardTitle>
                <CardDescription>
                  Configure free hours and scheduling preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Free Hours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="freeHourType">Type</Label>
                        <Select 
                          value={newFreeHourType} 
                          onValueChange={setNewFreeHourType as (value: string) => void}
                        >
                          <SelectTrigger id="freeHourType">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Library">Library</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Project">Project</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {newFreeHourType === 'Others' && (
                        <div className="space-y-2">
                          <Label htmlFor="customFreeHourType">Specify Type</Label>
                          <Input
                            id="customFreeHourType"
                            placeholder="e.g., Seminar"
                            value={customFreeHourType}
                            onChange={(e) => setCustomFreeHourType(e.target.value)}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mergeFreeSlots" 
                          checked={mergeFreeSlots} 
                          onCheckedChange={(checked) => setMergeFreeSlots(checked === true)}
                        />
                        <Label htmlFor="mergeFreeSlots">Merge continuous slots</Label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mb-4">
                      <Button
                        onClick={handleAddFreeHour}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Free Hour
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.freeHours.map((freeHour, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <div>
                            <div className="font-medium">
                              {freeHour.type === 'Others' && freeHour.customType 
                                ? freeHour.customType 
                                : freeHour.type}
                            </div>
                            {freeHour.mergeSlots && (
                              <div className="text-xs text-muted-foreground">
                                Continuous slots will be merged
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFreeHour(index)}
                            className="h-8 w-8 p-0"
                            disabled={formData.freeHours.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {errors.freeHours && (
                      <p className="text-sm text-destructive mt-2">{errors.freeHours}</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-3">Day Options</h3>
                    
                    {formData.year === '4th Year' && (
                      <div className="space-y-4">
                        <Alert variant="outline" className="bg-muted/50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>4th Year Scheduling</AlertTitle>
                          <AlertDescription>
                            For 4th year timetables, you can choose between different scheduling options.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="fourContinuousDays" 
                              checked={formData.dayOptions.fourContinuousDays} 
                              onCheckedChange={(checked) => handleDayOptionChange('fourContinuousDays', checked === true)}
                            />
                            <Label htmlFor="fourContinuousDays">Use 4 continuous days (Mon-Thu)</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="useCustomDays" 
                              checked={formData.dayOptions.useCustomDays} 
                              onCheckedChange={(checked) => handleDayOptionChange('useCustomDays', checked === true)}
                            />
                            <Label htmlFor="useCustomDays">Use custom day selection</Label>
                          </div>
                        </div>
                        
                        {formData.dayOptions.useCustomDays && (
                          <div className="space-y-2 p-3 border rounded-md">
                            <Label>Select Days</Label>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                                <div key={day} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`day-${day}`}
                                    checked={formData.dayOptions.selectedDays.includes(day as Day)}
                                    onCheckedChange={(checked) => toggleCustomDay(day as Day)}
                                  />
                                  <Label htmlFor={`day-${day}`}>{day}</Label>
                                </div>
                              ))}
                            </div>
                            {errors.selectedDays && (
                              <p className="text-sm text-destructive mt-2">{errors.selectedDays}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {formData.year !== '4th Year' && (
                      <p className="text-muted-foreground">
                        Standard 6-day schedule (Monday to Saturday) will be used for {formData.year} timetables.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handlePrevStep}>Previous Step</Button>
              <Button onClick={handleGenerateTimetable}>
                {isEditMode ? 'Update Timetable' : 'Generate Timetable'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateTimetableForm;
