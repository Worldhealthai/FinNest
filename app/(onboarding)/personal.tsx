import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import OnboardingStep from '@/components/OnboardingStep';
import { Button, Input } from '@/components/ui';
import { Colors, Type } from '@/constants/theme';
import { useOnboarding } from '@/contexts/OnboardingContext';

// DD/MM/YYYY as the user types
const formatDate = (text: string) => {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
};

// 07XXX XXXXXX as the user types
const formatPhone = (text: string) => {
  const digits = text.replace(/\D/g, '').slice(0, 11);
  return digits.length <= 5 ? digits : `${digits.slice(0, 5)} ${digits.slice(5)}`;
};

function ageFrom(dob: string): number | null {
  const [d, m, y] = dob.split('/').map((p) => parseInt(p, 10));
  if (!d || !m || !y || y < 1900) return null;
  const birth = new Date(y, m - 1, d);
  // Reject impossible dates like 31/02 that JS would roll over
  if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d) return null;
  const today = new Date();
  let age = today.getFullYear() - y;
  if (today.getMonth() < m - 1 || (today.getMonth() === m - 1 && today.getDate() < d)) age -= 1;
  return age;
}

export default function PersonalScreen() {
  const { userProfile, updateProfile } = useOnboarding();
  const [dateOfBirth, setDateOfBirth] = useState(userProfile.dateOfBirth || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile.phoneNumber || '');
  const [errors, setErrors] = useState<{ dob?: string; phone?: string }>({});

  const handleContinue = () => {
    const next: typeof errors = {};
    const age = dateOfBirth.length === 10 ? ageFrom(dateOfBirth) : null;

    if (!dateOfBirth) next.dob = 'Please enter your date of birth.';
    else if (age === null || age > 120) next.dob = 'Please enter a valid date as DD/MM/YYYY.';
    else if (age < 18) next.dob = 'You need to be 18 or over to open an adult ISA.';

    if (phoneNumber && phoneNumber.replace(/\s/g, '').length !== 11) {
      next.phone = 'Please enter an 11-digit UK mobile number, or leave it blank.';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    updateProfile({ dateOfBirth, phoneNumber });
    router.push('/(onboarding)/goals');
  };

  return (
    <OnboardingStep
      step={1}
      totalSteps={3}
      title="A little about you"
      subtitle="We use your age to show which ISAs you're eligible for — for example, a Lifetime ISA can be opened between 18 and 39."
      footer={<Button title="Continue" onPress={handleContinue} />}
    >
      <View style={styles.fields}>
        <Input
          label="Date of birth"
          icon="calendar-outline"
          value={dateOfBirth}
          onChangeText={(t) => {
            setDateOfBirth(formatDate(t));
            if (errors.dob) setErrors({ ...errors, dob: undefined });
          }}
          placeholder="DD/MM/YYYY"
          keyboardType="number-pad"
          maxLength={10}
          error={errors.dob}
        />
        <Input
          label="Mobile number (optional)"
          icon="call-outline"
          value={phoneNumber}
          onChangeText={(t) => {
            setPhoneNumber(formatPhone(t));
            if (errors.phone) setErrors({ ...errors, phone: undefined });
          }}
          placeholder="07123 456789"
          keyboardType="phone-pad"
          maxLength={12}
          error={errors.phone}
          hint="Only used for important account messages."
        />
      </View>

      <View style={styles.privacy}>
        <Ionicons name="lock-closed-outline" size={16} color={Colors.textTertiary} />
        <Text style={styles.privacyText}>
          Your details are stored securely and never shared without your permission.
        </Text>
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 20,
  },
  privacy: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 28,
  },
  privacyText: {
    ...Type.caption,
    color: Colors.textTertiary,
    flex: 1,
  },
});
