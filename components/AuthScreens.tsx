
import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { authService } from '../services/authService';
import { AuthUser } from '../types';
import { 
  Mail, Lock, User, ChevronRight, GraduationCap, 
  Eye, EyeOff, ArrowRight, Loader2, KeyRound, AlertCircle, ShieldCheck, Bell, HelpCircle
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: AuthUser) => void;
}

type AuthView = 'SPLASH' | 'LOGIN' | 'SIGNUP' | 'OTP' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';

export const AuthScreens: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [view, setView] = useState<AuthView>('SPLASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOtp, setLastOtp] = useState<string | null>(null); // Store OTP for display (Mock only)
  const [resendTimer, setResendTimer] = useState(0); // Cooldown for resend
  const [showHelp, setShowHelp] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    classGrade: 'Class 11-12',
    otp: '',
    newPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);

  // --- 1. SPLASH LOGIC ---
  useEffect(() => {
    const init = async () => {
      // Cinematic Splash Delay
      setTimeout(async () => {
        const user = await authService.checkSession();
        if (user) {
          onAuthSuccess(user);
        } else {
          setView('LOGIN');
        }
      }, 3000);
    };
    init();
  }, []);

  // Timer Countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // --- HANDLERS ---

  const handleDemoLogin = async () => {
    setLoading(true);
    // Simulate login
    setTimeout(() => {
        const demoUser: AuthUser = {
            id: 'demo-123',
            name: 'Demo Student',
            email: 'demo@studyclash.ai',
            classGrade: 'Class 11-12',
            isVerified: true,
            token: 'demo-token'
        };
        onAuthSuccess(demoUser);
        setLoading(false);
    }, 1500);
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
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
    }

    setLoading(true);
    const res = await authService.signup(formData.name, formData.email, formData.password, formData.classGrade);
    setLoading(false);

    if (res.success) {
      // Check if immediate login occurred (Auto-confirm)
      if (res.user) {
          onAuthSuccess(res.user);
          return;
      }

      setView('OTP');
      setError(null); 
      setResendTimer(30); // Start cooldown
      // Capture OTP for UI display (Mock mode only)
      if (res.debugOtp) {
        setLastOtp(res.debugOtp);
      } else {
        setLastOtp(null); // Clear previous OTP in live mode
      }
    } else {
      setError(res.message);
    }
  };

  const handleVerifyOtp = async () => {
    if (formData.otp.length !== 6) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    const res = await authService.verifyOtp(formData.email, formData.otp);
    setLoading(false);

    if (res.success && res.user) {
      onAuthSuccess(res.user);
    } else if (res.success) { 
        // This case handles Password Reset OTP verification if we were to split flow, 
        // but currently we verify+login or verify+reset.
        // For verify flow:
        onAuthSuccess(res.user!);
    } else {
      setError(res.message);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    const res = await authService.resendOtp(formData.email);
    setLoading(false);
    
    if (res.success) {
      alert(res.message);
      setResendTimer(30);
      if (res.debugOtp) setLastOtp(res.debugOtp);
    } else {
      setError(res.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Enter your registered email.");
      return;
    }
    setLoading(true);
    const res = await authService.forgotPassword(formData.email);
    setLoading(false);

    if (res.success) {
      setView('RESET_PASSWORD');
      // Capture OTP for UI display
      if (res.debugOtp) {
        setLastOtp(res.debugOtp);
      }
    } else {
      setError(res.message);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.otp || !formData.newPassword) {
        setError("OTP and New Password required.");
        return;
    }
    setLoading(true);
    const res = await authService.resetPassword(formData.email, formData.otp, formData.newPassword);
    setLoading(false);

    if (res.success) {
        alert("Password reset! Please login.");
        setView('LOGIN');
    } else {
        setError(res.message);
    }
  };

  // --- RENDERERS ---

  if (view === 'SPLASH') {
    return (
      <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center overflow-hidden">
        <div className="relative animate-pulse">
           <div className="w-32 h-32 rounded-full border-4 border-cyber-neonBlue border-t-transparent animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-white tracking-tighter">SC</span>
           </div>
        </div>
        <h1 className="mt-8 text-2xl font-bold text-white tracking-[0.3em] animate-in fade-in slide-in-from-bottom-4 duration-1000">
          STUDYCLASH ARENA
        </h1>
        <p className="text-cyber-neonBlue text-xs font-mono mt-2 animate-pulse">INITIALIZING CORE SYSTEMS...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center p-4 overflow-y-auto">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyber-neonBlue/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyber-neonPurple/5 rounded-full blur-[120px]" />
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      </div>

      <div className="w-full max-w-md relative z-10 perspective-1000">
        
        {/* LOGO HEADER */}
        <div className="text-center mb-8 animate-in slide-in-from-top-4 duration-700">
           <h2 className="text-3xl font-black text-white tracking-tighter italic">
             STUDY<span className="text-cyber-neonBlue">CLASH</span>
           </h2>
           <p className="text-gray-500 text-xs uppercase tracking-widest font-mono mt-1">
             Authentication Protocol v2.0
           </p>
        </div>

        {/* DEMO MAIL NOTIFICATION BOX (For Mock Mode) */}
        {lastOtp && (view === 'OTP' || view === 'RESET_PASSWORD') && (
           <div className="mb-4 animate-in slide-in-from-top-10 duration-500">
              <div className="bg-gray-800/90 border-l-4 border-yellow-500 rounded-r-lg p-4 shadow-2xl backdrop-blur-md relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Bell size={40} className="text-white" />
                 </div>
                 <div className="flex items-center gap-2 mb-1 text-yellow-500">
                    <Mail size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Inbox Simulation</span>
                 </div>
                 <div className="text-white text-sm">
                    New Message: <span className="text-gray-400">Your Verification Code is</span>
                 </div>
                 <div className="text-3xl font-mono font-bold text-white mt-1 tracking-[0.2em] text-shadow-red">
                    {lastOtp}
                 </div>
                 <div className="text-[9px] text-gray-500 mt-2 font-mono">
                    * Mock mode active. No email sent.
                 </div>
              </div>
           </div>
        )}

        <GlassCard className="border-cyber-neonBlue/30 shadow-[0_0_40px_rgba(0,243,255,0.1)] p-8">
          
          {/* LOGIN VIEW */}
          {view === 'LOGIN' && (
            <div className="space-y-5 animate-in fade-in duration-500">
               <h3 className="text-xl font-bold text-white mb-4">Operator Login</h3>
               
               <div className="space-y-4">
                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3 focus-within:border-cyber-neonBlue transition-colors">
                     <Mail className="text-gray-500 w-5 h-5 mr-3" />
                     <input 
                       type="email" 
                       placeholder="Email Address"
                       className="bg-transparent border-none outline-none text-white w-full text-sm"
                       value={formData.email}
                       onChange={(e) => handleChange('email', e.target.value)}
                     />
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3 focus-within:border-cyber-neonBlue transition-colors">
                     <Lock className="text-gray-500 w-5 h-5 mr-3" />
                     <input 
                       type={showPassword ? "text" : "password"} 
                       placeholder="Password"
                       className="bg-transparent border-none outline-none text-white w-full text-sm"
                       value={formData.password}
                       onChange={(e) => handleChange('password', e.target.value)}
                     />
                     <button onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-white">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                  </div>
               </div>

               <div className="flex justify-end">
                  <button onClick={() => setView('FORGOT_PASSWORD')} className="text-xs text-cyber-neonBlue hover:underline">
                    Forgot Password?
                  </button>
               </div>

               {error && (
                 <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 text-red-400 text-xs animate-shake">
                    <AlertCircle size={16} /> {error}
                 </div>
               )}

               <button 
                 onClick={handleLogin}
                 disabled={loading}
                 className="w-full py-4 bg-cyber-neonBlue hover:bg-cyan-400 text-black font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
               >
                 {loading ? <Loader2 className="animate-spin" /> : <>ENTER ARENA <ChevronRight size={18} /></>}
               </button>

               <div className="text-center">
                  <button 
                    onClick={handleDemoLogin}
                    className="text-[10px] text-gray-500 uppercase tracking-widest border border-gray-700 px-4 py-2 rounded hover:bg-white/5 hover:text-white transition-all"
                  >
                    Skip Auth (Demo Login)
                  </button>
               </div>

               <div className="text-center text-xs text-gray-500 mt-2">
                  New Recruit? <button onClick={() => setView('SIGNUP')} className="text-white hover:text-cyber-neonBlue font-bold ml-1">Enlist Now</button>
               </div>
            </div>
          )}

          {/* SIGNUP VIEW */}
          {view === 'SIGNUP' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
               <h3 className="text-xl font-bold text-white mb-4">New Registration</h3>
               
               <div className="grid gap-3">
                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3">
                     <User className="text-gray-500 w-5 h-5 mr-3" />
                     <input 
                       type="text" 
                       placeholder="Full Name"
                       className="bg-transparent border-none outline-none text-white w-full text-sm"
                       value={formData.name}
                       onChange={(e) => handleChange('name', e.target.value)}
                     />
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3">
                     <Mail className="text-gray-500 w-5 h-5 mr-3" />
                     <input 
                       type="email" 
                       placeholder="Email Address"
                       className="bg-transparent border-none outline-none text-white w-full text-sm"
                       value={formData.email}
                       onChange={(e) => handleChange('email', e.target.value)}
                     />
                  </div>
                  
                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3">
                     <GraduationCap className="text-gray-500 w-5 h-5 mr-3" />
                     <select 
                       className="bg-transparent border-none outline-none text-white w-full text-sm appearance-none"
                       value={formData.classGrade}
                       onChange={(e) => handleChange('classGrade', e.target.value)}
                     >
                       <option className="bg-black text-gray-300">Class 9-10</option>
                       <option className="bg-black text-gray-300">Class 11-12</option>
                       <option className="bg-black text-gray-300">Dropper / Repeater</option>
                       <option className="bg-black text-gray-300">College Student</option>
                     </select>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3">
                     <Lock className="text-gray-500 w-5 h-5 mr-3" />
                     <input 
                       type="password" 
                       placeholder="Password"
                       className="bg-transparent border-none outline-none text-white w-full text-sm"
                       value={formData.password}
                       onChange={(e) => handleChange('password', e.target.value)}
                     />
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3">
                     <ShieldCheck className="text-gray-500 w-5 h-5 mr-3" />
                     <input 
                       type="password" 
                       placeholder="Confirm Password"
                       className="bg-transparent border-none outline-none text-white w-full text-sm"
                       value={formData.confirmPassword}
                       onChange={(e) => handleChange('confirmPassword', e.target.value)}
                     />
                  </div>
               </div>

               <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="terms" className="accent-cyber-neonBlue" />
                  <label htmlFor="terms" className="text-[10px] text-gray-400">I agree to the <span className="text-white">Neural Terms & Conditions</span></label>
               </div>

               {error && (
                 <div className="text-red-400 text-xs text-center">{error}</div>
               )}

               <button 
                 onClick={handleSignup}
                 disabled={loading}
                 className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all mt-2"
               >
                 {loading ? <Loader2 className="animate-spin mx-auto" /> : "GENERATE ID"}
               </button>

               <div className="text-center text-xs text-gray-500">
                  Already exist? <button onClick={() => setView('LOGIN')} className="text-white hover:text-cyber-neonBlue font-bold ml-1">Log In</button>
               </div>
            </div>
          )}

          {/* OTP VIEW */}
          {view === 'OTP' && (
            <div className="space-y-6 animate-in zoom-in duration-300 text-center">
               <div className="mx-auto w-16 h-16 bg-cyber-neonBlue/10 rounded-full flex items-center justify-center border border-cyber-neonBlue">
                  <ShieldCheck className="text-cyber-neonBlue w-8 h-8" />
               </div>
               
               <div>
                 <h3 className="text-xl font-bold text-white">Security Check</h3>
                 <p className="text-gray-400 text-xs mt-1">
                   Enter the 6-digit code sent to <span className="text-white">{formData.email}</span>
                   <br/>
                   <span className="text-[10px] text-yellow-500">(Using Mock Database - Check 'Inbox Simulation')</span>
                 </p>
               </div>

               <input 
                 type="text" 
                 maxLength={6}
                 placeholder="0 0 0 0 0 0"
                 className="w-full bg-black/40 border-2 border-white/20 rounded-xl py-4 text-center text-3xl font-mono text-white tracking-[0.5em] focus:border-cyber-neonBlue outline-none transition-colors"
                 value={formData.otp}
                 onChange={(e) => handleChange('otp', e.target.value.replace(/[^0-9]/g, ''))}
               />

               {error && <div className="text-red-400 text-xs">{error}</div>}

               <button 
                 onClick={handleVerifyOtp}
                 disabled={loading}
                 className="w-full py-4 bg-cyber-neonBlue text-black font-bold uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all"
               >
                 {loading ? <Loader2 className="animate-spin mx-auto" /> : "VERIFY IDENTITY"}
               </button>
               
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-xs mt-4">
                    <button 
                      onClick={handleResendOtp} 
                      disabled={resendTimer > 0 || loading}
                      className={`font-bold transition-colors ${resendTimer > 0 ? 'text-gray-600 cursor-not-allowed' : 'text-cyber-neonBlue hover:text-white'}`}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                    </button>
                    <button onClick={() => setView('SIGNUP')} className="text-gray-500 hover:text-white">Change Email</button>
                 </div>
                 
                 <div className="border-t border-white/10 pt-3">
                     <button onClick={() => setShowHelp(!showHelp)} className="text-xs text-yellow-500 hover:text-white flex items-center justify-center gap-1 mx-auto">
                        <HelpCircle size={12} /> Troubleshoot: OTP not arriving?
                     </button>
                     
                     {showHelp && (
                        <div className="mt-2 text-[10px] text-gray-400 text-left bg-black/40 p-2 rounded border border-white/10">
                           <ul className="list-disc pl-3 space-y-1">
                              <li>This is a <strong>MOCK MODE</strong> environment.</li>
                              <li>The OTP is displayed in the yellow "Inbox Simulation" box above for testing.</li>
                           </ul>
                           <button onClick={handleDemoLogin} className="mt-2 w-full py-1.5 bg-white/10 hover:bg-white/20 text-white rounded font-bold">
                              Use Demo Login (Skip)
                           </button>
                        </div>
                     )}
                 </div>
               </div>
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {(view === 'FORGOT_PASSWORD' || view === 'RESET_PASSWORD') && (
             <div className="space-y-5 animate-in fade-in slide-in-from-left duration-500">
                <button onClick={() => setView('LOGIN')} className="text-gray-500 hover:text-white flex items-center gap-1 text-xs uppercase tracking-widest mb-2">
                   <ChevronRight className="rotate-180" size={14} /> Back
                </button>
                <h3 className="text-xl font-bold text-white">{view === 'FORGOT_PASSWORD' ? 'Recovery Protocol' : 'Set New Credentials'}</h3>
                
                {view === 'FORGOT_PASSWORD' ? (
                   <>
                     <p className="text-xs text-gray-400">Enter your email to receive a One-Time Password.</p>
                     <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3">
                        <Mail className="text-gray-500 w-5 h-5 mr-3" />
                        <input 
                          type="email" 
                          placeholder="Email Address"
                          className="bg-transparent border-none outline-none text-white w-full text-sm"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                     </div>
                     <button 
                       onClick={handleForgotPassword}
                       disabled={loading}
                       className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
                     >
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : "SEND OTP"}
                     </button>
                   </>
                ) : (
                   <>
                     <div className="space-y-3">
                       <input 
                         type="text" 
                         maxLength={6}
                         placeholder="Enter OTP"
                         className="w-full bg-black/40 border border-white/20 rounded-xl py-3 text-center text-xl font-mono text-white tracking-widest focus:border-cyber-neonBlue outline-none"
                         value={formData.otp}
                         onChange={(e) => handleChange('otp', e.target.value)}
                       />
                       <div className="bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3">
                          <KeyRound className="text-gray-500 w-5 h-5 mr-3" />
                          <input 
                            type="password" 
                            placeholder="New Password"
                            className="bg-transparent border-none outline-none text-white w-full text-sm"
                            value={formData.newPassword}
                            onChange={(e) => handleChange('newPassword', e.target.value)}
                          />
                       </div>
                     </div>
                     <button 
                       onClick={handleResetPassword}
                       disabled={loading}
                       className="w-full py-4 bg-cyber-neonBlue text-black font-bold uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all"
                     >
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : "UPDATE PASSWORD"}
                     </button>
                   </>
                )}

                {error && <div className="text-red-400 text-xs text-center">{error}</div>}
             </div>
          )}

        </GlassCard>
      </div>
    </div>
  );
};
