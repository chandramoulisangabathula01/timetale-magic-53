
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AdminDashboard from '@/components/AdminDashboard';
import FacultyDashboard from '@/components/FacultyDashboard';
import StudentDashboard from '@/components/StudentDashboard';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { userRole } = useAuth();
  
  return (
    <DashboardLayout>
      {userRole === 'admin' && <AdminDashboard />}
      {userRole === 'faculty' && <FacultyDashboard />}
      {userRole === 'student' && <StudentDashboard />}
    </DashboardLayout>
  );
};

export default Dashboard;
