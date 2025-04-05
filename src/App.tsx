
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';
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
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.protected && !isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                route.element
              )
            }
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <Sonner />
    </>
  );
}

export default App;
