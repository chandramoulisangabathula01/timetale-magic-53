
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTimetableForm from '@/components/CreateTimetableForm';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

const CreateTimetable = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
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
        <CreateTimetableForm />
      </div>
    </DashboardLayout>
  );
};

export default CreateTimetable;
