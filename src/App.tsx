
import React from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import AppRoutes from './routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen">
          <AppRoutes />
          <Toaster />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
