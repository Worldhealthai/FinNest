import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import { Input, Button, SectionHeader } from '@/components/ui';
import { Colors, Spacing, Type, BorderRadius } from '@/constants/theme';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { supabase } from '@/lib/supabase';
import { haptics } from '@/utils/haptics';

interface PersonalInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

type PasswordErrors = Partial<Record<'current' | 'new' | 'confirm' | 'form', string>>;

function EyeToggle({ shown, onPress }: { shown: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityLabel={shown ? 'Hide password' : 'Show password'}>
      <Ionicons name={shown ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textTertiary} />
    </Pressable>
  );
}

export default function PersonalInfoModal({ visible, onClose }: PersonalInfoModalProps) {
  const { userProfile, updateProfile, isGuest } = useOnboarding();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Load user profile data when modal opens
  useEffect(() => {
    if (visible) {
      setFullName(userProfile.fullName || '');
      setPhone(userProfile.phoneNumber || '');
      setDateOfBirth(userProfile.dateOfBirth || '');
      setNameError(null);
    }
  }, [visible, userProfile]);

  // Start each visit with a clean password form
  useEffect(() => {
    if (!visible) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordErrors({});
      setPasswordChanged(false);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      setNameError('Please enter your full name');
      haptics.warning();
      return;
    }

    // Email is read-only here: it's the login identity, which this sheet
    // can't change, so it's left out of the update.
    updateProfile({
      fullName,
      phoneNumber: phone,
      dateOfBirth,
    });

    haptics.success();
    onClose();
  };

  const handlePasswordChange = async () => {
    setPasswordChanged(false);

    // Validation
    const errors: PasswordErrors = {};
    if (!currentPassword) errors.current = 'Enter your current password';
    if (!newPassword) errors.new = 'Enter a new password';
    else if (newPassword.length < 6) errors.new = 'New password must be at least 6 characters long';
    if (!confirmNewPassword) errors.confirm = 'Confirm your new password';
    else if (newPassword && newPassword !== confirmNewPassword) errors.confirm = 'New passwords do not match';

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) {
      haptics.warning();
      return;
    }

    setPasswordSaving(true);
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userProfile.email || '',
        password: currentPassword,
      });

      if (signInError) {
        setPasswordErrors({ current: 'Current password is incorrect' });
        haptics.warning();
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordChanged(true);
      haptics.success();
    } catch (error: any) {
      console.error('Password change error:', error);
      setPasswordErrors({ form: error?.message || 'Failed to change password. Please try again.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const clearPasswordError = (key: keyof PasswordErrors) => {
    setPasswordChanged(false);
    if (passwordErrors[key] || passwordErrors.form) {
      setPasswordErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Personal information"
      footer={<Button title="Save changes" onPress={handleSave} />}
    >
      {/* ─── Details ─── */}
      <SectionHeader title="Details" style={styles.firstHeader} />
      <View style={styles.fields}>
        <Input
          label="Full name"
          icon="person-outline"
          value={fullName}
          onChangeText={(t) => {
            setFullName(t);
            if (nameError) setNameError(null);
          }}
          placeholder="Your full name"
          autoCapitalize="words"
          autoComplete="name"
          error={nameError}
        />
        <Input
          label="Email"
          icon="mail-outline"
          value={userProfile.email || ''}
          editable={false}
          hint="This is your sign-in email. Contact support to change your email."
        />
        <Input
          label="Phone number (optional)"
          icon="call-outline"
          value={phone}
          onChangeText={setPhone}
          placeholder="+44 7700 900000"
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <Input
          label="Date of birth (optional)"
          icon="calendar-outline"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="DD/MM/YYYY"
        />
      </View>

      {/* ─── Password ─── */}
      <SectionHeader title="Password" />
      {isGuest ? (
        <Text style={styles.guestText}>
          Password change is not available in guest mode. Create an account to set a password.
        </Text>
      ) : (
        <View style={styles.fields}>
          <Input
            label="Current password"
            icon="lock-closed-outline"
            value={currentPassword}
            onChangeText={(t) => {
              setCurrentPassword(t);
              clearPasswordError('current');
            }}
            placeholder="Enter current password"
            secureTextEntry={!showCurrentPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            error={passwordErrors.current}
            editable={!passwordSaving}
            right={<EyeToggle shown={showCurrentPassword} onPress={() => setShowCurrentPassword(!showCurrentPassword)} />}
          />
          <Input
            label="New password"
            icon="lock-closed-outline"
            value={newPassword}
            onChangeText={(t) => {
              setNewPassword(t);
              clearPasswordError('new');
            }}
            placeholder="At least 6 characters"
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            error={passwordErrors.new}
            editable={!passwordSaving}
            right={<EyeToggle shown={showNewPassword} onPress={() => setShowNewPassword(!showNewPassword)} />}
          />
          <Input
            label="Confirm new password"
            icon="lock-closed-outline"
            value={confirmNewPassword}
            onChangeText={(t) => {
              setConfirmNewPassword(t);
              clearPasswordError('confirm');
            }}
            placeholder="Repeat your new password"
            secureTextEntry={!showConfirmNewPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            error={passwordErrors.confirm}
            editable={!passwordSaving}
            right={
              <EyeToggle
                shown={showConfirmNewPassword}
                onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              />
            }
          />

          {passwordErrors.form ? (
            <View style={[styles.banner, styles.bannerError]} accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle" size={18} color={Colors.negative} />
              <Text style={styles.bannerText}>{passwordErrors.form}</Text>
            </View>
          ) : null}
          {passwordChanged ? (
            <View style={[styles.banner, styles.bannerSuccess]} accessibilityLiveRegion="polite">
              <Ionicons name="checkmark-circle" size={18} color={Colors.positive} />
              <Text style={styles.bannerText}>Your password has been updated.</Text>
            </View>
          ) : null}

          <Button
            title="Update password"
            variant="secondary"
            onPress={handlePasswordChange}
            loading={passwordSaving}
          />
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  firstHeader: {
    marginTop: Spacing.sm,
  },
  fields: {
    gap: Spacing.md,
  },
  guestText: {
    ...Type.callout,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  bannerSuccess: {
    backgroundColor: Colors.positiveMuted,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  bannerError: {
    backgroundColor: Colors.negativeMuted,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  bannerText: {
    ...Type.callout,
    color: Colors.text,
    flex: 1,
  },
});
