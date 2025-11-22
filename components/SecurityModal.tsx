import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import GlassCard from './GlassCard';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface SecurityModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SecurityModal({ visible, onClose }: SecurityModalProps) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    Alert.alert('Success', 'Password changed successfully!');
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleEnable2FA = () => {
    if (!twoFactorEnabled) {
      Alert.alert(
        'Enable Two-Factor Authentication',
        'You will receive a verification code via SMS or email when logging in.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setTwoFactorEnabled(true);
              Alert.alert('Success', 'Two-factor authentication enabled!');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Disable Two-Factor Authentication',
        'Are you sure? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              setTwoFactorEnabled(false);
            },
          },
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Security Settings"
      icon="shield-checkmark-outline"
    >
      <View style={styles.container}>
        {/* Security Status Card */}
        <GlassCard style={styles.statusCard} intensity="dark">
          <LinearGradient
            colors={[Colors.success + 'DD', Colors.success + '88']}
            style={styles.statusGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statusHeader}>
              <Ionicons name="shield-checkmark" size={40} color={Colors.white} />
              <View style={styles.statusText}>
                <Text style={styles.statusTitle}>Security Status</Text>
                <Text style={styles.statusSubtitle}>
                  {twoFactorEnabled ? 'Excellent' : 'Good'}
                </Text>
              </View>
            </View>
            <Text style={styles.statusDesc}>
              {twoFactorEnabled
                ? 'Your account is well protected with 2FA enabled'
                : 'Enable 2FA for maximum security'}
            </Text>
          </LinearGradient>
        </GlassCard>

        {/* Change Password Section */}
        <Text style={styles.sectionTitle}>Password</Text>
        {!showChangePassword ? (
          <GlassCard style={styles.optionCard} intensity="medium">
            <TouchableOpacity
              onPress={() => setShowChangePassword(true)}
              style={styles.option}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: Colors.gold + '30' }]}>
                  <Ionicons name="key-outline" size={24} color={Colors.gold} />
                </View>
                <View>
                  <Text style={styles.optionTitle}>Change Password</Text>
                  <Text style={styles.optionDesc}>
                    Update your account password
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
            </TouchableOpacity>
          </GlassCard>
        ) : (
          <GlassCard style={styles.formCard} intensity="medium">
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor={Colors.mediumGray}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor={Colors.mediumGray}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
              <Text style={styles.helperText}>
                Must be at least 8 characters long
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor={Colors.mediumGray}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity onPress={handleChangePassword}>
              <LinearGradient
                colors={Colors.goldGradient}
                style={styles.saveButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.saveButtonText}>Update Password</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowChangePassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Two-Factor Authentication */}
        <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
        <GlassCard style={styles.optionCard} intensity="medium">
          <TouchableOpacity onPress={handleEnable2FA} style={styles.option}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.info + '30' }]}>
                <Ionicons name="phone-portrait-outline" size={24} color={Colors.info} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Two-Factor Authentication</Text>
                <Text style={styles.optionDesc}>
                  {twoFactorEnabled
                    ? 'Enabled - Extra security layer active'
                    : 'Disabled - Tap to enable for better security'}
                </Text>
              </View>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleEnable2FA}
              trackColor={{ false: Colors.mediumGray, true: Colors.gold + '60' }}
              thumbColor={twoFactorEnabled ? Colors.gold : Colors.lightGray}
              ios_backgroundColor={Colors.mediumGray}
            />
          </TouchableOpacity>
        </GlassCard>

        {/* Biometric Login */}
        <Text style={styles.sectionTitle}>Biometric Security</Text>
        <GlassCard style={styles.optionCard} intensity="medium">
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.success + '30' }]}>
                <Ionicons name="finger-print" size={24} color={Colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Biometric Login</Text>
                <Text style={styles.optionDesc}>
                  Use fingerprint or Face ID to log in
                </Text>
              </View>
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

        {/* Security Alerts */}
        <Text style={styles.sectionTitle}>Security Alerts</Text>

        <GlassCard style={styles.optionCard} intensity="medium">
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.warning + '30' }]}>
                <Ionicons name="mail-outline" size={24} color={Colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Email Alerts</Text>
                <Text style={styles.optionDesc}>
                  Get notified of important account changes
                </Text>
              </View>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: Colors.mediumGray, true: Colors.gold + '60' }}
              thumbColor={emailAlerts ? Colors.gold : Colors.lightGray}
              ios_backgroundColor={Colors.mediumGray}
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.optionCard} intensity="medium">
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.error + '30' }]}>
                <Ionicons name="alert-circle-outline" size={24} color={Colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Login Alerts</Text>
                <Text style={styles.optionDesc}>
                  Alert me of new device logins
                </Text>
              </View>
            </View>
            <Switch
              value={loginAlerts}
              onValueChange={setLoginAlerts}
              trackColor={{ false: Colors.mediumGray, true: Colors.gold + '60' }}
              thumbColor={loginAlerts ? Colors.gold : Colors.lightGray}
              ios_backgroundColor={Colors.mediumGray}
            />
          </View>
        </GlassCard>

        {/* Active Sessions */}
        <Text style={styles.sectionTitle}>Active Sessions</Text>
        <GlassCard style={styles.sessionCard} intensity="medium">
          <View style={styles.sessionHeader}>
            <View style={styles.sessionIcon}>
              <Ionicons name="phone-portrait" size={24} color={Colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionDevice}>iPhone 14 Pro</Text>
              <Text style={styles.sessionLocation}>London, UK</Text>
              <Text style={styles.sessionTime}>Current session</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard style={styles.sessionCard} intensity="medium">
          <View style={styles.sessionHeader}>
            <View style={styles.sessionIcon}>
              <Ionicons name="desktop" size={24} color={Colors.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionDevice}>Chrome on MacBook</Text>
              <Text style={styles.sessionLocation}>London, UK</Text>
              <Text style={styles.sessionTime}>Last active 2 hours ago</Text>
            </View>
            <TouchableOpacity style={styles.endSessionButton}>
              <Text style={styles.endSessionText}>End</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  statusCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  statusGradient: {
    padding: Spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusText: {
    marginLeft: Spacing.md,
  },
  statusTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  statusSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    opacity: 0.9,
  },
  statusDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 18,
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  passwordInput: {
    backgroundColor: Colors.glassLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  input: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  helperText: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    marginTop: Spacing.xs,
  },
  saveButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
  cancelButton: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    fontWeight: Typography.weights.semibold,
  },
  sessionCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.gold + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sessionDevice: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  sessionLocation: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },
  sessionTime: {
    fontSize: Typography.sizes.xs,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  endSessionButton: {
    backgroundColor: Colors.error + '30',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 12,
  },
  endSessionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.error,
    fontWeight: Typography.weights.semibold,
  },
});
