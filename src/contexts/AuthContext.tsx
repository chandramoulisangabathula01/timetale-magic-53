
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/utils/types';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  username: string | null;
  login: (role: UserRole, username: string) => void;
  loginAdmin: (username: string, password: string) => boolean;
  loginFaculty: (facultyName: string) => boolean;
  loginStudent: (year: string, branch: string, semester: string) => boolean;
  logout: () => void;
  studentFilters: {
    year: string | null;
    branch: string | null;
    semester: string | null;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [studentFilters, setStudentFilters] = useState<{
    year: string | null;
    branch: string | null;
    semester: string | null;
  }>({
    year: null,
    branch: null,
    semester: null
  });

  // Check for existing session on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      setIsAuthenticated(true);
      setUserRole(authData.userRole);
      setUsername(authData.username);
      
      if (authData.userRole === 'student' && authData.studentFilters) {
        setStudentFilters(authData.studentFilters);
      }
    }
  }, []);

  const login = (role: UserRole, name: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUsername(name);
    
    // Save to localStorage
    localStorage.setItem('auth', JSON.stringify({
      userRole: role,
      username: name,
      studentFilters: role === 'student' ? studentFilters : null
    }));
  };

  const loginAdmin = (username: string, password: string): boolean => {

    // Mock admin authentication
    
    if (username === 'admin' && password === 'admin123') {
      login('admin', username);
      return true;
    }
    return false;
  };

  const loginFaculty = (facultyName: string): boolean => {
    if (facultyName) {
      login('faculty', facultyName);
      return true;
    }
    return false;
  };

  const loginStudent = (year: string, branch: string, semester: string): boolean => {
    if (year && branch && semester) {
      setStudentFilters({
        year,
        branch,
        semester
      });
      
      login('student', `Student (${year}, ${branch}, ${semester})`);
      
      // Update localStorage with student filters
      localStorage.setItem('auth', JSON.stringify({
        userRole: 'student',
        username: `Student (${year}, ${branch}, ${semester})`,
        studentFilters: {
          year,
          branch,
          semester
        }
      }));
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUsername(null);
    setStudentFilters({
      year: null,
      branch: null,
      semester: null
    });
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        username,
        login,
        loginAdmin,
        loginFaculty,
        loginStudent,
        logout,
        studentFilters
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
