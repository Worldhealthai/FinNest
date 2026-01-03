import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

const GUEST_MODE_KEY = '@finnest_guest_mode';

export interface UserProfile {
  // Account Info
  fullName: string;
  email: string;
  profilePhoto: string;

  // Personal Information
  dateOfBirth: string;
  nationalInsuranceNumber: string;
  phoneNumber: string;

  // Goals
  savingsGoals: ('first_home' | 'retirement' | 'emergency' | 'education' | 'general' | 'other')[];
  targetAmount: number | null;
  targetDate: string;

  // Preferences
  notifications: {
    taxYearReminders: boolean;
    contributionStreaks: boolean;
    educationalTips: boolean;
  };
}

interface OnboardingContextType {
  isOnboardingCompleted: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  userProfile: Partial<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadOnboardingStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        loadUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);

      if (guestMode === 'true') {
        setIsGuest(true);
        setIsAuthenticated(true);
        setIsOnboardingCompleted(true);
        setUserProfile({ fullName: 'Guest User' });
        setLoading(false);
        return;
      }

      // Check for existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setSession(session);
        setUser(session.user);
        setIsAuthenticated(true);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error loading onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setUserProfile({
          fullName: data.full_name,
          email: data.email,
          profilePhoto: data.profile_photo || '',
          dateOfBirth: data.date_of_birth || '',
          nationalInsuranceNumber: data.national_insurance_number || '',
          phoneNumber: data.phone_number || '',
          savingsGoals: data.savings_goals as any || [],
          targetAmount: data.target_amount,
          targetDate: data.target_date || '',
          notifications: {
            taxYearReminders: data.notifications_tax_year_reminders,
            contributionStreaks: data.notifications_contribution_streaks,
            educationalTips: data.notifications_educational_tips,
          },
        });
        setIsOnboardingCompleted(data.onboarding_completed);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updatedProfile = { ...userProfile, ...updates };
    setUserProfile(updatedProfile);

    // Don't save to Supabase if guest
    if (isGuest || !user) return;

    // Persist to Supabase immediately
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedProfile.fullName || '',
          date_of_birth: updatedProfile.dateOfBirth || null,
          national_insurance_number: updatedProfile.nationalInsuranceNumber || null,
          phone_number: updatedProfile.phoneNumber || null,
          profile_photo: updatedProfile.profilePhoto || null,
          savings_goals: updatedProfile.savingsGoals || [],
          target_amount: updatedProfile.targetAmount || null,
          target_date: updatedProfile.targetDate || null,
          notifications_tax_year_reminders: updatedProfile.notifications?.taxYearReminders ?? true,
          notifications_contribution_streaks: updatedProfile.notifications?.contributionStreaks ?? true,
          notifications_educational_tips: updatedProfile.notifications?.educationalTips ?? true,
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving profile updates:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      setIsOnboardingCompleted(true);

      // Don't save to Supabase if guest
      if (isGuest || !user) return;

      // Update onboarding status in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      setIsOnboardingCompleted(false);
      setIsAuthenticated(false);
      setUserProfile({});

      if (user) {
        // Reset onboarding in Supabase
        await supabase
          .from('profiles')
          .update({ onboarding_completed: false })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Clear guest mode flag first
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      setIsGuest(false);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setIsAuthenticated(true);
        await loadUserProfile(data.user.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      // Clear guest mode flag first
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      setIsGuest(false);

      const emailLower = email.toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: emailLower,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error.message);
        return false;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user!);
        setIsAuthenticated(true);
        setUserProfile({ email: emailLower, fullName });
        return true;
      }

      // Email confirmation might be required
      if (data.user && !data.session) {
        console.log('Email confirmation required');
        // For development, you can auto-confirm in Supabase settings
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error signing up:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Clear guest mode
      await AsyncStorage.removeItem(GUEST_MODE_KEY);

      // Sign out from Supabase (if not guest)
      if (!isGuest) {
        await supabase.auth.signOut();
      }

      // Clear state
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsOnboardingCompleted(false);
      setIsGuest(false);
      setUserProfile({});
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const continueAsGuest = async () => {
    try {
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      setIsGuest(true);
      setIsAuthenticated(true);
      setIsOnboardingCompleted(true);
      setUserProfile({ fullName: 'Guest User' });
    } catch (error) {
      console.error('Error continuing as guest:', error);
    }
  };

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingCompleted,
        isAuthenticated,
        isGuest,
        userProfile,
        updateProfile,
        completeOnboarding,
        resetOnboarding,
        login,
        signup,
        logout,
        continueAsGuest,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
