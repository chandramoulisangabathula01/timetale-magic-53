
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ViewTimetable from '@/components/ViewTimetable';
import DashboardLayout from '@/components/DashboardLayout';

const ViewTimetablePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <ViewTimetable />
      </div>
    </DashboardLayout>
  );
};

export default ViewTimetablePage;
