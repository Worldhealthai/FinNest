import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@finnest_onboarding_completed';
const USER_PROFILE_KEY = '@finnest_user_profile';

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
  targetAmount: number;
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
  userProfile: Partial<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      const profileData = await AsyncStorage.getItem(USER_PROFILE_KEY);

      if (completed === 'true') {
        setIsOnboardingCompleted(true);
      }

      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
    } catch (error) {
      console.error('Error loading onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updatedProfile = { ...userProfile, ...updates };
    setUserProfile(updatedProfile);

    // Persist to AsyncStorage immediately
    try {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Error saving profile updates:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile));
      setIsOnboardingCompleted(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      await AsyncStorage.removeItem(USER_PROFILE_KEY);
      setIsOnboardingCompleted(false);
      setUserProfile({});
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingCompleted,
        userProfile,
        updateProfile,
        completeOnboarding,
        resetOnboarding,
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
