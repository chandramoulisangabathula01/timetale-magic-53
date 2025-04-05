
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { getFacultyWorkloadInfo } from '@/utils/facultyWorkloadUtils';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

interface FacultyWorkloadProps {}

const FacultyWorkload: React.FC<FacultyWorkloadProps> = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [facultyWorkload, setFacultyWorkload] = useState([]);
  
  useEffect(() => {
    // Redirect non-admin users
    if (!isAuthenticated || userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    // Get faculty workload information
    const workloadInfo = getFacultyWorkloadInfo();
    setFacultyWorkload(workloadInfo);
  }, [isAuthenticated, userRole, navigate]);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl bg-white rounded-full p-4 font-bold">Faculty Workload Overview</h1>
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
          <CardHeader className="pb-3">
            <CardTitle>Faculty Subject Assignment</CardTitle>
            <CardDescription>
              Each faculty member can be assigned a maximum of 3 subjects across all timetables.
              This overview helps you quickly identify which faculty members are available for new assignments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Faculty workload as of {new Date().toLocaleDateString()}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty Name</TableHead>
                  <TableHead>Short Name</TableHead>
                  <TableHead className="text-center">Assigned Subjects</TableHead>
                  <TableHead className="text-center">Remaining Capacity</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facultyWorkload.map((faculty) => (
                  <TableRow key={faculty.id}>
                    <TableCell className="font-medium">{faculty.name}</TableCell>
                    <TableCell>{faculty.shortName}</TableCell>
                    <TableCell className="text-center">{faculty.assignedSubjects}</TableCell>
                    <TableCell className="text-center">{faculty.remainingCapacity}</TableCell>
                    <TableCell className="text-center">
                      {faculty.isAvailable ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                          Fully Assigned
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FacultyWorkload;
