'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const loggedIn = localStorage.getItem('isAuthenticated') === 'true';
        setIsAuthenticated(loggedIn);
        setLoading(false);
        
        // If not logged in and not on login page, redirect to login
        if (!loggedIn && pathname && !pathname.startsWith('/login')) {
          router.push('/login');
        } else if (loggedIn && pathname === '/login') {
          router.push('/');
        }
      }
    };

    checkAuth();
  }, [router, pathname]);

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real app, this would be an API call to your backend
    const isValidCredentials = 
      username === process.env.NEXT_PUBLIC_AUTH_USERNAME && 
      password === process.env.NEXT_PUBLIC_AUTH_PASSWORD;

    if (isValidCredentials && typeof window !== 'undefined') {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      router.push('/');
      router.refresh(); // Ensure the page updates after login
      return true;
    }
    return false;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated');
      setIsAuthenticated(false);
      router.push('/login');
      router.refresh(); // Ensure the page updates after logout
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
