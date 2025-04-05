
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import AuthProvider from './contexts/AuthContext';
import CreateTimetable from './pages/CreateTimetable';
import ViewTimetablePage from './pages/ViewTimetablePage';
import ManageFaculty from './pages/ManageFaculty';
import AdminSettingsPage from './pages/AdminSettingsPage';
import ManageSubjects from './pages/ManageSubjects';
import EditTimetable from './pages/EditTimetable';
import { Toaster } from './components/ui/toaster';
import FacultyWorkloadPage from './pages/FacultyWorkloadPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-timetable" element={<CreateTimetable />} />
          <Route path="/view-timetable/:id" element={<ViewTimetablePage />} />
          <Route path="/edit-timetable/:id" element={<EditTimetable />} />
          <Route path="/manage-faculty" element={<ManageFaculty />} />
          <Route path="/manage-subjects" element={<ManageSubjects />} />
          <Route path="/admin-settings" element={<AdminSettingsPage />} />
          <Route path="/faculty-workload" element={<FacultyWorkloadPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
