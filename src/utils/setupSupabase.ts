
import { supabase } from '@/lib/supabase';

// This function creates all the necessary tables in Supabase if they don't exist
export async function setupSupabaseDatabase() {
  // We don't need to create tables in Supabase with JavaScript
  // Instead, you should create these tables in the Supabase dashboard:
  
  // 1. subjects table
  // - id (uuid, primary key)
  // - name (text, not null)
  // - year (text, not null)
  // - branch (text, not null)
  // - is_lab (boolean, not null)
  // - created_at (timestamp with time zone, default now())
  
  // 2. faculty table
  // - id (uuid, primary key)
  // - name (text, not null)
  // - short_name (text, not null)
  // - created_at (timestamp with time zone, default now())
  
  // 3. timetables table
  // - id (uuid, primary key)
  // - form_data (jsonb, not null)
  // - entries (jsonb, not null)
  // - created_at (timestamp with time zone, default now())
  // - updated_at (timestamp with time zone, default now())
  // - user_id (uuid, foreign key to auth.users)
  
  // 4. profiles table
  // - id (uuid, primary key)
  // - user_id (uuid, foreign key to auth.users)
  // - role (text, not null)
  // - created_at (timestamp with time zone, default now())
  
  // This function only checks if migration is needed
  const { data: existingSubjects } = await supabase.from('subjects').select('id').limit(1);
  const { data: existingFaculty } = await supabase.from('faculty').select('id').limit(1);
  const { data: existingTimetables } = await supabase.from('timetables').select('id').limit(1);
  const { data: existingProfiles } = await supabase.from('profiles').select('id').limit(1);
  
  // Log migration status
  console.log('Supabase database check:');
  console.log('- Subjects table exists:', !!existingSubjects);
  console.log('- Faculty table exists:', !!existingFaculty);
  console.log('- Timetables table exists:', !!existingTimetables);
  console.log('- Profiles table exists:', !!existingProfiles);
  
  return {
    subjectsExist: !!existingSubjects && existingSubjects.length > 0,
    facultyExist: !!existingFaculty && existingFaculty.length > 0,
    timetablesExist: !!existingTimetables && existingTimetables.length > 0,
    profilesExist: !!existingProfiles && existingProfiles.length > 0
  };
}

// Migration helper function
export async function migrateLocalStorageToSupabase(userId: string) {
  try {
    // Migrate subjects
    const subjectsString = localStorage.getItem('timetable_subjects');
    if (subjectsString) {
      const subjects = JSON.parse(subjectsString);
      for (const subject of subjects) {
        await supabase.from('subjects').insert({
          id: subject.id,
          name: subject.name,
          year: subject.year,
          branch: subject.branch,
          is_lab: subject.isLab,
          created_at: new Date().toISOString()
        });
      }
      console.log('Subjects migrated:', subjects.length);
    }
    
    // Migrate faculty
    const facultyString = localStorage.getItem('timetable_faculty');
    if (facultyString) {
      const faculty = JSON.parse(facultyString);
      for (const teacher of faculty) {
        await supabase.from('faculty').insert({
          id: teacher.id,
          name: teacher.name,
          short_name: teacher.shortName,
          created_at: new Date().toISOString()
        });
      }
      console.log('Faculty migrated:', faculty.length);
    }
    
    // Migrate timetables
    const timetablesString = localStorage.getItem('timetables');
    if (timetablesString) {
      const timetables = JSON.parse(timetablesString);
      for (const timetable of timetables) {
        await supabase.from('timetables').insert({
          id: timetable.id,
          form_data: timetable.formData,
          entries: timetable.entries,
          created_at: timetable.createdAt,
          updated_at: timetable.updatedAt,
          user_id: userId
        });
      }
      console.log('Timetables migrated:', timetables.length);
    }
    
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}
