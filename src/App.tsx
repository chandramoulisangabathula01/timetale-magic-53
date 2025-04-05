
import React from 'react';
import './App.css';
import { Toaster } from './components/ui/toaster';
import AppRoutes from './routes';

function App() {
  return (
    <div className="min-h-screen">
      <AppRoutes />
      <Toaster />
    </div>
  );
}

export default App;
