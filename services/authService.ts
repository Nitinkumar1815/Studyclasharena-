
import { supabase } from './supabase';
import { AuthUser } from "../types";

// Helper to map Supabase session/user to our App's AuthUser type
const mapSessionToUser = (session: any): AuthUser | null => {
  if (!session?.user) return null;
  const { user } = session;
  return {
    id: user.id,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
    email: user.email || '',
    classGrade: user.user_metadata?.class_grade || 'Class 11-12',
    isVerified: !!user.email_confirmed_at || !!user.phone_confirmed_at,
    token: session.access_token,
  };
};

export const authService = {
  checkSession: async (): Promise<AuthUser | null> => {
    const { data } = await supabase.auth.getSession();
    return mapSessionToUser(data.session);
  },

  signup: async (name: string, email: string, password: string, classGrade: string): Promise<{ success: boolean; message: string; user?: AuthUser; debugOtp?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          class_grade: classGrade,
        },
      },
    });

    if (error) return { success: false, message: error.message };

    // If auto-confirm is enabled in Supabase, we get a session immediately
    if (data.session) {
      return { success: true, message: "Account created successfully.", user: mapSessionToUser(data.session)! };
    }

    // Otherwise, email verification is required
    return { success: true, message: "Verification link/code sent to email." };
  },

  resendOtp: async (email: string): Promise<{ success: boolean; message: string; debugOtp?: string }> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Code sent to email." };
  },

  verifyOtp: async (email: string, otp: string): Promise<{ success: boolean; user?: AuthUser; message: string }> => {
    // Try verifying as signup OTP first
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });

    if (error) return { success: false, message: error.message };
    if (data.session) {
      return { success: true, user: mapSessionToUser(data.session)!, message: "Email verified." };
    }
    return { success: false, message: "Verification failed." };
  },

  login: async (email: string, password: string): Promise<{ success: boolean; user?: AuthUser; message: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { success: false, message: error.message };
    return { success: true, user: mapSessionToUser(data.session)!, message: "Logged in successfully." };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string; debugOtp?: string }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Password reset instructions sent to email." };
  },

  resetPassword: async (email: string, otp: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    // 1. Verify the OTP (Recovery type) to log the user in temporarily
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery'
    });

    if (error) return { success: false, message: error.message };
    if (!data.session) return { success: false, message: "Session establishment failed." };

    // 2. Update the password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPass });
    
    if (updateError) return { success: false, message: updateError.message };
    return { success: true, message: "Password updated successfully." };
  }
};
