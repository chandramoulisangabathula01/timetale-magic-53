
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import FacultyDashboard from '@/components/FacultyDashboard';
import StudentDashboard from '@/components/StudentDashboard';
import DashboardLayout from '@/components/DashboardLayout';

const Dashboard = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Update CSS to fix printing styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .print-timetable {
          width: 100% !important;
          overflow: visible !important;
        }
        .print-timetable table {
          width: 100% !important;
          page-break-inside: avoid;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <DashboardLayout>
      <>
        {userRole === 'admin' && <AdminDashboard />}
        {userRole === 'faculty' && <FacultyDashboard />}
        {userRole === 'student' && <StudentDashboard />}
      </>
    </DashboardLayout>
  );
};

export default Dashboard;
