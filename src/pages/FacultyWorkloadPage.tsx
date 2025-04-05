
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import FacultyWorkloadView from '@/components/FacultyWorkloadView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const FacultyWorkloadPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [showOnlyAvailable, setShowOnlyAvailable] = React.useState(false);
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, userRole, navigate]);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-white rounded-full p-2">Faculty Workload Management</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Subject Assignment Limits</CardTitle>
              <CardDescription>
                Monitor and manage teaching workloads across all departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">About Faculty Workload Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Each faculty member can be assigned a maximum of 3 subjects across all timetables
                    to ensure balanced workloads and teaching quality. This dashboard helps you track
                    current assignments and available capacity for each faculty member.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showOnlyAvailable"
                      checked={showOnlyAvailable}
                      onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="showOnlyAvailable">Show only available faculty</label>
                  </div>
                  
                  <Button variant="outline" className="flex items-center gap-2" disabled>
                    <Download className="h-4 w-4" />
                    Export Workload Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <FacultyWorkloadView onlyShowAvailable={showOnlyAvailable} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyWorkloadPage;
