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
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserData(session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserData(session.user);
        } else {
          setUser(null);
          setSalon(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Create a basic user profile from auth.users metadata
      const basicUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: 'client', // Default role
        firstName: supabaseUser.user_metadata?.first_name || supabaseUser.email?.split('@')[0] || 'Usuario',
        lastName: supabaseUser.user_metadata?.last_name || '',
        phone: supabaseUser.user_metadata?.phone || '',
        avatar: supabaseUser.user_metadata?.avatar_url || '',
        createdAt: supabaseUser.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setUser(basicUser);

      // Try to fetch salon data if user is admin or employee (optional)
      if (basicUser.role === 'admin' || basicUser.role === 'employee') {
        try {
          const { data: salonData, error: salonError } = await supabase
            .from('salons')
            .select('*')
            .eq('admin_id', basicUser.id)
            .single();

          if (!salonError && salonData) {
            setSalon(salonData);
          }
        } catch (salonError) {
          console.log('Could not fetch salon data:', salonError);
        }
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchUserData(data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            salon_id: userData.salonId
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Try to create user profile in custom users table if it exists
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              role: 'client',
              salonId: userData.salonId,
            });

          if (profileError) {
            console.log('Custom users table not found, using auth.users metadata');
          }
        } catch (profileError) {
          console.log('Custom users table not found, using auth.users metadata');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
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
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    salon,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
