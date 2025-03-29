
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CreateTimetableForm from '@/components/CreateTimetableForm';
import { useAuth } from '@/contexts/AuthContext';
import { getTimetableById } from '@/utils/timetableUtils';
import { Timetable } from '@/utils/types';

const EditTimetable = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [timetable, setTimetable] = useState<Timetable | undefined>(undefined);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    if (id) {
      const existingTimetable = getTimetableById(id);
      if (existingTimetable) {
        setTimetable(existingTimetable);
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, userRole, navigate, id]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {timetable && <CreateTimetableForm existingTimetable={timetable} />}
      </div>
    </div>
  );
};

export default EditTimetable;
