import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
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
  isDemoUser?: boolean;
}

export const DEMO_PERSONAS: Record<UserRole, UserProfile> = {
  'District Planning Officer': {
    uid: 'demo-planner-01',
    displayName: 'Dr. Vikram Malhotra, IAS',
    email: 'v.malhotra@up.gov.in',
    role: 'District Planning Officer',
    designation: 'District Magistrate & Planning Head',
    district: 'Bahraich',
    state: 'Uttar Pradesh',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isDemoUser: true
  },
  'State Auditor': {
    uid: 'demo-auditor-02',
    displayName: 'Sunita Verma',
    email: 's.verma@niti.gov.in',
    role: 'State Auditor',
    designation: 'Lead Governance Auditor, NITI Aayog',
    district: 'National Capital',
    state: 'Central Oversight',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isDemoUser: true
  },
  'Citizen': {
    uid: 'demo-citizen-03',
    displayName: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    role: 'Citizen',
    designation: 'Resident & Community Representative',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isDemoUser: true
  }
};

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isRealFirebase: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to District Planning Officer for an impressive hackathon opening state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('civicgrid_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEMO_PERSONAS['District Planning Officer'];
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('civicgrid_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('civicgrid_user');
    }
  }, [user]);

  // Sync with real Firebase Auth if configured
  useEffect(() => {
    if (!isRealFirebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, (fbUser: User | null) => {
      if (fbUser && (!user || !user.isDemoUser)) {
        setUser({
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Authenticated Officer',
          email: fbUser.email || 'authenticated@civicgrid.org',
          role: 'District Planning Officer',
          designation: 'Verified Planning Authority',
          district: 'Bahraich',
          state: 'Uttar Pradesh',
          photoURL: fbUser.photoURL || undefined,
          isDemoUser: false
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (isRealFirebaseConfigured) {
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);
        setUser({
          uid: res.user.uid,
          displayName: res.user.displayName || 'Google User',
          email: res.user.email || 'user@google.com',
          role: 'District Planning Officer',
          designation: 'Verified Authority',
          district: 'Bahraich',
          state: 'Uttar Pradesh',
          photoURL: res.user.photoURL || undefined,
          isDemoUser: false
        });
      } else {
        // High-fidelity fallback login
        setUser({
          uid: 'google-mock-user',
          displayName: 'Vikramaditya Rao (Google Verified)',
          email: 'vikram.rao@infrastructure.gov.in',
          role: 'District Planning Officer',
          designation: 'Executive Planning Director',
          district: 'Bahraich',
          state: 'Uttar Pradesh',
          photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          isDemoUser: true
        });
      }
    } catch (err) {
      console.warn('Google sign-in fallback activated:', err);
      switchDemoRole('District Planning Officer');
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (isRealFirebaseConfigured) {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        setUser({
          uid: res.user.uid,
          displayName: res.user.displayName || email.split('@')[0],
          email: res.user.email || email,
          role: 'District Planning Officer',
          designation: 'Verified Officer',
          district: 'Bahraich',
          state: 'Uttar Pradesh',
          isDemoUser: false
        });
      } else {
        // Fallback email auth
        setUser({
          uid: 'email-' + Math.random().toString(36).substring(7),
          displayName: email.split('@')[0].toUpperCase(),
          email: email,
          role: 'District Planning Officer',
          designation: 'Authorized District Officer',
          district: 'Bahraich',
          state: 'Uttar Pradesh',
          isDemoUser: true
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: UserRole) => {
    setLoading(true);
    try {
      if (isRealFirebaseConfigured) {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        setUser({
          uid: res.user.uid,
          displayName: name,
          email: email,
          role: role,
          designation: role === 'District Planning Officer' ? 'District Planning Head' : role === 'State Auditor' ? 'NITI Aayog Auditor' : 'Resident Citizen',
          district: 'Bahraich',
          state: 'Uttar Pradesh',
          isDemoUser: false
        });
      } else {
        setUser({
          uid: 'new-' + Math.random().toString(36).substring(7),
          displayName: name,
          email: email,
          role: role,
          designation: role === 'District Planning Officer' ? 'District Planning Head' : role === 'State Auditor' ? 'NITI Aayog Auditor' : 'Resident Citizen',
          district: 'Bahraich',
          state: 'Uttar Pradesh',
          isDemoUser: true
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async () => {
    setLoading(true);
    try {
      if (isRealFirebaseConfigured) {
        await signInAnonymously(auth);
      }
      switchDemoRole('Citizen');
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = (role: UserRole) => {
    setUser(DEMO_PERSONAS[role]);
  };

  const signOut = async () => {
    try {
      if (isRealFirebaseConfigured) {
        await fbSignOut(auth);
      }
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
      signInAsGuest,
      switchDemoRole,
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
