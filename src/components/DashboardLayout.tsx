
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/images/bgphoto.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: 1
        }}
      />
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] -z-5" />
      <div className="relative flex-1 flex flex-col z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b shadow-md">
          <div className="container mx-auto px-4 h-24 flex items-center justify-between">
            <div className="flex items-center justify-between w-full max-w-4xl">
              <img src="/images/college logo.jpg" alt="College Logo" className="h-16 w-16 object-contain" />
              <div className="text-center px-4">
                <h1 className="text-2xl font-bold mb-1 text-slate-900">University College of Engineering & Technology for Women</h1>
                <p className="text-slate-700">Kakatiya University, Warangal-506009</p>
              </div>
              <img src="/images/NAAC-Logo-250x250.png" alt="NAAC Logo" className="h-16 w-16 object-contain" />
            </div>
            
            <div className="flex items-center gap-4 ml-4">
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
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-white/90 backdrop-blur-sm border-t py-6 mt-10 shadow-md">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p> University College of Engineering & Technology for Women</p>
            <p className="mt-1">© {new Date().getFullYear()} All Rights Reserved</p>
          </div>
        </footer>
      </div>
    </div>
    
  );
};

export default DashboardLayout;
