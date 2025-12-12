import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PersonalScreen() {
  const { userProfile, updateProfile } = useOnboarding();
  const [dateOfBirth, setDateOfBirth] = useState(userProfile.dateOfBirth || '');
  const [nationalInsuranceNumber, setNationalInsuranceNumber] = useState(
    userProfile.nationalInsuranceNumber || ''
  );
  const [phoneNumber, setPhoneNumber] = useState(userProfile.phoneNumber || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(20);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 600 });
    contentY.value = withSpring(0, { damping: 12 });
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  const formatNINO = (text: string) => {
    // Remove any non-alphanumeric characters
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    // Format as XX 12 34 56 X
    let formatted = '';
    for (let i = 0; i < cleaned.length && i < 9; i++) {
      if (i === 2 || i === 4 || i === 6 || i === 8) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    return formatted;
  };

  const formatDate = (text: string) => {
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

  const formatPhone = (text: string) => {
    // Remove any non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    // Format as 07XXX XXXXXX
    if (cleaned.length <= 5) {
      return cleaned;
    }
    return cleaned.slice(0, 5) + ' ' + cleaned.slice(5, 11);
  };

  const validateAge = (dob: string) => {
    const parts = dob.split('/');
    if (parts.length !== 3) return false;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  };

  const validateNINO = (nino: string) => {
    const cleaned = nino.replace(/\s/g, '');
    // Basic UK NINO format: 2 letters, 6 digits, 1 letter
    return /^[A-Z]{2}\d{6}[A-Z]$/.test(cleaned);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (dateOfBirth.length !== 10) {
      newErrors.dateOfBirth = 'Please enter a valid date (DD/MM/YYYY)';
    } else if (!validateAge(dateOfBirth)) {
      newErrors.dateOfBirth = 'You must be 18 or older to open an ISA';
    }

    if (!nationalInsuranceNumber.trim()) {
      newErrors.nationalInsuranceNumber = 'National Insurance Number is required';
    } else if (!validateNINO(nationalInsuranceNumber)) {
      newErrors.nationalInsuranceNumber = 'Please enter a valid UK NINO';
    }

    if (phoneNumber && phoneNumber.replace(/\s/g, '').length !== 11) {
      newErrors.phoneNumber = 'Please enter a valid UK phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      updateProfile({ dateOfBirth, nationalInsuranceNumber, phoneNumber });
      router.push('/(onboarding)/knowledge');
    }
  };

  const handleSkip = () => {
    updateProfile({ phoneNumber: '' });
    router.push('/(onboarding)/knowledge');
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#0A1929', Colors.deepNavy, Colors.mediumNavy]}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboard}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={contentAnimatedStyle}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={Colors.goldGradient}
                      style={[styles.progress, { width: '33%' }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <Text style={styles.progressText}>Step 2 of 6</Text>
                </View>
              </View>

              {/* Title Section */}
              <View style={styles.titleSection}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.05)']}
                    style={styles.iconGradient}
                  >
                    <Ionicons name="document-text" size={32} color={Colors.gold} />
                  </LinearGradient>
                </View>
                <Text style={styles.title}>Personal Information</Text>
                <Text style={styles.subtitle}>
                  Required for ISA eligibility verification and compliance
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Date of Birth */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Date of Birth <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[styles.inputWrapper, errors.dateOfBirth && styles.inputError]}
                  >
                    <Ionicons name="calendar-outline" size={20} color={Colors.gold} />
                    <TextInput
                      style={styles.input}
                      value={dateOfBirth}
                      onChangeText={(text) => setDateOfBirth(formatDate(text))}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={Colors.mediumGray}
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                  {errors.dateOfBirth && (
                    <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                  )}
                  <Text style={styles.hint}>You must be 18+ to open an ISA account</Text>
                </View>

                {/* National Insurance Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    National Insurance Number <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.nationalInsuranceNumber && styles.inputError,
                    ]}
                  >
                    <Ionicons name="shield-checkmark-outline" size={20} color={Colors.gold} />
                    <TextInput
                      style={styles.input}
                      value={nationalInsuranceNumber}
                      onChangeText={(text) =>
                        setNationalInsuranceNumber(formatNINO(text))
                      }
                      placeholder="XX 12 34 56 X"
                      placeholderTextColor={Colors.mediumGray}
                      autoCapitalize="characters"
                      maxLength={13}
                    />
                  </View>
                  {errors.nationalInsuranceNumber && (
                    <Text style={styles.errorText}>
                      {errors.nationalInsuranceNumber}
                    </Text>
                  )}
                  <Text style={styles.hint}>
                    Required to open an ISA account in the UK
                  </Text>
                </View>

                {/* Phone Number (Optional) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Phone Number{' '}
                    <Text style={styles.optional}>(Optional)</Text>
                  </Text>
                  <View style={[styles.inputWrapper, errors.phoneNumber && styles.inputError]}>
                    <Ionicons name="call-outline" size={20} color={Colors.gold} />
                    <TextInput
                      style={styles.input}
                      value={phoneNumber}
                      onChangeText={(text) => setPhoneNumber(formatPhone(text))}
                      placeholder="07XXX XXXXXX"
                      placeholderTextColor={Colors.mediumGray}
                      keyboardType="phone-pad"
                      maxLength={12}
                    />
                  </View>
                  {errors.phoneNumber && (
                    <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                  )}
                  <Text style={styles.hint}>For important account notifications</Text>
                </View>

                {/* Privacy Notice */}
                <View style={styles.notice}>
                  <Ionicons name="lock-closed" size={20} color={Colors.info} />
                  <Text style={styles.noticeText}>
                    Your personal information is encrypted and never shared with third
                    parties. We comply with GDPR and UK data protection laws.
                  </Text>
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleContinue}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={Colors.goldGradient}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color={Colors.deepNavy} />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                  <Text style={styles.skipText}>Skip Phone Number</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safe: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: Spacing.md,
  },
  progressContainer: {
    gap: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    fontWeight: Typography.weights.semibold,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gold + '40',
  },
  title: {
    fontSize: Typography.sizes.xxl + 4,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    textShadowColor: Colors.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
    marginLeft: 4,
  },
  required: {
    color: Colors.error,
  },
  optional: {
    color: Colors.mediumGray,
    fontSize: Typography.sizes.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  errorText: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginLeft: 4,
    marginTop: -4,
  },
  hint: {
    fontSize: Typography.sizes.xs,
    color: Colors.mediumGray,
    marginLeft: 4,
    marginTop: -4,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  noticeText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    lineHeight: 18,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  button: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  buttonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.extrabold,
    color: Colors.deepNavy,
  },
  skipButton: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gold,
    fontWeight: Typography.weights.semibold,
  },
});
