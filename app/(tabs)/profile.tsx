import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlassCard from '@/components/GlassCard';
import PersonalInfoModal from '@/components/PersonalInfoModal';
import ISAAccountsModal from '@/components/ISAAccountsModal';
import SecurityModal from '@/components/SecurityModal';
import TermsModal from '@/components/TermsModal';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import { ISAContribution } from '@/components/AddISAContributionModal';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { ISA_ANNUAL_ALLOWANCE, formatCurrency } from '@/constants/isaData';
import { getCurrentTaxYear, isDateInTaxYear } from '@/utils/taxYear';

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
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(true);

  // Modal states
  const [personalInfoVisible, setPersonalInfoVisible] = React.useState(false);
  const [isaAccountsVisible, setIsaAccountsVisible] = React.useState(false);
  const [securityVisible, setSecurityVisible] = React.useState(false);
  const [termsVisible, setTermsVisible] = React.useState(false);
  const [privacyVisible, setPrivacyVisible] = React.useState(false);

  // Contributions state
  const [contributions, setContributions] = useState<ISAContribution[]>([]);

  // Load contributions from AsyncStorage
  const loadContributions = async () => {
    try {
      const savedData = await AsyncStorage.getItem(CONTRIBUTIONS_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setContributions(parsed);
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
    }
  };

  // Load contributions on mount and when screen comes into focus
  useEffect(() => {
    loadContributions();
  }, []);

  // Reload contributions whenever the profile tab is focused
  useFocusEffect(
    React.useCallback(() => {
      loadContributions();
    }, [])
  );

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
          {/* Simple Greeting */}
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>

          {/* Hero Profile Card */}
          <GlassCard style={styles.profileCard} intensity="dark">
            <View style={styles.profileTop}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={Colors.goldGradient}
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={50} color={Colors.white} />
                  </View>
                </LinearGradient>
                <TouchableOpacity style={styles.avatarBadge}>
                  <Ionicons name="camera" size={18} color={Colors.deepNavy} />
                </TouchableOpacity>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>Alex Johnson</Text>
                <Text style={styles.userEmail}>alex.johnson@email.com</Text>
                <View style={styles.memberSince}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.lightGray} />
                  <Text style={styles.memberText}>Member since April 2022</Text>
                </View>
              </View>
            </View>

            {/* Big Stats - 2 Column */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{uniqueAccounts}</Text>
                <Text style={styles.statLabel}>ISA Accounts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{formatCurrency(totalAllTime)}</Text>
                <Text style={styles.statLabel}>Total Saved</Text>
              </View>
            </View>
          </GlassCard>

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

            <TouchableOpacity onPress={() => setIsaAccountsVisible(true)}>
              <GlassCard style={styles.menuCard} intensity="medium">
                <View style={styles.menuItem}>
                  <Ionicons name="wallet-outline" size={24} color={Colors.success} />
                  <Text style={styles.menuText}>Connected Accounts</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{uniqueAccounts}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={Colors.lightGray} />
                </View>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSecurityVisible(true)}>
              <GlassCard style={styles.menuCard} intensity="medium">
                <View style={styles.menuItem}>
                  <Ionicons name="shield-checkmark-outline" size={24} color={Colors.warning} />
                  <Text style={styles.menuText}>Security</Text>
                  <Ionicons name="chevron-forward" size={22} color={Colors.lightGray} />
                </View>
              </GlassCard>
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <GlassCard style={styles.menuCard} intensity="medium">
              <View style={styles.menuItem}>
                <Ionicons name="notifications-outline" size={24} color={Colors.gold} />
                <Text style={styles.menuText}>Notifications</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: Colors.mediumGray, true: Colors.gold + '60' }}
                  thumbColor={notificationsEnabled ? Colors.gold : Colors.lightGray}
                  ios_backgroundColor={Colors.mediumGray}
                />
              </View>
            </GlassCard>

            <GlassCard style={styles.menuCard} intensity="medium">
              <View style={styles.menuItem}>
                <Ionicons name="finger-print" size={24} color={Colors.info} />
                <Text style={styles.menuText}>Biometric Login</Text>
                <Switch
                  value={biometricsEnabled}
                  onValueChange={setBiometricsEnabled}
                  trackColor={{ false: Colors.mediumGray, true: Colors.gold + '60' }}
                  thumbColor={biometricsEnabled ? Colors.gold : Colors.lightGray}
                  ios_backgroundColor={Colors.mediumGray}
                />
              </View>
            </GlassCard>

            <GlassCard style={styles.menuCard} intensity="medium">
              <View style={styles.menuItem}>
                <Ionicons name="moon-outline" size={24} color={Colors.success} />
                <Text style={styles.menuText}>Dark Mode</Text>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{ false: Colors.mediumGray, true: Colors.gold + '60' }}
                  thumbColor={darkModeEnabled ? Colors.gold : Colors.lightGray}
                  ios_backgroundColor={Colors.mediumGray}
                />
              </View>
            </GlassCard>

            <TouchableOpacity>
              <GlassCard style={styles.menuCard} intensity="medium">
                <View style={styles.menuItem}>
                  <Ionicons name="language-outline" size={24} color={Colors.warning} />
                  <Text style={styles.menuText}>Language</Text>
                  <Text style={styles.menuSubtext}>English</Text>
                  <Ionicons name="chevron-forward" size={22} color={Colors.lightGray} />
                </View>
              </GlassCard>
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>

            <TouchableOpacity>
              <GlassCard style={styles.menuCard} intensity="medium">
                <View style={styles.menuItem}>
                  <Ionicons name="help-circle-outline" size={24} color={Colors.info} />
                  <Text style={styles.menuText}>Help Center</Text>
                  <Ionicons name="chevron-forward" size={22} color={Colors.lightGray} />
                </View>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity>
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

          {/* Logout Button */}
          <TouchableOpacity>
            <GlassCard style={styles.logoutCard} intensity="medium">
              <View style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={24} color={Colors.error} />
                <Text style={styles.logoutText}>Log Out</Text>
              </View>
            </GlassCard>
          </TouchableOpacity>

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
      <SecurityModal
        visible={securityVisible}
        onClose={() => setSecurityVisible(false)}
      />
      <TermsModal
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
      />
      <PrivacyPolicyModal
        visible={privacyVisible}
        onClose={() => setPrivacyVisible(false)}
      />
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
    padding: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.sizes.xxxl,
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
    marginBottom: Spacing.xl,
  },
  profileCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassLight,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.lg,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
    backgroundColor: Colors.deepNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.deepNavy,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.sizes.xxl,
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    marginBottom: 8,
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
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.sizes.xxxl,
    color: Colors.gold,
    fontWeight: Typography.weights.extrabold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    fontWeight: Typography.weights.medium,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.glassLight,
    marginHorizontal: Spacing.lg,
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
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  logoutText: {
    fontSize: Typography.sizes.lg,
    color: Colors.error,
    fontWeight: Typography.weights.bold,
  },
  version: {
    fontSize: Typography.sizes.xs,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
});
