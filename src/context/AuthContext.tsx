import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isRealFirebaseConfigured } from '../lib/firebase';

export type UserRole = 'Citizen' | 'District Planning Officer' | 'State Auditor';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  designation: string;
  district?: string;
  state?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isRealFirebase: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to null — user must authenticate via real Firebase
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('civicgrid_user');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        // Only restore if it was a real Firebase session (has a real uid)
        if (parsed && parsed.uid && !parsed.uid.startsWith('demo-') && !parsed.uid.startsWith('email-') && !parsed.uid.startsWith('new-') && !parsed.uid.startsWith('google-mock')) {
          return parsed;
        }
      } catch (e) { /* ignore */ }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('civicgrid_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('civicgrid_user');
    }
  }, [user]);

  // Sync with real Firebase Auth
  useEffect(() => {
    if (!isRealFirebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, (fbUser: User | null) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Authenticated Officer',
          email: fbUser.email || 'authenticated@civicgrid.org',
          role: 'District Planning Officer',
          designation: 'Verified Planning Authority',
          district: 'National Grid',
          state: 'India',
          photoURL: fbUser.photoURL || undefined,
        });
      } else {
        // Firebase says no user — clear local state
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      setUser({
        uid: res.user.uid,
        displayName: res.user.displayName || 'Google User',
        email: res.user.email || 'user@google.com',
        role: 'District Planning Officer',
        designation: 'Verified Authority',
        district: 'National Grid',
        state: 'India',
        photoURL: res.user.photoURL || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      setUser({
        uid: res.user.uid,
        displayName: res.user.displayName || email.split('@')[0],
        email: res.user.email || email,
        role: 'District Planning Officer',
        designation: 'Verified Officer',
        district: 'National Grid',
        state: 'India',
      });
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: UserRole) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      setUser({
        uid: res.user.uid,
        displayName: name,
        email: email,
        role: role,
        designation: role === 'District Planning Officer' ? 'District Planning Head' : role === 'State Auditor' ? 'NITI Aayog Auditor' : 'Resident Citizen',
        district: 'National Grid',
        state: 'India',
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isRealFirebase: isRealFirebaseConfigured,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
