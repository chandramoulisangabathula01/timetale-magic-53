
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AdminDashboard from '@/components/AdminDashboardPatch';
import FacultyDashboard from '@/components/FacultyDashboardPatch';
import StudentDashboard from '@/components/StudentDashboardPatch';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { userRole, isAuthenticated } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Return the appropriate dashboard based on user role
  return (
    <DashboardLayout>
      {userRole === 'admin' && <AdminDashboard />}
      {userRole === 'faculty' && <FacultyDashboard />}
      {userRole === 'student' && <StudentDashboard />}
    </DashboardLayout>
  );
};

export default Dashboard;
