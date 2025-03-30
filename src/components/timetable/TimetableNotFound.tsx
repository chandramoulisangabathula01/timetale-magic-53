
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';

const TimetableNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Calendar className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-xl font-semibold">Timetable Not Found</h2>
      <p className="text-muted-foreground">
        The timetable you're looking for doesn't exist or has been deleted.
      </p>
      <Button onClick={handleBack}>Go Back to Dashboard</Button>
    </div>
  );
};

export default TimetableNotFound;
