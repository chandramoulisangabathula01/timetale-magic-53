
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSettings from '@/components/AdminSettings';
import DashboardLayout from '@/components/DashboardLayout';

const AdminSettingsPage: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else if (userRole !== 'admin') {
      navigate('/dashboard');
    }
    
    // Initialize admin user in localStorage if not exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminExists = users.some((user: any) => user.role === 'admin');
    
    if (!adminExists) {
      // Add default admin user if none exists
      users.push({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, [isAuthenticated, userRole, navigate]);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <AdminSettings />
      </div>
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
