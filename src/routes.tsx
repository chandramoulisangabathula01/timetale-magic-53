
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import CreateTimetable from './pages/CreateTimetable';
import ViewTimetablePage from './pages/ViewTimetablePage';
import EditTimetable from './pages/EditTimetable';
import ManageFaculty from './pages/ManageFaculty';
import ManageSubjects from './pages/ManageSubjects';
import AdminSettingsPage from './pages/AdminSettingsPage';
import FacultyWorkload from './pages/FacultyWorkload';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = ['admin', 'faculty', 'student'] 
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[] 
}) => {
  const { isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create-timetable" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CreateTimetable />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/view-timetable/:id" 
        element={
          <ProtectedRoute>
            <ViewTimetablePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/edit-timetable/:id" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EditTimetable />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manage-faculty" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageFaculty />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manage-subjects" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageSubjects />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-settings" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSettingsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/faculty-workload" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FacultyWorkload />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
