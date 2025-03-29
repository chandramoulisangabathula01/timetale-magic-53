
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import FacultyDashboard from './FacultyDashboard';
import StudentDashboard from './StudentDashboard';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { userRole, username, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <Logo />
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden md:block">
              Logged in as: <span className="font-medium text-foreground">{username}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        {userRole === 'admin' && <AdminDashboard />}
        {userRole === 'faculty' && <FacultyDashboard />}
        {userRole === 'student' && <StudentDashboard />}
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-6 mt-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Automatic Timetable Generation System | College of Engineering</p>
          <p className="mt-1">© {new Date().getFullYear()} All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
