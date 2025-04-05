
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { getAllFacultyWorkloads, FacultyWorkload, MAX_FACULTY_SUBJECTS } from '@/utils/facultyWorkloadUtils';

interface FacultyWorkloadViewProps {
  onlyShowAvailable?: boolean;
}

const FacultyWorkloadView: React.FC<FacultyWorkloadViewProps> = ({ 
  onlyShowAvailable = false 
}) => {
  const [facultyWorkloads, setFacultyWorkloads] = React.useState<FacultyWorkload[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  React.useEffect(() => {
    const workloads = getAllFacultyWorkloads();
    setFacultyWorkloads(workloads);
  }, []);
  
  const filteredWorkloads = facultyWorkloads.filter(faculty => {
    if (onlyShowAvailable && !faculty.isAvailable) return false;
    if (searchQuery && !faculty.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faculty Workload Status</CardTitle>
        <CardDescription>
          Each faculty member can teach up to {MAX_FACULTY_SUBJECTS} subjects across all years
        </CardDescription>
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search faculty..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredWorkloads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No faculty found matching your search." : "No faculty information available."}
            </div>
          ) : (
            filteredWorkloads.map((faculty) => (
              <div key={faculty.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg">
                <div className="mb-2 md:mb-0">
                  <div className="font-medium flex flex-wrap items-center gap-2">
                    <span>{faculty.name}</span>
                    {faculty.shortName && <span className="text-xs text-muted-foreground">({faculty.shortName})</span>}
                    <Badge 
                      variant={faculty.isAvailable ? "outline" : "destructive"} 
                      className="ml-2"
                    >
                      {faculty.isAvailable ? "Available" : "Full"}
                    </Badge>
                  </div>
                </div>
                <div className="w-full md:w-1/2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Assigned: {faculty.assignedSubjects} subjects</span>
                    <span>Remaining: {faculty.remainingCapacity} subjects</span>
                  </div>
                  <Progress 
                    value={(faculty.assignedSubjects / MAX_FACULTY_SUBJECTS) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FacultyWorkloadView;
