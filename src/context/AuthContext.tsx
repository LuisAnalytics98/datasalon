import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { User, Salon, AuthContextType, RegisterData } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    console.log('AuthContext useEffect started');
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setLoading(false);
            console.log('Set loading to false due to error');
          }
          return;
        }
        
        console.log('Initial session result:', { session: !!session, user: !!session?.user });
        
        if (session?.user && isMounted) {
          console.log('Processing initial session user:', session.user.email);
          await processUser(session.user);
        }
        
        console.log('Setting loading to false after initial session');
        if (isMounted) {
          setLoading(false);
          console.log('Loading set to false after initial session');
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (isMounted) {
          setLoading(false);
          console.log('Set loading to false due to catch error');
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', { event, session: !!session, user: !!session?.user });
        if (!isMounted) {
          console.log('Component unmounted, skipping auth state change');
          return;
        }
        
        try {
          if (session?.user) {
            console.log('Processing session user:', session.user.email);
            await processUser(session.user);
          } else {
            console.log('No session user, clearing state');
            setUser(null);
            setSalon(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          console.log('Setting loading to false in auth state change');
          if (isMounted) {
            setLoading(false);
            console.log('Loading set to false in auth state change');
          }
        }
      }
    );

    return () => {
      console.log('AuthContext cleanup');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const processUser = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Processing user:', supabaseUser.email);
      
      // Determine user role based on email or metadata
      let userRole = 'client'; // Default role
      
      // Check if user is owner (highest priority)
      if (supabaseUser.user_metadata?.role === 'owner' || 
          supabaseUser.email === 'datasalon98@gmail.com' ||
          supabaseUser.email === 'luis.madriga@hotmail.com') {
        userRole = 'owner';
      }
      // Check if user is admin
      else if (supabaseUser.user_metadata?.role === 'admin' || 
               supabaseUser.email === 'lamf98@gmail.com') {
        userRole = 'admin';
      }
      // Check if user is employee
      else if (supabaseUser.user_metadata?.role === 'employee') {
        userRole = 'employee';
      }
      
      console.log('User role determined:', { 
        email: supabaseUser.email, 
        role: userRole, 
        metadata: supabaseUser.user_metadata 
      });

      // Create a basic user profile from auth.users metadata
      const basicUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: userRole,
        firstName: supabaseUser.user_metadata?.first_name || supabaseUser.email?.split('@')[0] || 'Usuario',
        lastName: supabaseUser.user_metadata?.last_name || '',
        phone: supabaseUser.user_metadata?.phone || '',
        avatar: supabaseUser.user_metadata?.avatar_url || '',
        createdAt: supabaseUser.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Setting user:', basicUser);
      setUser(basicUser);
      console.log('User data set successfully');

      // Skip salon data fetch in development mode
      if (import.meta.env.DEV) {
        console.log('Development mode: Skipping salon data fetch');
        return;
      }

      // Try to fetch salon data if user is admin or employee (only in production)
      if (basicUser.role === 'admin' || basicUser.role === 'employee') {
        try {
          const { data: salonData, error: salonError } = await supabase
            .from('salons')
            .select('*')
            .eq('admin_id', basicUser.id)
            .single();

          if (!salonError && salonData) {
            console.log('Salon data found:', salonData);
            setSalon(salonData);
          } else {
            console.log('No salon data found for user');
          }
        } catch (salonError) {
          console.log('Could not fetch salon data:', salonError);
        }
      }
    } catch (error) {
      console.error('Error processing user:', error);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Login function called');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log('Login successful');
      return data.user;
    } finally {
      console.log('Login function finished, setting loading to false');
      setLoading(false);
    }
  };

  const register = async (registerData: RegisterData) => {
    setLoading(true);
    try {
      const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          emailRedirectTo: `${appUrl}/auth/callback`,
          data: {
            first_name: registerData.firstName,
            last_name: registerData.lastName,
            phone: registerData.phone,
            role: 'client', // Default role for new registrations
          },
        },
      });

      if (error) throw error;
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSalon(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    salon,
    loading,
    login,
    register,
    logout,
  };

  console.log('AuthContext value:', { user, loading, salon });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};