
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTimetableForm from '@/components/CreateTimetableForm';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { initializeDefaultSubjects } from '@/utils/subjectsUtils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CreateTimetable = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize default subjects if none exist
    initializeDefaultSubjects();
    
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
          <h1 className="text-2xl font-bold">Create Timetable</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <CreateTimetableForm />
      </div>
    </DashboardLayout>
  );
};

export default CreateTimetable;
