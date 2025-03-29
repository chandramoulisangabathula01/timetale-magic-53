
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface FacultyData {
  id: string;
  name: string;
  shortName: string;
}

// Get all faculty from Supabase
export const getFaculty = async (): Promise<FacultyData[]> => {
  const { data, error } = await supabase
    .from('faculty')
    .select('*');
  
  if (error) {
    console.error('Error fetching faculty:', error);
    return [];
  }
  
  return data.map(item => ({
    id: item.id,
    name: item.name,
    shortName: item.short_name
  }));
};

// Add a new faculty member
export const addFaculty = async (faculty: FacultyData): Promise<void> => {
  const { error } = await supabase
    .from('faculty')
    .insert({
      id: faculty.id || uuidv4(),
      name: faculty.name,
      short_name: faculty.shortName,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error adding faculty:', error);
    throw error;
  }
};

// Update an existing faculty member
export const updateFaculty = async (updatedFaculty: FacultyData): Promise<void> => {
  const { error } = await supabase
    .from('faculty')
    .update({
      name: updatedFaculty.name,
      short_name: updatedFaculty.shortName
    })
    .eq('id', updatedFaculty.id);
  
  if (error) {
    console.error('Error updating faculty:', error);
    throw error;
  }
};

// Delete a faculty member
export const deleteFaculty = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('faculty')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting faculty:', error);
    throw error;
  }
};

// Check if a faculty exists
export const facultyExists = async (name: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('faculty')
    .select('id')
    .ilike('name', name);
  
  if (error) {
    console.error('Error checking if faculty exists:', error);
    return false;
  }
  
  return data.length > 0;
};

// Get faculty by ID
export const getFacultyById = async (id: string): Promise<FacultyData | undefined> => {
  const { data, error } = await supabase
    .from('faculty')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching faculty by ID:', error);
    return undefined;
  }
  
  return {
    id: data.id,
    name: data.name,
    shortName: data.short_name
  };
};

// Get faculty by name
export const getFacultyByName = async (name: string): Promise<FacultyData | undefined> => {
  const { data, error } = await supabase
    .from('faculty')
    .select('*')
    .ilike('name', name)
    .single();
  
  if (error) {
    console.error('Error fetching faculty by name:', error);
    return undefined;
  }
  
  return {
    id: data.id,
    name: data.name,
    shortName: data.short_name
  };
};
