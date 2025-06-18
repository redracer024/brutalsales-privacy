import { supabase } from './supabase';

// Guest mode credentials
const GUEST_EMAIL = 'guest@brutalsales.app';
const GUEST_PASSWORD = 'guestmode123!';

export const handleGuestMode = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    // First try to sign in with guest credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: GUEST_EMAIL,
      password: GUEST_PASSWORD
    });

    // If guest account doesn't exist, create it
    if (error && error.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: GUEST_EMAIL,
        password: GUEST_PASSWORD
      });

      if (signUpError) {
        console.error('Guest account creation error:', signUpError);
        return { 
          success: false, 
          message: 'Unable to create guest account. Please try again.' 
        };
      }

      if (signUpData.session) {
        return { success: true };
      } else {
        return { 
          success: false, 
          message: 'Guest account created. Please check your email to verify your account.' 
        };
      }
    } else if (error) {
      console.error('Guest mode error:', error);
      return { 
        success: false, 
        message: 'Unable to enter guest mode. Please try again.' 
      };
    }

    if (data.session) {
      return { success: true };
    } else {
      return { 
        success: false, 
        message: 'Unable to start guest session. Please try again.' 
      };
    }
  } catch (error) {
    console.error('Guest mode error:', error);
    return { 
      success: false, 
      message: 'Unable to enter guest mode. Please try again.' 
    };
  }
}; 