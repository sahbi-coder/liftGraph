import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { useDependencies } from '@/dependencies/provider';
import { AuthUser } from '@/services/auth';

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { services, clients } = useDependencies();
  const authService = services.auth;
  const firestoreService = services.firestore;
  const firebaseAuth = clients.firebase.auth;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      setLoading(true);

      try {
        if (firebaseUser) {
          setUser(authService.toAuthUser(firebaseUser));

          const profile = await firestoreService.getUserProfile(firebaseUser.uid);

          if (!profile && firebaseUser.email) {
            await firestoreService.createUserProfile(firebaseUser.uid, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'User',
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state handling error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [authService, firestoreService, firebaseAuth]);

  const signIn = async (email: string, password: string) => {
    await authService.signInWithEmail(email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    await authService.signUpWithEmail(email, password, displayName);
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
