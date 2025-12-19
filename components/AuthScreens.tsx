
import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { authService } from '../services/authService';
import { AuthUser } from '../types';
import { 
  Mail, Lock, User, ChevronRight, GraduationCap, 
  Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, CheckCircle
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: AuthUser) => void;
}

type AuthView = 'LOGIN' | 'SIGNUP' | 'CHECK_EMAIL' | 'FORGOT_PASSWORD';

export const AuthScreens: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    classGrade: '',
    newPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const res = await authService.login(formData.email, formData.password);
    setLoading(false);
    
    if (res.success && res.user) {
      onAuthSuccess(res.user);
    } else {
      setError(res.message);
    }
  };

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.classGrade) {
      setError("All fields (including Sector) are required.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await authService.signup(formData.name, formData.email, formData.password, formData.classGrade);
    setLoading(false);

    if (res.success) {
      if (res.user) {
          // If auto-confirm is on in Supabase, we get the user immediately
          onAuthSuccess(res.user);
      } else {
          // If confirm email is on, we show the "Check Email" screen
          setView('CHECK_EMAIL');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-cyber-black flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyber-neonBlue/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyber-neonPurple/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
           <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">
             StudyClash<span className="text-cyber-neonBlue">Arena</span>
           </h2>
           <p className="text-gray-500 text-[10px] uppercase tracking-widest font-mono mt-1">
             Authentication Uplink Active
           </p>
        </div>

        <GlassCard className="border-cyber-neonBlue/30 p-8">
          {view === 'LOGIN' && (
            <div className="space-y-5 animate-in fade-in duration-500">
               <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">Operator Login</h3>
               <div className="space-y-4">
                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3 focus-within:border-cyber-neonBlue transition-colors">
                     <Mail className="text-gray-500 w-5 h-5 mr-3" />
                     <input type="email" placeholder="Email" className="bg-transparent border-none outline-none text-white w-full text-sm" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3 focus-within:border-cyber-neonBlue transition-colors">
                     <Lock className="text-gray-500 w-5 h-5 mr-3" />
                     <input type={showPassword ? "text" : "password"} placeholder="Password" className="bg-transparent border-none outline-none text-white w-full text-sm" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} />
                     <button onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-white">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                  </div>
               </div>

               {error && <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 text-red-400 text-xs animate-shake"><AlertCircle size={16} /> {error}</div>}

               <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-cyber-neonBlue hover:bg-cyan-400 text-black font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                 {loading ? <Loader2 className="animate-spin" /> : <>ENTER ARENA <ChevronRight size={18} /></>}
               </button>

               <div className="text-center text-xs text-gray-500 mt-2">
                  New Operator? <button onClick={() => setView('SIGNUP')} className="text-white hover:text-cyber-neonBlue font-bold ml-1">Create ID</button>
               </div>
            </div>
          )}

          {view === 'SIGNUP' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
               <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">Enlist Recruit</h3>
               <div className="grid gap-3">
                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3"><User className="text-gray-500 w-5 h-5 mr-3" /><input type="text" placeholder="Full Name" className="bg-transparent border-none outline-none text-white w-full text-sm" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} /></div>
                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3"><Mail className="text-gray-500 w-5 h-5 mr-3" /><input type="email" placeholder="Email" className="bg-transparent border-none outline-none text-white w-full text-sm" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} /></div>
                  
                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3">
                    <GraduationCap className="text-gray-500 w-5 h-5 mr-3" />
                    <select 
                      className="bg-transparent border-none outline-none text-white w-full text-sm appearance-none cursor-pointer" 
                      value={formData.classGrade} 
                      onChange={(e) => handleChange('classGrade', e.target.value)}
                    >
                      <option className="bg-cyber-black text-white" value="">Select Sector / Aspirancy</option>
                      <optgroup label="School Levels" className="bg-cyber-black text-cyber-neonBlue">
                        <option className="bg-cyber-black text-white" value="Class 9-10">Class 9-10</option>
                        <option className="bg-cyber-black text-white" value="Class 11-12">Class 11-12</option>
                      </optgroup>
                      <optgroup label="Competitive Aspirants" className="bg-cyber-black text-cyber-neonPurple">
                        <option className="bg-cyber-black text-white" value="JEE Aspirant">JEE Aspirant (Engineering)</option>
                        <option className="bg-cyber-black text-white" value="NEET Aspirant">NEET Aspirant (Medical)</option>
                        <option className="bg-cyber-black text-white" value="UPSC Aspirant">UPSC Aspirant (Civil Services)</option>
                        <option className="bg-cyber-black text-white" value="SSC/Banking">SSC / Banking / CGL</option>
                        <option className="bg-cyber-black text-white" value="GATE/ESE">GATE / ESE Aspirant</option>
                        <option className="bg-cyber-black text-white" value="CA/CS">CA / CS / Professional</option>
                        <option className="bg-cyber-black text-white" value="CAT/MBA">CAT / MBA Entrance</option>
                        <option className="bg-cyber-black text-white" value="Defence">Defence (NDA/CDS)</option>
                      </optgroup>
                      <optgroup label="General / Other" className="bg-cyber-black text-gray-500">
                        <option className="bg-cyber-black text-white" value="Dropper">Dropper (General)</option>
                        <option className="bg-cyber-black text-white" value="Post-Grad">Post-Grad / PhD</option>
                        <option className="bg-cyber-black text-white" value="Professional">Skill Learner / Professional</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3"><Lock className="text-gray-500 w-5 h-5 mr-3" /><input type="password" placeholder="Password" className="bg-transparent border-none outline-none text-white w-full text-sm" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} /></div>
                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3"><ShieldCheck className="text-gray-500 w-5 h-5 mr-3" /><input type="password" placeholder="Confirm Password" className="bg-transparent border-none outline-none text-white w-full text-sm" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} /></div>
               </div>

               {error && <div className="text-red-400 text-xs text-center">{error}</div>}

               <button onClick={handleSignup} disabled={loading} className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all mt-2">{loading ? <Loader2 className="animate-spin" /> : "GENERATE IDENTITY"}</button>

               <div className="text-center text-xs text-gray-500">Already exist? <button onClick={() => setView('LOGIN')} className="text-white hover:text-cyber-neonBlue font-bold ml-1">Log In</button></div>
            </div>
          )}

          {view === 'CHECK_EMAIL' && (
            <div className="space-y-6 animate-in zoom-in duration-300 text-center py-4">
               <div className="mx-auto w-20 h-20 bg-cyber-neonBlue/10 rounded-full flex items-center justify-center border border-cyber-neonBlue shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                  <Mail className="text-cyber-neonBlue w-10 h-10 animate-pulse" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-xl font-bold text-white uppercase tracking-widest">Verify Your Sector</h3>
                 <p className="text-gray-400 text-xs leading-relaxed">
                   A confirmation link has been transmitted to <span className="text-cyber-neonBlue font-bold">{formData.email}</span>.
                 </p>
               </div>
               
               <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-left">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <AlertCircle size={10}/> Protocol Instructions
                  </p>
                  <ul className="text-[10px] text-gray-400 space-y-1 list-disc pl-4">
                    <li>Check your inbox (and spam folder)</li>
                    <li>Click the "Confirm your email" link</li>
                    <li>Return to this terminal once verified</li>
                  </ul>
               </div>

               <div className="pt-4 space-y-3">
                  <button onClick={() => setView('LOGIN')} className="w-full py-3 bg-cyber-neonBlue/10 border border-cyber-neonBlue text-cyber-neonBlue font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-cyber-neonBlue hover:text-black transition-all">
                    GO TO LOGIN
                  </button>
                  <button onClick={() => setView('SIGNUP')} className="text-gray-600 hover:text-white text-[10px] uppercase tracking-widest">
                    Wrong email? Back to signup
                  </button>
               </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
