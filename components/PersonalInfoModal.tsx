import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import GlassCard from './GlassCard';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { supabase } from '@/lib/supabase';

interface PersonalInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PersonalInfoModal({ visible, onClose }: PersonalInfoModalProps) {
  const { userProfile, updateProfile, isGuest } = useOnboarding();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationalInsurance, setNationalInsurance] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Load user profile data when modal opens
  useEffect(() => {
    if (visible) {
      setFullName(userProfile.fullName || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phoneNumber || '');
      setDateOfBirth(userProfile.dateOfBirth || '');
      setNationalInsurance(userProfile.nationalInsuranceNumber || '');
    }
  }, [visible, userProfile]);

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Update the user profile in context and AsyncStorage
    updateProfile({
      fullName,
      email,
      phoneNumber: phone,
      dateOfBirth,
      nationalInsuranceNumber: nationalInsurance,
    });

    Alert.alert('Success', 'Personal information updated successfully!');
    onClose();
  };

  const handlePasswordChange = async () => {
    // Guest users can't change password
    if (isGuest) {
      Alert.alert('Not Available', 'Password change is not available in guest mode. Please create an account.');
      return;
    }

    // Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userProfile.email || '',
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      Alert.alert(
        'Password Changed',
        'Your password has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmNewPassword('');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Password change error:', error);
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Personal Information"
      icon="person-outline"
    >
      <View style={styles.container}>
        {/* Info Notice */}
        <GlassCard style={styles.noticeCard} intensity="medium">
          <View style={styles.noticeHeader}>
            <Ionicons name="information-circle" size={20} color={Colors.info} />
            <Text style={styles.noticeText}>
              Your information is encrypted and secure
            </Text>
          </View>
        </GlassCard>

        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.mediumGray}
              value={fullName}
              onChangeText={setFullName}
            />
          </GlassCard>
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor={Colors.mediumGray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </GlassCard>
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="+44 7700 900000"
              placeholderTextColor={Colors.mediumGray}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </GlassCard>
        </View>

        {/* Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="Street address"
              placeholderTextColor={Colors.mediumGray}
              value={address}
              onChangeText={setAddress}
            />
          </GlassCard>
        </View>

        {/* City and Postcode */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.sm }]}>
            <Text style={styles.label}>City</Text>
            <GlassCard style={styles.inputCard} intensity="medium">
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor={Colors.mediumGray}
                value={city}
                onChangeText={setCity}
              />
            </GlassCard>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.sm }]}>
            <Text style={styles.label}>Postcode</Text>
            <GlassCard style={styles.inputCard} intensity="medium">
              <TextInput
                style={styles.input}
                placeholder="SW1A 1AA"
                placeholderTextColor={Colors.mediumGray}
                value={postcode}
                onChangeText={setPostcode}
                autoCapitalize="characters"
              />
            </GlassCard>
          </View>
        </View>

        {/* Date of Birth */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={Colors.mediumGray}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
          </GlassCard>
        </View>

        {/* National Insurance */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>National Insurance Number</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="AB123456C"
              placeholderTextColor={Colors.mediumGray}
              value={nationalInsurance}
              onChangeText={setNationalInsurance}
              autoCapitalize="characters"
            />
          </GlassCard>
        </View>

        {/* Password Change Section */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Change Password</Text>

        {/* Current Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter current password"
                placeholderTextColor={Colors.mediumGray}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.lightGray}
                />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>

        {/* New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter new password"
                placeholderTextColor={Colors.mediumGray}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.lightGray}
                />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>

        {/* Confirm New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm new password"
                placeholderTextColor={Colors.mediumGray}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry={!showConfirmNewPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.lightGray}
                />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>

        {/* Change Password Button */}
        <TouchableOpacity onPress={handlePasswordChange}>
          <LinearGradient
            colors={['#4A90E2', '#2B4F7E']}
            style={styles.passwordButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="lock-closed" size={24} color={Colors.white} />
            <Text style={styles.passwordButtonText}>Update Password</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity onPress={handleSave}>
          <LinearGradient
            colors={Colors.goldGradient}
            style={styles.saveButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark-circle" size={24} color={Colors.deepNavy} />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  noticeCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  noticeText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  inputCard: {
    padding: Spacing.md,
  },
  input: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  saveButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  passwordButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
});
