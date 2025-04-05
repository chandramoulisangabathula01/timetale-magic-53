
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import CreateTimetable from '@/pages/CreateTimetable';
import EditTimetable from '@/pages/EditTimetable';
import ViewTimetablePage from '@/pages/ViewTimetablePage';
import ManageFaculty from '@/pages/ManageFaculty';
import ManageSubjects from '@/pages/ManageSubjects';
import AdminSettingsPage from '@/pages/AdminSettingsPage';
import FacultyWorkload from '@/pages/FacultyWorkload';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-timetable" element={<CreateTimetable />} />
            <Route path="/edit-timetable/:id" element={<EditTimetable />} />
            <Route path="/view-timetable/:id" element={<ViewTimetablePage />} />
            <Route path="/manage-faculty" element={<ManageFaculty />} />
            <Route path="/manage-subjects" element={<ManageSubjects />} />
            <Route path="/admin-settings" element={<AdminSettingsPage />} />
            <Route path="/faculty-workload" element={<FacultyWorkload />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
