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
    c => !c.deleted && isDateInTaxYear(new Date(c.date), currentTaxYear)
  );
  const totalContributed = currentYearContributions.reduce((sum, c) => sum + c.amount, 0);
  const progressPercentage = Math.min((totalContributed / ISA_ANNUAL_ALLOWANCE) * 100, 100);
  const progressMessage = getProgressMessage(progressPercentage);

  return (
    <View style={styles.container}>
      <AnimatedBackground />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Simple Greeting with Logo */}
          <View style={styles.header}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Image source={require('@/assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Enhanced Profile Card */}
          <GlassCard style={styles.profileCard} intensity="dark">
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={Colors.goldGradient}
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={40} color={Colors.white} />
                  </View>
                </LinearGradient>
                <TouchableOpacity style={styles.avatarBadge}>
                  <Ionicons name="camera" size={16} color={Colors.deepNavy} />
                </TouchableOpacity>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>Alex Johnson</Text>
                <Text style={styles.userEmail}>alex.johnson@email.com</Text>
                <View style={styles.memberSince}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.lightGray} />
                  <Text style={styles.memberText}>ISA Saver since April 2022</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="wallet" size={20} color={Colors.gold} />
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>ISA Accounts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Ionicons name="trending-up" size={20} color={Colors.success} />
                <Text style={styles.statValue}>£16K</Text>
                <Text style={styles.statLabel}>Total Saved</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.info} />
                <Text style={styles.statValue}>£1.2K</Text>
                <Text style={styles.statLabel}>Tax Saved</Text>
              </View>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>ISA Journey Progress</Text>
                <Text style={styles.progressPercent}>{progressPercentage.toFixed(0)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={Colors.goldGradient}
                  style={[styles.progressFill, { width: `${progressPercentage}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.progressSubtext}>{progressMessage}</Text>
            </View>
          </GlassCard>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <GlassCard style={styles.menuCard} intensity="medium">
              <TouchableOpacity style={styles.menuItem} onPress={() => setPersonalInfoVisible(true)}>
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.gold + '30' }]}>
                    <Ionicons name="person-outline" size={20} color={Colors.gold} />
                  </View>
                  <Text style={styles.menuText}>Personal Information</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
              </TouchableOpacity>
            </GlassCard>

            <GlassCard style={styles.menuCard} intensity="medium">
              <TouchableOpacity style={styles.menuItem} onPress={() => setIsaAccountsVisible(true)}>
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.success + '30' }]}>
                    <Ionicons name="wallet-outline" size={20} color={Colors.success} />
                  </View>
                  <Text style={styles.menuText}>Connected Accounts</Text>
                </View>
                <View style={styles.menuRight}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
                </View>
              </TouchableOpacity>
            </GlassCard>

            <GlassCard style={styles.menuCard} intensity="medium">
              <TouchableOpacity style={styles.menuItem} onPress={() => setSecurityVisible(true)}>
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.warning + '30' }]}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={Colors.warning} />
                  </View>
                  <Text style={styles.menuText}>Security</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
              </TouchableOpacity>
            </GlassCard>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <GlassCard style={styles.menuCard} intensity="medium">
              <View style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.gold + '30' }]}>
                    <Ionicons name="notifications-outline" size={20} color={Colors.gold} />
                  </View>
                  <Text style={styles.menuText}>Notifications</Text>
                </View>
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
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.info + '30' }]}>
                    <Ionicons name="finger-print" size={20} color={Colors.info} />
                  </View>
                  <Text style={styles.menuText}>Biometric Login</Text>
                </View>
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
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.success + '30' }]}>
                    <Ionicons name="moon-outline" size={20} color={Colors.success} />
                  </View>
                  <Text style={styles.menuText}>Dark Mode</Text>
                </View>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{ false: Colors.mediumGray, true: Colors.gold + '60' }}
                  thumbColor={darkModeEnabled ? Colors.gold : Colors.lightGray}
                  ios_backgroundColor={Colors.mediumGray}
                />
              </View>
            </GlassCard>

            <GlassCard style={styles.menuCard} intensity="medium">
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.warning + '30' }]}>
                    <Ionicons name="language-outline" size={20} color={Colors.warning} />
                  </View>
                  <Text style={styles.menuText}>Language</Text>
                </View>
                <View style={styles.menuRight}>
                  <Text style={styles.menuSubtext}>English</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
                </View>
              </TouchableOpacity>
            </GlassCard>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>

            <GlassCard style={styles.menuCard} intensity="medium">
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.info + '30' }]}>
                    <Ionicons name="help-circle-outline" size={20} color={Colors.info} />
                  </View>
                  <Text style={styles.menuText}>Help Center</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
              </TouchableOpacity>
            </GlassCard>

            <GlassCard style={styles.menuCard} intensity="medium">
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.success + '30' }]}>
                    <Ionicons name="chatbubble-outline" size={20} color={Colors.success} />
                  </View>
                  <Text style={styles.menuText}>Contact Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
              </TouchableOpacity>
            </GlassCard>

            <GlassCard style={styles.menuCard} intensity="medium">
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.gold + '30' }]}>
                    <Ionicons name="document-text-outline" size={20} color={Colors.gold} />
                  </View>
                  <Text style={styles.menuText}>Terms & Conditions</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
              </TouchableOpacity>
            </GlassCard>

            <GlassCard style={styles.menuCard} intensity="medium">
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.warning + '30' }]}>
                    <Ionicons name="shield-outline" size={20} color={Colors.warning} />
                  </View>
                  <Text style={styles.menuText}>Privacy Policy</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
              </TouchableOpacity>
            </GlassCard>
          </View>

          {/* Logout Button */}
          <GlassCard style={styles.logoutCard} intensity="medium">
            <TouchableOpacity style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color={Colors.error} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </GlassCard>

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
    fontWeight: Typography.weights.bold,
  },
  logo: {
    width: 60,
    height: 60,
  },
  profileCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassLight,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  memberText: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    backgroundColor: Colors.deepNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.deepNavy,
  },
  userName: {
    fontSize: Typography.sizes.xl,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: Typography.sizes.lg,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.glassLight,
  },
  progressSection: {
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.glassLight,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
  },
  progressPercent: {
    fontSize: Typography.sizes.md,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.glassLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    lineHeight: 18,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuText: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  menuSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },
  badge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
  logoutCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: Typography.sizes.md,
    color: Colors.error,
    fontWeight: Typography.weights.semibold,
  },
  version: {
    fontSize: Typography.sizes.xs,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});
