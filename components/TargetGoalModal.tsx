import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { formatCurrency } from '@/constants/isaData';

interface TargetGoalModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TargetGoalModal({ visible, onClose }: TargetGoalModalProps) {
  const { userProfile, updateProfile } = useOnboarding();
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setTargetAmount(userProfile.targetAmount?.toString() || '');
      setTargetDate(userProfile.targetDate || '');
      setErrors({});
    }
  }, [visible, userProfile]);

  const formatDateInput = (text: string) => {
    // Remove any non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    // Format as DD/MM/YYYY
    let formatted = '';
    for (let i = 0; i < cleaned.length && i < 8; i++) {
      if (i === 2 || i === 4) {
        formatted += '/';
      }
      formatted += cleaned[i];
    }
    return formatted;
  };

  const parseDate = (dateString: string): Date | null => {
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    return new Date(year, month - 1, day);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!targetAmount.trim()) {
      newErrors.targetAmount = 'Target amount is required';
    } else {
      const amount = parseFloat(targetAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.targetAmount = 'Please enter a valid amount';
      }
    }

    if (targetDate.trim()) {
      if (targetDate.length !== 10) {
        newErrors.targetDate = 'Please enter a valid date (DD/MM/YYYY)';
      } else {
        const date = parseDate(targetDate);
        if (!date || date < new Date()) {
          newErrors.targetDate = 'Target date must be in the future';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      const amount = parseFloat(targetAmount);
      const date = targetDate ? parseDate(targetDate)?.toISOString() : '';

      await updateProfile({
        targetAmount: amount,
        targetDate: date,
      });

      Alert.alert('Success', 'Your target goal has been updated!');
      onClose();
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Target Goal',
      'Are you sure you want to remove your target goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await updateProfile({
              targetAmount: 0,
              targetDate: '',
            });
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Edit Target Goal" icon="flag">
      <View style={styles.content}>
        {/* Target Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Target Amount <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.inputWrapper, errors.targetAmount && styles.inputError]}>
            <Text style={styles.currencySymbol}>£</Text>
            <TextInput
              style={styles.input}
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="25000"
              placeholderTextColor={Colors.mediumGray}
              keyboardType="numeric"
            />
          </View>
          {errors.targetAmount && (
            <Text style={styles.errorText}>{errors.targetAmount}</Text>
          )}
          <Text style={styles.hint}>Your total savings goal amount</Text>
        </View>

        {/* Target Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Target Date <Text style={styles.optional}>(Optional)</Text>
          </Text>
          <View style={[styles.inputWrapper, errors.targetDate && styles.inputError]}>
            <Ionicons name="calendar-outline" size={20} color={Colors.gold} />
            <TextInput
              style={styles.input}
              value={targetDate}
              onChangeText={(text) => setTargetDate(formatDateInput(text))}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={Colors.mediumGray}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
          {errors.targetDate && (
            <Text style={styles.errorText}>{errors.targetDate}</Text>
          )}
          <Text style={styles.hint}>When do you want to reach this goal?</Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            Your target goal helps you track progress and stay motivated on your savings journey.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemove}
            activeOpacity={0.7}
          >
            <Text style={styles.removeButtonText}>Remove Goal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Colors.goldGradient}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="checkmark-circle" size={20} color={Colors.deepNavy} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
  },
  required: {
    color: Colors.error,
  },
  optional: {
    color: Colors.lightGray,
    fontSize: Typography.sizes.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: Spacing.xs,
  },
  inputError: {
    borderColor: Colors.error,
  },
  currencySymbol: {
    fontSize: Typography.sizes.xxxl,
    color: Colors.gold,
    fontWeight: Typography.weights.extrabold,
  },
  input: {
    fontSize: Typography.sizes.xxxl,
    color: Colors.gold,
    fontWeight: Typography.weights.extrabold,
    minWidth: 100,
    maxWidth: 200,
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.error,
  },
  hint: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.3)',
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  removeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.error,
    fontWeight: Typography.weights.bold,
  },
  saveButton: {
    flex: 2,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  saveButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.extrabold,
  },
});
