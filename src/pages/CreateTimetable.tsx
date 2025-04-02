
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTimetableForm from '@/components/CreateTimetableForm';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { initializeDefaultSubjects } from '@/utils/subjectsUtils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * CreateTimetable Component
 * 
 * This page component allows administrators to create new timetables.
 * It handles authentication checks, initializes default subjects if needed,
 * and provides a form interface for timetable creation.
 */
const CreateTimetable = () => {
  // Authentication and navigation hooks
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize default subjects if none exist
    // This ensures that new timetables have a set of standard subjects available
    initializeDefaultSubjects();
    
    // Redirect unauthenticated users to home page
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Restrict access to admin users only
    // Only administrators can create new timetables
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, userRole, navigate]);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header with title and back button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl bg-white p-4 rounded-full font-bold">Create Timetable</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        {/* Render the timetable creation form */}
        <CreateTimetableForm />
      </div>
    </DashboardLayout>
  );
};

export default CreateTimetable;
