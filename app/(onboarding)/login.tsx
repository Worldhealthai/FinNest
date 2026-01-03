import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useOnboarding } from '@/contexts/OnboardingContext';
import TermsModal from '@/components/TermsModal';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const { login, signup, continueAsGuest } = useOnboarding();

  // Animations
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const ringRotate = useSharedValue(0);

  useEffect(() => {
    // Logo animation
    logoScale.value = withSpring(1, { damping: 10, stiffness: 80 });
    logoOpacity.value = withTiming(1, { duration: 800 });

    // Form animation
    setTimeout(() => {
      formOpacity.value = withTiming(1, { duration: 600 });
    }, 400);

    // Glow pulse
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Ring rotation
    ringRotate.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotate.value}deg` }],
  }));

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (isLogin) {
      // Login
      setLoginError(false);
      setIsLoading(true);
      const success = await login(email, password);
      setIsLoading(false);

      if (!success) {
        setLoginError(true);
      }
    } else {
      // Signup
      if (!fullName) {
        Alert.alert('Required Fields', 'Please enter your full name.');
        return;
      }

      if (!agreedToTerms) {
        setTermsError(true);
        return;
      }

      if (password.length < 6) {
        Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match.');
        return;
      }

      setIsLoading(true);
      const success = await signup(email, password, fullName);
      setIsLoading(false);

      if (success) {
        // Skip account screen since we already collected this info
        // Navigate directly to personal information screen
        router.replace('/(onboarding)/personal');
      } else {
        Alert.alert('Signup Failed', 'An account with this email already exists.');
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setAgreedToTerms(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Gradient Background */}
      <LinearGradient
        colors={['#0A1929', Colors.deepNavy, '#1A2F4A', Colors.mediumNavy]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated rings */}
      <Animated.View style={[styles.ring, styles.ring1, ringAnimatedStyle]} />
      <Animated.View style={[styles.ring, styles.ring2, ringAnimatedStyle]} />

      {/* Glow effect */}
      <Animated.View style={[styles.glow, glowAnimatedStyle]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
        alwaysBounceVertical={false}
      >
        {/* Logo Section */}
        <Animated.View style={[styles.logoSection, logoAnimatedStyle]}>
          <View style={styles.logoContainer}>
            <View style={styles.hexagon1} />
            <View style={styles.hexagon2} />
            <Image
              source={require('@/assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>FinNest</Text>
          <LinearGradient
            colors={Colors.goldGradient}
            style={styles.underline}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Text style={styles.subtitle}>
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </Text>
        </Animated.View>

        {/* Form Section */}
        <Animated.View style={[styles.formSection, formAnimatedStyle]}>
          {/* Toggle Login/Signup */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
              onPress={() => setIsLogin(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
              onPress={() => setIsLogin(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name Input (Signup only) */}
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={Colors.lightGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={Colors.mediumGray}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={Colors.lightGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.mediumGray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputWrapper, loginError && isLogin && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.lightGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.mediumGray}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setLoginError(false);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={Colors.lightGray}
                />
              </TouchableOpacity>
            </View>
            {loginError && isLogin && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                <Text style={styles.errorText}>
                  Invalid email or password. Please try again.
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password Input (Signup only) */}
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.lightGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor={Colors.mediumGray}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={Colors.lightGray}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Terms & Conditions Checkbox (Signup only) */}
          {!isLogin && (
            <View>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => {
                  setAgreedToTerms(!agreedToTerms);
                  setTermsError(false);
                }}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <View style={[
                  styles.checkbox,
                  agreedToTerms && styles.checkboxChecked,
                  termsError && styles.checkboxError
                ]}>
                  {agreedToTerms && (
                    <Ionicons name="checkmark" size={18} color={Colors.deepNavy} />
                  )}
                </View>
                <Text style={styles.checkboxText}>
                  I agree to the{' '}
                  <Text
                    style={styles.checkboxLink}
                    onPress={(e) => {
                      e.stopPropagation();
                      setShowTermsModal(true);
                    }}
                  >
                    Terms & Conditions
                  </Text>
                  {' '}and{' '}
                  <Text
                    style={styles.checkboxLink}
                    onPress={(e) => {
                      e.stopPropagation();
                      setShowPrivacyModal(true);
                    }}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
              {termsError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={Colors.error} />
                  <Text style={styles.errorText}>
                    Please agree to the Terms & Conditions and Privacy Policy to continue
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <LinearGradient
              colors={Colors.goldGradient}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <Text style={styles.buttonText}>Please wait...</Text>
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    {isLogin ? 'Login' : 'Create Account'}
                  </Text>
                  <Ionicons name="arrow-forward" size={24} color={Colors.deepNavy} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Toggle Link */}
          <TouchableOpacity
            style={styles.toggleLink}
            onPress={toggleMode}
            disabled={isLoading}
          >
            <Text style={styles.toggleLinkText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.toggleLinkBold}>
                {isLogin ? 'Sign Up' : 'Login'}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Guest Mode Button */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={async () => {
              try {
                await continueAsGuest();
                setTimeout(() => {
                  router.replace('/(tabs)');
                }, 150);
              } catch (error) {
                console.error('Guest mode error:', error);
              }
            }}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <View style={styles.guestButtonContent}>
              <Ionicons name="eye-outline" size={20} color={Colors.info} />
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </View>
            <Text style={styles.guestButtonSubtext}>Try the app without signing up</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Terms & Conditions Modal */}
      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepNavy,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 9999,
    opacity: 0.1,
    alignSelf: 'center',
    top: height * 0.05,
  },
  ring1: {
    width: width * 1.2,
    height: width * 1.2,
    borderColor: Colors.gold,
    borderStyle: 'dashed',
  },
  ring2: {
    width: width * 0.8,
    height: width * 0.8,
    borderColor: Colors.info,
  },
  glow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.gold,
    opacity: 0.08,
    alignSelf: 'center',
    top: height * 0.08,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.deepNavy,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.05,
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  hexagon1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderWidth: 2,
    borderColor: Colors.gold + '60',
    borderRadius: 20,
    transform: [{ rotate: '45deg' }],
  },
  hexagon2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderWidth: 1.5,
    borderColor: Colors.info + '40',
    borderRadius: 18,
    transform: [{ rotate: '45deg' }],
  },
  logoImage: {
    width: 100,
    height: 100,
    tintColor: Colors.gold,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 1,
  },
  underline: {
    width: 60,
    height: 3,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.lightGray,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  formSection: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.md,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.gold,
  },
  toggleText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.lightGray,
  },
  toggleTextActive: {
    color: Colors.deepNavy,
  },
  inputContainer: {
    gap: Spacing.sm,
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.white,
    paddingVertical: Spacing.md,
  },
  eyeIcon: {
    padding: Spacing.xs,
  },
  button: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  buttonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.extrabold,
    color: Colors.deepNavy,
    letterSpacing: 0.5,
  },
  toggleLink: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  toggleLinkText: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
  },
  toggleLinkBold: {
    fontWeight: Typography.weights.bold,
    color: Colors.gold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginHorizontal: Spacing.md,
    fontWeight: Typography.weights.medium,
  },
  guestButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  guestButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  guestButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  guestButtonSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  checkboxText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 20,
  },
  checkboxLink: {
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    textDecorationLine: 'underline',
  },
  checkboxError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginLeft: 4,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    lineHeight: 16,
  },
});
