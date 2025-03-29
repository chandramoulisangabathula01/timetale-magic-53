
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { YearType, BranchType } from '@/utils/types';

export interface SubjectData {
  id: string;
  name: string;
  year: YearType;
  branch: BranchType;
  isLab: boolean;
}

// Get all subjects from Supabase
export const getSubjects = async (): Promise<SubjectData[]> => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*');
  
  if (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
  
  return data.map(item => ({
    id: item.id,
    name: item.name,
    year: item.year as YearType,
    branch: item.branch as BranchType,
    isLab: item.is_lab
  }));
};

// Add a new subject
export const addSubject = async (subject: SubjectData): Promise<void> => {
  const { error } = await supabase
    .from('subjects')
    .insert({
      id: subject.id || uuidv4(),
      name: subject.name,
      year: subject.year,
      branch: subject.branch,
      is_lab: subject.isLab,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error adding subject:', error);
    throw error;
  }
};

// Update an existing subject
export const updateSubject = async (updatedSubject: SubjectData): Promise<void> => {
  const { error } = await supabase
    .from('subjects')
    .update({
      name: updatedSubject.name,
      year: updatedSubject.year,
      branch: updatedSubject.branch,
      is_lab: updatedSubject.isLab
    })
    .eq('id', updatedSubject.id);
  
  if (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

// Delete a subject
export const deleteSubject = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};

// Get subjects filtered by year and branch
export const getFilteredSubjects = async (year: YearType, branch: BranchType): Promise<SubjectData[]> => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('year', year)
    .eq('branch', branch);
  
  if (error) {
    console.error('Error filtering subjects:', error);
    return [];
  }
  
  return data.map(item => ({
    id: item.id,
    name: item.name,
    year: item.year as YearType,
    branch: item.branch as BranchType,
    isLab: item.is_lab
  }));
};

// Check if a subject exists
export const subjectExists = async (name: string, year: YearType, branch: BranchType): Promise<boolean> => {
  const { data, error } = await supabase
    .from('subjects')
    .select('id')
    .eq('year', year)
    .eq('branch', branch)
    .ilike('name', name);
  
  if (error) {
    console.error('Error checking if subject exists:', error);
    return false;
  }
  
  return data.length > 0;
};

// Check if subject-teacher pair already exists
export const subjectTeacherPairExists = (subjectName: string, teacherName: string, subjectTeacherPairs: any[]): boolean => {
  return subjectTeacherPairs.some(pair => 
    pair.subjectName === subjectName && 
    pair.teacherName === teacherName
  );
};
