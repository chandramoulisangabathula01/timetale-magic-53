
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CreateTimetableForm from '@/components/CreateTimetableForm';
import { useAuth } from '@/contexts/AuthContext';
import { getTimetableById } from '@/utils/timetableUtils';
import { Timetable } from '@/utils/types';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const EditTimetable = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [timetable, setTimetable] = useState<Timetable | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    setIsLoading(true);
    
    if (id) {
      const existingTimetable = getTimetableById(id);
      if (existingTimetable) {
        setTimetable(existingTimetable);
      } else {
        navigate('/dashboard');
      }
    }
    
    setIsLoading(false);
  }, [isAuthenticated, userRole, navigate, id]);
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center space-y-3">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground">Loading timetable...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!timetable) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4 p-6">
                <AlertCircle className="h-6 w-6 text-destructive mt-1" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Timetable not found</h3>
                  <p className="text-sm text-muted-foreground">
                    The timetable you're trying to edit could not be found. It may have been deleted or does not exist.
                  </p>
                  <Button className="mt-4" onClick={() => navigate('/dashboard')}>
                    Go Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Edit Timetable</h1>
        {timetable && <CreateTimetableForm existingTimetable={timetable} />}
      </div>
    </DashboardLayout>
  );
};

export default EditTimetable;
