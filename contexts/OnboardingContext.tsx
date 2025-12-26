import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@finnest_onboarding_completed';
const USER_PROFILE_KEY = '@finnest_user_profile';
const AUTH_KEY = '@finnest_auth';
const USERS_KEY = '@finnest_users';

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
  isAuthenticated: boolean;
  userProfile: Partial<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const authData = await AsyncStorage.getItem(AUTH_KEY);
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      const profileData = await AsyncStorage.getItem(USER_PROFILE_KEY);

      if (authData) {
        setIsAuthenticated(true);
      }

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
      await AsyncStorage.removeItem(AUTH_KEY);
      setIsOnboardingCompleted(false);
      setIsAuthenticated(false);
      setUserProfile({});
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get stored users
      const usersData = await AsyncStorage.getItem(USERS_KEY);
      if (!usersData) {
        return false;
      }

      const users = JSON.parse(usersData);
      const user = users[email.toLowerCase()];

      if (!user || user.password !== password) {
        return false;
      }

      // Set auth state
      await AsyncStorage.setItem(AUTH_KEY, email.toLowerCase());
      setIsAuthenticated(true);

      // Load user's profile and onboarding status
      const userProfileKey = `${USER_PROFILE_KEY}_${email.toLowerCase()}`;
      const userOnboardingKey = `${ONBOARDING_KEY}_${email.toLowerCase()}`;

      const profileData = await AsyncStorage.getItem(userProfileKey);
      const completedData = await AsyncStorage.getItem(userOnboardingKey);

      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }

      if (completedData === 'true') {
        setIsOnboardingCompleted(true);
      }

      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      const emailLower = email.toLowerCase();

      // Get existing users
      const usersData = await AsyncStorage.getItem(USERS_KEY);
      const users = usersData ? JSON.parse(usersData) : {};

      // Check if user already exists
      if (users[emailLower]) {
        return false;
      }

      // Store new user
      users[emailLower] = {
        email: emailLower,
        password, // NOTE: In production, use proper password hashing
        fullName,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      await AsyncStorage.setItem(AUTH_KEY, emailLower);

      setIsAuthenticated(true);
      setUserProfile({ email: emailLower, fullName });

      return true;
    } catch (error) {
      console.error('Error signing up:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Save current user's data before logging out
      const currentEmail = await AsyncStorage.getItem(AUTH_KEY);
      if (currentEmail) {
        const userProfileKey = `${USER_PROFILE_KEY}_${currentEmail}`;
        const userOnboardingKey = `${ONBOARDING_KEY}_${currentEmail}`;

        await AsyncStorage.setItem(userProfileKey, JSON.stringify(userProfile));
        await AsyncStorage.setItem(userOnboardingKey, isOnboardingCompleted ? 'true' : 'false');
      }

      // Clear auth state
      await AsyncStorage.removeItem(AUTH_KEY);
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      await AsyncStorage.removeItem(USER_PROFILE_KEY);

      setIsAuthenticated(false);
      setIsOnboardingCompleted(false);
      setUserProfile({});
    } catch (error) {
      console.error('Error logging out:', error);
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
        userProfile,
        updateProfile,
        completeOnboarding,
        resetOnboarding,
        login,
        signup,
        logout,
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
