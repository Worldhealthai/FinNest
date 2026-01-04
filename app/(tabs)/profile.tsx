import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlassCard from '@/components/GlassCard';
import PersonalInfoModal from '@/components/PersonalInfoModal';
import ISAAccountsModal from '@/components/ISAAccountsModal';
import TermsModal from '@/components/TermsModal';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import ContactSupportModal from '@/components/ContactSupportModal';
import TargetGoalModal from '@/components/TargetGoalModal';
import NotificationsModal from '@/components/NotificationsModal';
import FlexibleCalculatorModal from '@/components/FlexibleCalculatorModal';
import { ISAContribution } from '@/components/AddISAContributionModal';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { ISA_ANNUAL_ALLOWANCE, formatCurrency } from '@/constants/isaData';
import { getCurrentTaxYear, isDateInTaxYear } from '@/utils/taxYear';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { loadContributions as loadContributionsDB } from '@/lib/contributions';

const CONTRIBUTIONS_STORAGE_KEY = '@finnest_contributions';

// Get time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

// Get motivational message based on progress percentage
const getProgressMessage = (percentage: number) => {
  if (percentage === 0) {
    return "Start your ISA journey today and secure your financial future!";
  } else if (percentage < 25) {
    return "Great start! Keep building your tax-free savings.";
  } else if (percentage < 50) {
    return "You're making solid progress with your ISA contributions!";
  } else if (percentage < 75) {
    return "Excellent work! You're well on your way to maximizing your allowance.";
  } else if (percentage < 100) {
    return "Outstanding! You're using your allowance better than most UK savers.";
  } else {
    return "Amazing! You've maximized your ISA allowance for this tax year!";
  }
};

export default function ProfileScreen() {
  const { userProfile, updateProfile, logout, resetOnboarding, isGuest } = useOnboarding();
  const [hasError, setHasError] = React.useState(false);

  // Pulsing animation for avatar
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Modal states
  const [personalInfoVisible, setPersonalInfoVisible] = React.useState(false);
  const [isaAccountsVisible, setIsaAccountsVisible] = React.useState(false);
  const [notificationsVisible, setNotificationsVisible] = React.useState(false);
  const [termsVisible, setTermsVisible] = React.useState(false);
  const [privacyVisible, setPrivacyVisible] = React.useState(false);
  const [contactSupportVisible, setContactSupportVisible] = React.useState(false);
  const [targetGoalVisible, setTargetGoalVisible] = React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [deleteText, setDeleteText] = React.useState('');
  const [calculatorVisible, setCalculatorVisible] = React.useState(false);

  // Contributions state
  const [contributions, setContributions] = useState<ISAContribution[]>([]);

  // Load contributions from Supabase (authenticated) or AsyncStorage (guest)
  const loadContributions = async () => {
    try {
      if (isGuest) {
        // Guest mode: load from AsyncStorage
        const savedData = await AsyncStorage.getItem(CONTRIBUTIONS_STORAGE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setContributions(parsed);
        }
      } else {
        // Authenticated: load from Supabase
        const data = await loadContributionsDB();
        setContributions(data);
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
    }
  };

  // Load contributions on mount and when screen comes into focus
  useEffect(() => {
    loadContributions();
  }, [isGuest]);

  // Reload contributions whenever the profile tab is focused
  useFocusEffect(
    React.useCallback(() => {
      loadContributions();
    }, [])
  );

  // Handle profile photo selection - only works on native platforms
  const handlePickImage = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available on Web', 'Profile photo upload is only available on mobile devices.');
      return;
    }

    try {
      // Dynamically import expo-image-picker only on native platforms
      const ImagePicker = await import('expo-image-picker');

      console.log('Starting image picker...');

      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission result:', permissionResult);

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        console.log('Selected photo URI:', photoUri);

        await updateProfile({ profilePhoto: photoUri });
        console.log('Profile updated successfully');

        Alert.alert('Success', 'Profile photo updated!');
      } else {
        console.log('Image selection was cancelled or no image selected');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to update profile photo. Please try again.');
    }
  };

  // Handle logout with confirmation
  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      await logout();
      console.log('Logout successful, navigating to login');
      router.replace('/(onboarding)/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // Handle delete account - show confirmation modal
  const handleDeleteAccount = () => {
    console.log('Delete account button clicked');
    setDeleteModalVisible(true);
  };

  // Handle delete account - final confirmation with text input
  const handleDeleteAccountConfirm = async () => {
    console.log('Delete confirm clicked, deleteText:', deleteText);
    if (deleteText.toUpperCase() === 'DELETE') {
      try {
        console.log('Deleting account...');
        // Clear all user data including contributions
        await AsyncStorage.removeItem(CONTRIBUTIONS_STORAGE_KEY);
        await AsyncStorage.removeItem('@finnest_isa_accounts');

        // Reset onboarding (clears profile and onboarding status)
        await resetOnboarding();

        setDeleteModalVisible(false);
        setDeleteText('');

        console.log('Account deleted, navigating to login');
        router.replace('/(onboarding)/login');
      } catch (error) {
        console.error('Error deleting account:', error);
        Alert.alert('Error', 'Failed to delete account. Please try again.');
      }
    } else {
      Alert.alert('Invalid Input', 'Please type DELETE to confirm account deletion.');
    }
  };

  // Calculate real progress based on current tax year contributions
  const currentTaxYear = getCurrentTaxYear();
  const currentYearContributions = contributions.filter(
    c => !c.withdrawn && isDateInTaxYear(new Date(c.date), currentTaxYear)
  );
  const totalContributed = currentYearContributions.reduce((sum, c) => sum + c.amount, 0);
  const progressPercentage = Math.min((totalContributed / ISA_ANNUAL_ALLOWANCE) * 100, 100);
  const progressMessage = getProgressMessage(progressPercentage);

  // Calculate stats for profile card
  const activeContributions = contributions.filter(c => !c.withdrawn);
  const uniqueAccounts = new Set(
    activeContributions.map(c => `${c.provider}-${c.isaType}`)
  ).size;
  const totalAllTime = activeContributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <View style={styles.container}>
      <AnimatedBackground />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Greeting and Logo */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            </View>
            <Image source={require('@/assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Guest Mode Banner */}
          {isGuest && (
            <TouchableOpacity
              onPress={async () => {
                await logout();
              }}
              activeOpacity={0.7}
            >
              <GlassCard style={styles.guestBanner} intensity="medium">
                <LinearGradient
                  colors={['rgba(33, 150, 243, 0.3)', 'rgba(33, 150, 243, 0.1)']}
                  style={styles.guestBannerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="information-circle" size={24} color={Colors.info} />
                  <View style={styles.guestBannerContent}>
                    <Text style={styles.guestBannerTitle}>You're in Guest Mode</Text>
                    <Text style={styles.guestBannerText}>
                      Tap here to sign up and save your data permanently
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color={Colors.info} />
                </LinearGradient>
              </GlassCard>
            </TouchableOpacity>
          )}

          {/* Hero Profile Card */}
          <GlassCard style={styles.profileCard} intensity="dark">
            <View style={styles.profileTop}>
              <View style={styles.userInfo}>
                <View style={styles.userInfoHeader}>
                  <View style={styles.userNameSection}>
                    <Text style={styles.userName}>{userProfile.fullName || 'Welcome'}</Text>
                    {!isGuest && (
                      <Text style={styles.userEmail}>{userProfile.email || 'user@finnest.com'}</Text>
                    )}
                    {isGuest && (
                      <Text style={styles.userEmail}>Guest Mode - Data stored locally</Text>
                    )}
                  </View>

                  {/* Target Goal Display - Only if set */}
                  {userProfile.targetAmount && userProfile.targetAmount > 0 && (
                    <TouchableOpacity
                      style={styles.targetGoalBadge}
                      onPress={() => setTargetGoalVisible(true)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={['rgba(255, 215, 0, 0.25)', 'rgba(255, 215, 0, 0.1)']}
                        style={styles.targetGoalGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <View style={styles.targetGoalIconWrapper}>
                          <Ionicons name="flag" size={12} color={Colors.gold} />
                        </View>
                        <View style={styles.targetGoalContent}>
                          <Text style={styles.targetGoalLabel}>GOAL</Text>
                          <Text style={styles.targetGoalAmount}>
                            {formatCurrency(userProfile.targetAmount)}
                          </Text>
                          {userProfile.targetDate && (
                            <Text style={styles.targetGoalDate}>
                              {new Date(userProfile.targetDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                            </Text>
                          )}
                        </View>
                        <Ionicons name="pencil" size={12} color={Colors.gold} style={styles.editIcon} />
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.memberSince}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.lightGray} />
                  <Text style={styles.memberText}>
                    Member since {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Simple Stats without SVG */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <View style={{ alignItems: 'center', justifyContent: 'center', height: 110 }}>
                  <View style={[styles.statCircleMedium, { backgroundColor: 'rgba(255, 215, 0, 0.15)', borderColor: Colors.gold }]}>
                    <Text style={[styles.statValue, { fontSize: Typography.sizes.lg, color: Colors.gold }]}>{uniqueAccounts}</Text>
                  </View>
                </View>
                <Text style={[styles.statLabel, { marginTop: Spacing.sm }]}>ISA Accounts</Text>
              </View>

              <View style={styles.statBox}>
                <View style={{ alignItems: 'center', justifyContent: 'center', height: 110 }}>
                  <View style={[styles.statCircleMedium, { backgroundColor: 'rgba(33, 150, 243, 0.15)', borderColor: '#2196F3' }]}>
                    <Text style={[styles.statValue, { fontSize: Typography.sizes.lg, color: '#2196F3' }]} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(totalAllTime)}</Text>
                  </View>
                </View>
                <Text style={[styles.statLabel, { marginTop: Spacing.sm }]}>Total Saved</Text>
              </View>
            </View>
          </GlassCard>

          {/* Simple divider instead of SVG */}
          <View style={{ height: 20, marginVertical: Spacing.md }} />

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity onPress={() => setPersonalInfoVisible(true)}>
              <GlassCard style={styles.menuCard} intensity="medium">
                <View style={styles.menuItem}>
                  <Ionicons name="person-outline" size={24} color={Colors.gold} />
                  <Text style={styles.menuText}>Personal Information</Text>
                  <Ionicons name="chevron-forward" size={22} color={Colors.lightGray} />
                </View>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setNotificationsVisible(true)}>
              <GlassCard style={styles.menuCard} intensity="medium">
                <View style={styles.menuItem}>
                  <Ionicons name="notifications-outline" size={24} color={Colors.info} />
                  <Text style={styles.menuText}>Notifications</Text>
                  <Ionicons name="chevron-forward" size={22} color={Colors.lightGray} />
                </View>
              </GlassCard>
            </TouchableOpacity>
          </View>

          {/* Simple divider instead of SVG */}
          <View style={{ height: 20, marginVertical: Spacing.md }} />

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>

            <TouchableOpacity onPress={() => setCalculatorVisible(true)}>
              <GlassCard style={styles.menuCard} intensity="medium">
                <View style={styles.menuItem}>
                  <Ionicons name="calculator" size={24} color={Colors.info} />
                  <Text style={styles.menuText}>Flexible ISA Calculator</Text>
                  <Ionicons name="chevron-forward" size={22} color={Colors.lightGray} />
                </View>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setContactSupportVisible(true)}>
              <GlassCard style={styles.menuCard} intensity="medium">
                <View style={styles.menuItem}>
                  <Ionicons name="chatbubble-outline" size={24} color={Colors.success} />
                  <Text style={styles.menuText}>Contact Support</Text>
                  <Ionicons name="chevron-forward" size={22} color={Colors.lightGray} />
                </View>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTermsVisible(true)}>
              <GlassCard style={styles.menuCard} intensity="medium">
                <View style={styles.menuItem}>
                  <Ionicons name="document-text-outline" size={24} color={Colors.gold} />
                  <Text style={styles.menuText}>Terms & Conditions</Text>
                  <Ionicons name="chevron-forward" size={22} color={Colors.lightGray} />
                </View>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPrivacyVisible(true)}>
              <GlassCard style={styles.menuCard} intensity="medium">
                <View style={styles.menuItem}>
                  <Ionicons name="shield-outline" size={24} color={Colors.warning} />
                  <Text style={styles.menuText}>Privacy Policy</Text>
                  <Ionicons name="chevron-forward" size={22} color={Colors.lightGray} />
                </View>
              </GlassCard>
            </TouchableOpacity>
          </View>

          {/* Logout and Delete Account Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButtonWrapper} onPress={handleLogout}>
              <GlassCard style={styles.logoutCard} intensity="medium">
                <View style={styles.logoutButton}>
                  <Ionicons name="log-out-outline" size={20} color={Colors.warning} />
                  <Text style={styles.logoutText}>Log Out</Text>
                </View>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonWrapper} onPress={handleDeleteAccount}>
              <GlassCard style={styles.deleteCard} intensity="medium">
                <View style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  <Text style={styles.deleteText}>Delete Account</Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          </View>

          {/* Version */}
          <Text style={styles.version}>FinNest v1.0.0</Text>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      <PersonalInfoModal
        visible={personalInfoVisible}
        onClose={() => setPersonalInfoVisible(false)}
      />
      <ISAAccountsModal
        visible={isaAccountsVisible}
        onClose={() => setIsaAccountsVisible(false)}
        contributions={contributions}
      />
      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
      <TermsModal
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
      />
      <PrivacyPolicyModal
        visible={privacyVisible}
        onClose={() => setPrivacyVisible(false)}
      />
      <ContactSupportModal
        visible={contactSupportVisible}
        onClose={() => setContactSupportVisible(false)}
      />
      <TargetGoalModal
        visible={targetGoalVisible}
        onClose={() => setTargetGoalVisible(false)}
      />
      <FlexibleCalculatorModal
        visible={calculatorVisible}
        onClose={() => setCalculatorVisible(false)}
        currentContributions={totalAllTime}
      />

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setDeleteModalVisible(false);
          setDeleteText('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <LinearGradient
              colors={[Colors.deepNavy, Colors.navyBlue]}
              style={styles.deleteModalGradient}
            >
              <View style={styles.deleteModalHeader}>
                <Ionicons name="warning" size={48} color={Colors.error} />
                <Text style={styles.deleteModalTitle}>Final Confirmation</Text>
                <Text style={styles.deleteModalSubtitle}>
                  This action is permanent and cannot be undone. All your data will be deleted.
                </Text>
              </View>

              <View style={styles.deleteModalContent}>
                <Text style={styles.deleteModalLabel}>
                  Type <Text style={styles.deleteModalHighlight}>DELETE</Text> to confirm:
                </Text>
                <TextInput
                  style={styles.deleteInput}
                  value={deleteText}
                  onChangeText={setDeleteText}
                  placeholder="Type DELETE here"
                  placeholderTextColor={Colors.mediumGray}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={styles.deleteModalCancelButton}
                  onPress={() => {
                    setDeleteModalVisible(false);
                    setDeleteText('');
                  }}
                >
                  <Text style={styles.deleteModalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deleteModalConfirmButton,
                    deleteText.toUpperCase() !== 'DELETE' && styles.deleteModalConfirmButtonDisabled
                  ]}
                  onPress={handleDeleteAccountConfirm}
                  disabled={deleteText.toUpperCase() !== 'DELETE'}
                >
                  <Text style={styles.deleteModalConfirmText}>Delete Forever</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.sizes.xxl,
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
  },
  logo: {
    width: 60,
    height: 60,
  },
  profileCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  profileTop: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassLight,
  },
  userInfo: {
    width: '100%',
  },
  userInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userNameSection: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.sizes.xl,
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
  },
  targetGoalBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  targetGoalGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    position: 'relative',
  },
  targetGoalIconWrapper: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  targetGoalContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetGoalLabel: {
    fontSize: 9,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  targetGoalAmount: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
    marginBottom: 1,
  },
  targetGoalDate: {
    fontSize: Typography.sizes.xxs,
    color: Colors.lightGray,
    fontWeight: Typography.weights.medium,
  },
  editIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    opacity: 0.7,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: Spacing.xl,
  },
  statBox: {
    alignItems: 'center',
  },
  statCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  statCircleLarge: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    paddingHorizontal: 8,
  },
  statCircleMedium: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    paddingHorizontal: 6,
  },
  statValue: {
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
  },
  menuCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuText: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  menuSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginRight: Spacing.xs,
  },
  badge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
    marginRight: Spacing.xs,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
  logoutCard: {
    padding: Spacing.md,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 56,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 40,
  },
  logoutText: {
    fontSize: Typography.sizes.md,
    color: Colors.error,
    fontWeight: Typography.weights.bold,
  },
  version: {
    fontSize: Typography.sizes.xs,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButtonWrapper: {
    flex: 1,
  },
  deleteCard: {
    padding: Spacing.md,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 56,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 40,
  },
  deleteText: {
    fontSize: Typography.sizes.md,
    color: Colors.error,
    fontWeight: Typography.weights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  deleteModalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  deleteModalGradient: {
    padding: Spacing.xl,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  deleteModalTitle: {
    fontSize: Typography.sizes.xxxl,
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  deleteModalSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  deleteModalContent: {
    marginBottom: Spacing.xl,
  },
  deleteModalLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  deleteModalHighlight: {
    color: Colors.error,
    fontWeight: Typography.weights.bold,
  },
  deleteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: Colors.error,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    textAlign: 'center',
    fontWeight: Typography.weights.bold,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  deleteModalCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  deleteModalCancelText: {
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  deleteModalConfirmButton: {
    flex: 1,
    backgroundColor: Colors.error,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  deleteModalConfirmButtonDisabled: {
    backgroundColor: Colors.mediumGray,
    opacity: 0.5,
  },
  deleteModalConfirmText: {
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  guestBanner: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  guestBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  guestBannerContent: {
    flex: 1,
  },
  guestBannerTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
  },
  guestBannerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },
});
