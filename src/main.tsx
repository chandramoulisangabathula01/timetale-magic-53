
import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App.tsx';
import './index.css';

// Create root element without any router here - the router is defined in App.tsx
const root = createRoot(document.getElementById("root")!);

// Render the app without StrictMode to avoid any potential issues with React Router
root.render(<App />);
