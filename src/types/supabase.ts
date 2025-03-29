
export interface Database {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: string;
          name: string;
          year: string;
          branch: string;
          is_lab: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          year: string;
          branch: string;
          is_lab: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          year?: string;
          branch?: string;
          is_lab?: boolean;
          created_at?: string;
        };
      };
      faculty: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          short_name?: string;
          created_at?: string;
        };
      };
      timetables: {
        Row: {
          id: string;
          form_data: Record<string, any>;
          entries: Record<string, any>[];
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          form_data: Record<string, any>;
          entries: Record<string, any>[];
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          form_data?: Record<string, any>;
          entries?: Record<string, any>[];
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
      };
    };
  };
}
