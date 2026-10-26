import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Modal from './Modal';
import { Input, Button, ActionSheet } from '@/components/ui';
import { Colors, Spacing, Type } from '@/constants/theme';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { haptics } from '@/utils/haptics';

interface TargetGoalModalProps {
  visible: boolean;
  onClose: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Stored goal dates come in three shapes: DD/MM/YYYY (onboarding), a full ISO
 * timestamp (older versions of this sheet) and YYYY-MM-DD (this sheet now).
 * Normalise any of them to the DD/MM/YYYY the input expects.
 */
function toInputDate(value?: string): string {
  if (!value) return '';
  const v = value.trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) {
    const [d, m, y] = v.split('/');
    return `${pad(Number(d))}/${pad(Number(m))}/${y}`;
  }
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (ymd) return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

// Display the raw amount with thousands separators: "25000.5" → "25,000.5"
function formatAmountInput(raw: string): string {
  if (!raw) return '';
  const [int, dec] = raw.split('.');
  const grouped = (int || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec !== undefined ? `${grouped}.${dec}` : grouped;
}

export default function TargetGoalModal({ visible, onClose }: TargetGoalModalProps) {
  const { userProfile, updateProfile } = useOnboarding();
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmRemove, setConfirmRemove] = useState(false);

  const hasGoal = !!userProfile.targetAmount && userProfile.targetAmount > 0;

  useEffect(() => {
    if (visible) {
      setTargetAmount(hasGoal ? String(userProfile.targetAmount) : '');
      setTargetDate(toInputDate(userProfile.targetDate));
      setErrors({});
    }
  }, [visible, userProfile, hasGoal]);

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

  const handleAmountChange = (text: string) => {
    // Keep digits and a single decimal point; commas are display-only
    const cleaned = text.replace(/[^0-9.]/g, '');
    const [int, ...rest] = cleaned.split('.');
    setTargetAmount(rest.length ? `${int}.${rest.join('')}` : int);
    if (errors.targetAmount) setErrors((e) => ({ ...e, targetAmount: '' }));
  };

  const handleDateChange = (text: string) => {
    setTargetDate(formatDateInput(text));
    if (errors.targetDate) setErrors((e) => ({ ...e, targetDate: '' }));
  };

  const parseDate = (dateString: string): Date | null => {
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    const date = new Date(year, month - 1, day);
    // Reject dates that roll over, e.g. 31/02 → 3 March
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
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
      const date = targetDate.length === 10 ? parseDate(targetDate) : null;
      if (!date) {
        newErrors.targetDate = 'Please enter a valid date (DD/MM/YYYY)';
      } else if (date < new Date()) {
        newErrors.targetDate = 'Target date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      haptics.warning();
      return;
    }
    const amount = parseFloat(targetAmount);
    // Saved as a date-only ISO string (YYYY-MM-DD) built from local parts, so
    // it reads correctly with new Date(), suits a Postgres date column and
    // can't shift a day through timezone conversion.
    const parsed = targetDate ? parseDate(targetDate) : null;
    const date = parsed ? `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}` : '';

    await updateProfile({
      targetAmount: amount,
      targetDate: date,
    });

    haptics.success();
    onClose();
  };

  const handleRemove = async () => {
    await updateProfile({
      targetAmount: 0,
      targetDate: '',
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={hasGoal ? 'Edit savings goal' : 'Set a savings goal'}
      subtitle="Track your progress towards a target amount."
      size="auto"
      footer={<Button title="Save goal" onPress={handleSave} />}
    >
      <View style={styles.content}>
        <Input
          label="Target amount"
          value={targetAmount ? `£${formatAmountInput(targetAmount)}` : ''}
          onChangeText={handleAmountChange}
          placeholder="£25,000"
          keyboardType="decimal-pad"
          error={errors.targetAmount || null}
          hint="Your total savings goal"
          style={styles.amountText}
          accessibilityLabel="Target amount in pounds"
        />

        <Input
          label="Target date (optional)"
          icon="calendar-outline"
          value={targetDate}
          onChangeText={handleDateChange}
          placeholder="DD/MM/YYYY"
          keyboardType="number-pad"
          maxLength={10}
          error={errors.targetDate || null}
          hint="When do you want to reach this goal?"
        />

        {hasGoal && (
          <Button
            title="Remove goal"
            variant="danger"
            size="md"
            icon="trash-outline"
            onPress={() => setConfirmRemove(true)}
          />
        )}
      </View>

      <ActionSheet
        visible={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        title="Remove savings goal?"
        message="Your contributions stay as they are — only the target is cleared."
        actions={[{ label: 'Remove goal', icon: 'trash-outline', destructive: true, onPress: handleRemove }]}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
  },
  // Replaces Input's text style to give the amount a large figure
  amountText: {
    flex: 1,
    height: '100%',
    ...Type.title2,
    ...Type.number,
    lineHeight: undefined,
    color: Colors.text,
    outlineStyle: 'none',
  } as any,
});
