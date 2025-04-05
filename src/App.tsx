
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppRoutes from './routes'; // Changed from importing 'routes'
import { useAuth } from './contexts/AuthContext';
import './App.css';
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import NotFound from './pages/NotFound';
import { initializeSampleData } from './integration/timetableIntegration';

function App() {
  const { isAuthenticated } = useAuth();
  
  // Initialize sample data when the app starts
  useEffect(() => {
    initializeSampleData();
  }, []);

  return (
    <>
      <AppRoutes />
      <Toaster />
      <Sonner />
    </>
  );
}

export default App;
