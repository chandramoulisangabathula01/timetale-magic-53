
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/utils/types';

type AuthContextType = {
  isAuthenticated: boolean;
  userRole: UserRole;
  username: string;
  userId: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: 'student',
  username: '',
  userId: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsAuthenticated(true);
          setUserId(session.user.id);
          
          // Fetch the user's profile to get their role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
            
          if (profile) {
            setUserRole(profile.role as UserRole);
          }
          
          setUsername(session.user.email || '');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          setUserId(session.user.id);
          setUsername(session.user.email || '');
          
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
            
          if (profile) {
            setUserRole(profile.role as UserRole);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUserRole('student');
          setUsername('');
          setUserId(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      setLoading(true);
      
      // For existing users, sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // If user doesn't exist, sign them up
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (signUpError) {
            throw signUpError;
          }
          
          if (signUpData.user) {
            // Create user profile with role
            await supabase.from('profiles').insert({
              user_id: signUpData.user.id,
              role,
              created_at: new Date().toISOString(),
            });
            
            setUserRole(role);
            setUserId(signUpData.user.id);
            setUsername(email);
            setIsAuthenticated(true);
            
            toast({
              title: "Account created",
              description: "You've been successfully registered and logged in",
            });
          }
        } else {
          throw error;
        }
      } else if (data.user) {
        setUserId(data.user.id);
        setUsername(email);
        setIsAuthenticated(true);
        
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();
          
        if (profile) {
          setUserRole(profile.role as UserRole);
        }
        
        toast({
          title: "Login successful",
          description: "You've been logged in successfully",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserRole('student');
      setUsername('');
      setUserId(null);
      
      toast({
        title: "Logout successful",
        description: "You've been logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userRole,
      username,
      userId,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
