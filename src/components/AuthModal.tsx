import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Key, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  User, 
  Sparkles,
  ArrowRight,
  LogOut,
  Flame
} from 'lucide-react';
import { useAuth, DEMO_PERSONAS, UserRole } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    loading, 
    isRealFirebase, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    switchDemoRole, 
    signOut 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('District Planning Officer');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name || 'Civic Official', selectedRole);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error. Switched to fallback mode.');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google Sign-in encountered an issue.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 shadow-md shadow-orange-500/20">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white font-display">
                  CivicGrid Identity & Role Access
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                  isRealFirebase 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' 
                    : 'bg-indigo-950 text-indigo-300 border-indigo-500/40'
                }`}>
                  {isRealFirebase ? 'Firebase Live' : 'Firebase Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authenticate via Firebase Auth or select a pre-verified Hackathon persona
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current User Card if Logged In */}
        {user && (
          <div className="mx-6 mt-5 p-4 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-cyan-400 bg-slate-800 shrink-0 flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-cyan-300" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white">{user.displayName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {user.role}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{user.designation} • {user.district || user.email}</div>
              </div>
            </div>

            <button
              onClick={() => { signOut(); }}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* 1-Click Judge & Demo Persona Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>1-Click Hackathon Persona Switcher</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Instant Role Switching</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Persona 1: District Planner */}
              <button
                type="button"
                onClick={() => { switchDemoRole('District Planning Officer'); onClose(); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  user?.role === 'District Planning Officer'
                    ? 'bg-cyan-950/50 border-cyan-400 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Building2 className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">District Planner</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Dr. Vikram Malhotra, IAS (Bahraich DM)
                </div>
              </button>

              {/* Persona 2: State Auditor */}
              <button
                type="button"
                onClick={() => { switchDemoRole('State Auditor'); onClose(); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  user?.role === 'State Auditor'
                    ? 'bg-indigo-950/50 border-indigo-400 shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">State Auditor</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Sunita Verma (NITI Aayog Lead)
                </div>
              </button>

              {/* Persona 3: Citizen */}
              <button
                type="button"
                onClick={() => { switchDemoRole('Citizen'); onClose(); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  user?.role === 'Citizen'
                    ? 'bg-emerald-950/50 border-emerald-400 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <User className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Resident Citizen</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Rahul Sharma (Grievance Submissions)
                </div>
              </button>

            </div>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-widest font-mono shrink-0">
              Or Firebase Authentication
            </span>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all active:scale-[0.99]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="flex border-b border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`pb-2 px-3 border-b-2 transition-all ${
                  mode === 'signin' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`pb-2 px-3 border-b-2 transition-all ${
                  mode === 'signup' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Create Account
              </button>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. S. Radhakrishnan, Deputy Director"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Government / Official Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="planner@nic.in"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Key className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Assigned Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="District Planning Officer">District Planning Officer (Full Allocation Rights)</option>
                  <option value="State Auditor">State Auditor (Merkle Verification & DPR Sign-off)</option>
                  <option value="Citizen">Citizen Stakeholder (Grievances & Local Voting)</option>
                </select>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-300">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>{mode === 'signin' ? 'Sign In' : 'Register Account'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
