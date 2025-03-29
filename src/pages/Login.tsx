
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { FACULTY_LIST } from '@/utils/timetableUtils';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginAdmin, loginFaculty, loginStudent } = useAuth();
  
  // Admin login state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Faculty login state
  const [selectedFaculty, setSelectedFaculty] = useState('');
  
  // Student login state
  const [studentYear, setStudentYear] = useState('');
  const [studentBranch, setStudentBranch] = useState('');
  const [studentSemester, setStudentSemester] = useState('');
  
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminUsername || !adminPassword) {
      toast({
        title: "Missing credentials",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    const success = loginAdmin(adminUsername, adminPassword);
    
    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome back, admin!",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };
  
  const handleFacultyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFaculty) {
      toast({
        title: "Selection required",
        description: "Please select your name from the faculty list",
        variant: "destructive",
      });
      return;
    }
    
    const success = loginFaculty(selectedFaculty);
    
    if (success) {
      toast({
        title: "Login successful",
        description: `Welcome, ${selectedFaculty}!`,
      });
      navigate('/dashboard');
    }
  };
  
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentYear || !studentBranch || !studentSemester) {
      toast({
        title: "Missing information",
        description: "Please complete all fields",
        variant: "destructive",
      });
      return;
    }
    
    const success = loginStudent(studentYear, studentBranch, studentSemester);
    
    if (success) {
      toast({
        title: "Login successful",
        description: "Redirecting to your timetable...",
      });
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md text-center mb-6">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold mb-1">Automatic Timetable Generation</h1>
        <p className="text-slate-600">College of Engineering</p>
      </div>
      
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle>Login to continue</CardTitle>
          <CardDescription>
            Choose your role to access the timetable system
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4 mx-4">
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="student">Student</TabsTrigger>
          </TabsList>
          
          <TabsContent value="admin">
            <form onSubmit={handleAdminLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminUsername">Username</Label>
                  <Input 
                    id="adminUsername" 
                    placeholder="Enter admin username" 
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password</Label>
                  <Input 
                    id="adminPassword" 
                    type="password" 
                    placeholder="Enter password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">Login as Admin</Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="faculty">
            <form onSubmit={handleFacultyLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facultySelect">Select your name</Label>
                  <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                    <SelectTrigger id="facultySelect">
                      <SelectValue placeholder="Select Faculty Name" />
                    </SelectTrigger>
                    <SelectContent>
                      {FACULTY_LIST.map((faculty) => (
                        <SelectItem key={faculty} value={faculty}>
                          {faculty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">View My Timetable</Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="student">
            <form onSubmit={handleStudentLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="yearSelect">Year</Label>
                  <Select value={studentYear} onValueChange={setStudentYear}>
                    <SelectTrigger id="yearSelect">
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
                  <Label htmlFor="branchSelect">Branch</Label>
                  <Select value={studentBranch} onValueChange={setStudentBranch}>
                    <SelectTrigger id="branchSelect">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="ECE">ECE</SelectItem>
                      <SelectItem value="EEE">EEE</SelectItem>
                      <SelectItem value="CSD">CSD</SelectItem>
                      <SelectItem value="AI & ML">AI & ML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="semesterSelect">Semester</Label>
                  <Select value={studentSemester} onValueChange={setStudentSemester}>
                    <SelectTrigger id="semesterSelect">
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">I</SelectItem>
                      <SelectItem value="II">II</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">View Timetable</Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;
