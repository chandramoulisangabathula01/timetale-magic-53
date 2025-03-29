
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateTimetable from "./pages/CreateTimetable";
import EditTimetable from "./pages/EditTimetable";
import ViewTimetablePage from "./pages/ViewTimetablePage";
import NotFound from "./pages/NotFound";
import ManageSubjects from "./pages/ManageSubjects";
import ManageFaculty from "./pages/ManageFaculty";
import { useEffect, useState } from "react";
import { setupSupabaseDatabase } from "./utils/setupSupabase";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check and setup Supabase tables
    setupSupabaseDatabase()
      .then((result) => {
        console.log('Supabase setup complete:', result);
        setDbInitialized(true);
      })
      .catch((err) => {
        console.error('Supabase setup error:', err);
        setError(`Failed to initialize database: ${err.message}`);
      });
  }, []);

  // Display error if supabase initialization failed
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="mx-auto max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h1>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-gray-600">
            Please check your Supabase configuration and reload the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-timetable" element={<CreateTimetable />} />
                <Route path="/edit-timetable/:id" element={<EditTimetable />} />
                <Route path="/view-timetable/:id" element={<ViewTimetablePage />} />
                <Route path="/manage-subjects" element={<ManageSubjects />} />
                <Route path="/manage-faculty" element={<ManageFaculty />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
