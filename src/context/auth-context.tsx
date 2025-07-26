
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  dob: string;
  school: string;
  contact: string;
  email: string;
  password?: string; // Should not be stored in context in a real app
}

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (emailOrContact: string, password: string) => Promise<boolean>;
  register: (user: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for user session on initial load
    try {
      const storedUser = localStorage.getItem('shiksha-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Could not parse user from local storage', e);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const login = async (emailOrContact: string, password: string): Promise<boolean> => {
    try {
        const storedUsers = JSON.parse(localStorage.getItem('shiksha-users') || '[]') as User[];
        const foundUser = storedUsers.find(
            (u) => (u.email === emailOrContact || u.contact === emailOrContact) && u.password === password
        );

        if (foundUser) {
            const { password, ...userToStore } = foundUser; // Don't store password in session
            localStorage.setItem('shiksha-user', JSON.stringify(userToStore));
            setUser(userToStore);
            return true;
        }
        return false;
    } catch (e) {
        console.error('Login failed', e);
        return false;
    }
  };

  const register = async (newUser: Omit<User, 'id'>): Promise<boolean> => {
    try {
        const storedUsers = JSON.parse(localStorage.getItem('shiksha-users') || '[]') as User[];
        const userWithId = { ...newUser, id: new Date().toISOString() };
        
        storedUsers.push(userWithId);
        localStorage.setItem('shiksha-users', JSON.stringify(storedUsers));
        
        const { password, ...userToStore } = userWithId;
        localStorage.setItem('shiksha-user', JSON.stringify(userToStore));
        setUser(userToStore);
        return true;
    } catch(e) {
        console.error('Registration failed', e);
        return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('shiksha-user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAuthLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
