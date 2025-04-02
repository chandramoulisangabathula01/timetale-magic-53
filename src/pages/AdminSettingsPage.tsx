
/**
 * AdminSettingsPage Component
 * 
 * This component serves as the main admin settings page in the application.
 * It provides a protected route that can only be accessed by authenticated administrators.
 * The page wraps the AdminSettings component within the DashboardLayout for consistent UI.
 */

// Import necessary dependencies
import React, { useEffect } from 'react';  // React core and hooks
import { useNavigate } from 'react-router-dom';  // Navigation utility
import { useAuth } from '@/contexts/AuthContext';  // Authentication context
import AdminSettings from '@/components/AdminSettings';  // Admin settings UI component
import DashboardLayout from '@/components/DashboardLayout';  // Layout wrapper component

const AdminSettingsPage = () => {
  // Get authentication state and user role from auth context
  const { isAuthenticated, userRole } = useAuth();
  // Hook for programmatic navigation
  const navigate = useNavigate();
  
  /**
   * Authentication and Authorization Check
   * 
   * This effect runs when authentication status or user role changes.
   * It ensures that:
   * 1. Only authenticated users can access this page
   * 2. Only users with 'admin' role can view the settings
   * 
   * Unauthorized users are redirected appropriately:
   * - Unauthenticated users -> Home page
   * - Non-admin users -> Dashboard
   */
  useEffect(() => {
    // Redirect unauthenticated users to home page
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Redirect non-admin users to dashboard
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, userRole, navigate]);
  
  /**
   * Component Render
   * 
   * Wraps the AdminSettings component within the DashboardLayout
   * Uses container class for proper spacing and padding
   */
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <AdminSettings />
      </div>
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
