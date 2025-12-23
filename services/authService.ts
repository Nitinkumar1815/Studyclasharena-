
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

  signup: async (name: string, email: string, password: string, classGrade: string): Promise<{ success: boolean; message: string; user?: AuthUser }> => {
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

    if (data.session) {
      return { success: true, message: "Account created successfully.", user: mapSessionToUser(data.session)! };
    }

    return { success: true, message: "Confirmation email sent." };
  },

  login: async (email: string, password: string): Promise<{ success: boolean; user?: AuthUser; message: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return { success: false, message: "Email not verified. Please check your inbox for the link." };
      }
      return { success: false, message: error.message };
    }
    return { success: true, user: mapSessionToUser(data.session)!, message: "Logged in successfully." };
  },

  /**
   * Re-authenticates the user using their current password.
   * Useful for sensitive actions like changing email or password.
   */
  reauthenticate: async (password: string): Promise<{ success: boolean; message: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return { success: false, message: "User not found." };

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Identity Verified." };
  },

  /**
   * Sends a re-authentication nonce to the user's email.
   * Required by Supabase for certain sensitive configuration changes.
   */
  sendReauthNonce: async (): Promise<{ success: boolean; message: string }> => {
    const { error } = await supabase.auth.reauthenticate();
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Verification challenge sent to your email." };
  },

  // Fixed: Renamed from logout to signOut to resolve the property access error in App.tsx.
  signOut: async () => {
    await supabase.auth.signOut();
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Password reset link sent to email." };
  }
};
