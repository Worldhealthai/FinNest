import React from 'react';
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
import AnimatedBackground from '@/components/AnimatedBackground';
import GlassCard from '@/components/GlassCard';
import PersonalInfoModal from '@/components/PersonalInfoModal';
import ISAAccountsModal from '@/components/ISAAccountsModal';
import SecurityModal from '@/components/SecurityModal';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(true);

  // Modal states
  const [personalInfoVisible, setPersonalInfoVisible] = React.useState(false);
  const [isaAccountsVisible, setIsaAccountsVisible] = React.useState(false);
  const [securityVisible, setSecurityVisible] = React.useState(false);

  return (
    <View style={styles.container}>
      <AnimatedBackground />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Creative Header with Logo */}
          <GlassCard style={styles.headerCard} intensity="dark">
            <LinearGradient
              colors={[Colors.deepNavy + 'DD', Colors.mediumNavy + 'AA']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerTop}>
                <View style={styles.logoRow}>
                  <Image
                    source={require('@/assets/logo.png')}
                    style={styles.headerLogo}
                    resizeMode="contain"
                  />
                  <View>
                    <Text style={styles.greeting}>Good Evening, Alex! 👋</Text>
                    <Text style={styles.subGreeting}>Your ISA journey is looking great</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="create-outline" size={24} color={Colors.gold} />
                </TouchableOpacity>
              </View>

              <View style={styles.achievementRow}>
                <View style={styles.achievementBadge}>
                  <Ionicons name="trophy" size={16} color={Colors.gold} />
                  <Text style={styles.achievementText}>ISA Pro</Text>
                </View>
                <View style={[styles.achievementBadge, { backgroundColor: Colors.info + '30', borderColor: Colors.info }]}>
                  <Ionicons name="flash" size={16} color={Colors.info} />
                  <Text style={styles.achievementText}>3 Year Streak</Text>
                </View>
                <View style={[styles.achievementBadge, { backgroundColor: Colors.success + '30', borderColor: Colors.success }]}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.achievementText}>Max Saver</Text>
                </View>
              </View>
            </LinearGradient>
          </GlassCard>

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
                <Text style={styles.progressPercent}>80%</Text>
              </View>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={Colors.goldGradient}
                  style={styles.progressFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.progressSubtext}>You're using your allowance better than 78% of UK savers!</Text>
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
  headerCard: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  headerLogo: {
    width: 50,
    height: 50,
    tintColor: Colors.gold,
  },
  greeting: {
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  subGreeting: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginTop: 2,
  },
  achievementRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gold + '30',
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  achievementText: {
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
  },
  editButton: {
    padding: Spacing.sm,
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
    width: '80%',
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
