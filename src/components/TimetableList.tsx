
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from './ui/badge';
import { Timetable } from '../utils/types';
import { useToast } from '../hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface TimetableListProps {
  role: 'admin' | 'faculty' | 'student';
  username?: string;
  filters?: {
    year?: string;
    branch?: string;
    semester?: string;
  };
}

const TimetableList: React.FC<TimetableListProps> = ({ role, username, filters }) => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTimetables();
  }, [role, username, filters]);

  const loadTimetables = () => {
    setLoading(true);
    try {
      // Get timetables from local storage
      const storedTimetables = localStorage.getItem('timetables');
      let parsedTimetables: Timetable[] = storedTimetables ? JSON.parse(storedTimetables) : [];

      // Filter based on role
      if (role === 'faculty' && username) {
        // Filter timetables for faculty based on the teacher name
        parsedTimetables = parsedTimetables.filter(timetable => {
          const entries = timetable.entries || [];
          return entries.some(entry => entry.teacherName === username);
        });
      } else if (role === 'student' && filters) {
        // Filter timetables based on student filters (year, branch, semester)
        parsedTimetables = parsedTimetables.filter(timetable => {
          const { year, branch, semester } = timetable.formData || {};
          return (
            (!filters.year || year === filters.year) && 
            (!filters.branch || branch === filters.branch) &&
            (!filters.semester || semester === filters.semester)
          );
        });
      }

      // Sort timetables by creation date (newest first)
      parsedTimetables.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setTimetables(parsedTimetables);
    } catch (error) {
      console.error('Error loading timetables:', error);
      toast({
        title: "Error loading timetables",
        description: "There was a problem loading your timetables.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTimetable = (id: string) => {
    try {
      // Get current timetables
      const storedTimetables = localStorage.getItem('timetables');
      if (storedTimetables) {
        const parsedTimetables: Timetable[] = JSON.parse(storedTimetables);
        // Filter out the timetable to delete
        const updatedTimetables = parsedTimetables.filter(timetable => timetable.id !== id);
        // Save updated timetables
        localStorage.setItem('timetables', JSON.stringify(updatedTimetables));
        // Update state
        setTimetables(updatedTimetables);
        toast({
          title: "Timetable deleted",
          description: "The timetable has been successfully deleted.",
        });
      }
    } catch (error) {
      console.error('Error deleting timetable:', error);
      toast({
        title: "Error deleting timetable",
        description: "There was a problem deleting this timetable.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading timetables...</div>;
  }

  if (timetables.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Timetables Found</CardTitle>
          <CardDescription>
            {role === 'admin' 
              ? "No timetables have been created yet." 
              : role === 'faculty' 
                ? "No timetables are assigned to you." 
                : "No timetables match your selected criteria."}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          {role === 'admin' && (
            <Button asChild>
              <Link to="/create-timetable">Create Timetable</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {timetables.map((timetable) => (
        <Card key={timetable.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {timetable.formData?.className || 'Untitled Timetable'}
                </CardTitle>
                <CardDescription>
                  {timetable.formData?.year} Year • {timetable.formData?.branch} • Sem {timetable.formData?.semester}
                </CardDescription>
              </div>
              <Badge>
                {formatDistanceToNow(new Date(timetable.createdAt), { addSuffix: true })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-sm">
              <p><span className="font-medium">Room:</span> {timetable.formData?.room || 'Not specified'}</p>
              <p><span className="font-medium">Class Incharge:</span> {timetable.formData?.incharge || 'Not specified'}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button asChild variant="secondary">
              <Link to={`/view-timetable/${timetable.id}`}>View</Link>
            </Button>
            {role === 'admin' && (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link to={`/edit-timetable/${timetable.id}`}>Edit</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Timetable</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this timetable? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteTimetable(timetable.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default TimetableList;
