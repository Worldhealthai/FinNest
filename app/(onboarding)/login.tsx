import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  useWindowDimensions,
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
const isWeb = Platform.OS === 'web';

// Marketing copy for the web landing page
const HERO_FEATURES = [
  {
    icon: 'pie-chart' as const,
    title: 'Allowance Tracking',
    text: 'See exactly how much of your £20,000 annual allowance you\'ve used — across every ISA you hold.',
  },
  {
    icon: 'layers' as const,
    title: 'All 4 ISA Types',
    text: 'Cash, Stocks & Shares, Lifetime and Innovative Finance ISAs — tracked together in one place.',
  },
  {
    icon: 'notifications' as const,
    title: 'Tax Year Reminders',
    text: 'Never lose unused allowance again. Smart reminders before the 5 April deadline.',
  },
  {
    icon: 'school' as const,
    title: 'Learn & Level Up',
    text: 'Bite-size ISA guides plus a savings streak system that rewards consistent contributions.',
  },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Create your free account', text: 'Sign up in under a minute — or explore first as a guest.' },
  { step: '2', title: 'Log your ISA contributions', text: 'Pick from 444 UK providers and record contributions as you make them.' },
  { step: '3', title: 'Stay inside your allowance', text: 'Watch your remaining allowance update live and get reminded before deadlines.' },
];

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
  // Inline form error — Alert.alert is a silent no-op on web, so validation
  // messages must render in the page to be seen at all.
  const [formError, setFormError] = useState<string | null>(null);

  const { login, signup, continueAsGuest } = useOnboarding();

  const { width: winWidth } = useWindowDimensions();
  const isWide = isWeb && winWidth >= 900;
  const scrollRef = useRef<ScrollView>(null);
  const formY = useRef(0);

  const scrollToForm = (mode: 'login' | 'signup') => {
    setIsLogin(mode === 'login');
    setFormError(null);
    scrollRef.current?.scrollTo({ y: Math.max(0, formY.current - 24), animated: true });
  };

  const startAsGuest = async () => {
    try {
      await continueAsGuest();
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 150);
    } catch (error) {
      console.error('Guest mode error:', error);
    }
  };

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
    setFormError(null);

    if (!email || !password) {
      setFormError('Please enter your email and password.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address.');
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
        setFormError('Please enter your full name.');
        return;
      }

      if (!agreedToTerms) {
        setTermsError(true);
        return;
      }

      if (password.length < 6) {
        setFormError('Password must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
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
        setFormError('We couldn\'t create your account. An account with this email may already exist.');
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
    setFormError(null);
    setLoginError(false);
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

      {/* Animated rings (native only — web uses the hero layout) */}
      {!isWeb && (
        <>
          <Animated.View style={[styles.ring, styles.ring1, ringAnimatedStyle]} />
          <Animated.View style={[styles.ring, styles.ring2, ringAnimatedStyle]} />
          <Animated.View style={[styles.glow, glowAnimatedStyle]} />
        </>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
        alwaysBounceVertical={false}
      >
        {/* ─── Web landing: nav bar ─── */}
        {isWeb && (
          <View style={styles.webNav}>
            <View style={styles.webNavBrand}>
              <Image source={require('@/assets/logo.png')} style={styles.webNavLogo} resizeMode="contain" />
              <Text style={styles.webNavTitle}>FinNest</Text>
            </View>
            <View style={styles.webNavActions}>
              <TouchableOpacity onPress={() => scrollToForm('login')} style={styles.webNavLink}>
                <Text style={styles.webNavLinkText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => scrollToForm('signup')} activeOpacity={0.85}>
                <LinearGradient
                  colors={Colors.goldGradient}
                  style={styles.webNavCta}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.webNavCtaText}>Get Started</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ─── Web landing: hero ─── */}
        {isWeb && (
          <View style={[styles.webHero, isWide && styles.webHeroWide]}>
            <View style={[styles.webHeroCopy, isWide && styles.webHeroCopyWide]}>
              <View style={styles.webEyebrow}>
                <Ionicons name="shield-checkmark" size={14} color={Colors.gold} />
                <Text style={styles.webEyebrowText}>THE UK ISA TRACKER</Text>
              </View>
              <Text style={[styles.webHeadline, isWide && styles.webHeadlineWide]}>
                Every ISA.{'\n'}
                <Text style={styles.webHeadlineAccent}>One nest.</Text>
              </Text>
              <Text style={styles.webSubhead}>
                Track your £20,000 allowance across Cash, Stocks & Shares, Lifetime and
                Innovative Finance ISAs — with smart reminders before the tax year ends.
              </Text>
              <View style={styles.webHeroCtas}>
                <TouchableOpacity onPress={() => scrollToForm('signup')} activeOpacity={0.85}>
                  <LinearGradient
                    colors={Colors.goldGradient}
                    style={styles.webPrimaryCta}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.webPrimaryCtaText}>Start Free</Text>
                    <Ionicons name="arrow-forward" size={20} color={Colors.deepNavy} />
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={startAsGuest} style={styles.webSecondaryCta} activeOpacity={0.7}>
                  <Ionicons name="eye-outline" size={18} color={Colors.white} />
                  <Text style={styles.webSecondaryCtaText}>Try the demo</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.webTrustRow}>
                <View style={styles.webTrustItem}>
                  <Ionicons name="lock-closed" size={14} color={Colors.lightGray} />
                  <Text style={styles.webTrustText}>Secure by design</Text>
                </View>
                <View style={styles.webTrustItem}>
                  <Ionicons name="business" size={14} color={Colors.lightGray} />
                  <Text style={styles.webTrustText}>444 UK providers</Text>
                </View>
                <View style={styles.webTrustItem}>
                  <Ionicons name="heart" size={14} color={Colors.lightGray} />
                  <Text style={styles.webTrustText}>Free forever</Text>
                </View>
              </View>
            </View>

            {/* Product mock-up card */}
            <View style={[styles.webMockWrap, isWide && styles.webMockWrapWide]}>
              <View style={styles.webMockCard}>
                <View style={styles.webMockHeader}>
                  <Text style={styles.webMockTitle}>2025/26 Tax Year</Text>
                  <View style={styles.webMockBadge}>
                    <Text style={styles.webMockBadgeText}>ON TRACK</Text>
                  </View>
                </View>
                <Text style={styles.webMockAmount}>£13,450</Text>
                <Text style={styles.webMockAmountSub}>of £20,000 allowance used</Text>
                <View style={styles.webMockBarTrack}>
                  <LinearGradient
                    colors={Colors.goldGradient}
                    style={[styles.webMockBarFill, { width: '67%' }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <View style={styles.webMockRows}>
                  <View style={styles.webMockRow}>
                    <View style={[styles.webMockDot, { backgroundColor: '#4A90E2' }]} />
                    <Text style={styles.webMockRowLabel}>Cash ISA</Text>
                    <Text style={styles.webMockRowValue}>£6,200</Text>
                  </View>
                  <View style={styles.webMockRow}>
                    <View style={[styles.webMockDot, { backgroundColor: '#5B9BD5' }]} />
                    <Text style={styles.webMockRowLabel}>Stocks & Shares</Text>
                    <Text style={styles.webMockRowValue}>£4,250</Text>
                  </View>
                  <View style={styles.webMockRow}>
                    <View style={[styles.webMockDot, { backgroundColor: Colors.gold }]} />
                    <Text style={styles.webMockRowLabel}>Lifetime ISA</Text>
                    <Text style={styles.webMockRowValue}>£3,000</Text>
                  </View>
                </View>
                <View style={styles.webMockBonus}>
                  <Ionicons name="gift" size={16} color={Colors.gold} />
                  <Text style={styles.webMockBonusText}>+£750 government LISA bonus earned</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ─── Web landing: stats strip ─── */}
        {isWeb && (
          <View style={[styles.webStats, isWide && styles.webStatsWide]}>
            {[
              { value: '£20,000', label: 'allowance tracked' },
              { value: '444', label: 'UK ISA providers' },
              { value: '4', label: 'ISA types supported' },
              { value: '25%', label: 'LISA bonus monitored' },
            ].map((stat) => (
              <View key={stat.label} style={styles.webStatItem}>
                <Text style={styles.webStatValue}>{stat.value}</Text>
                <Text style={styles.webStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ─── Web landing: features ─── */}
        {isWeb && (
          <View style={styles.webSection}>
            <Text style={styles.webSectionTitle}>Built for UK savers</Text>
            <Text style={styles.webSectionSub}>
              Everything you need to make the most of your tax-free allowance.
            </Text>
            <View style={[styles.webFeatureGrid, isWide && styles.webFeatureGridWide]}>
              {HERO_FEATURES.map((feature) => (
                <View key={feature.title} style={[styles.webFeatureCard, isWide && styles.webFeatureCardWide]}>
                  <View style={styles.webFeatureIcon}>
                    <Ionicons name={feature.icon} size={24} color={Colors.gold} />
                  </View>
                  <Text style={styles.webFeatureTitle}>{feature.title}</Text>
                  <Text style={styles.webFeatureText}>{feature.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ─── Web landing: how it works ─── */}
        {isWeb && (
          <View style={styles.webSection}>
            <Text style={styles.webSectionTitle}>Up and running in minutes</Text>
            <View style={[styles.webStepsRow, isWide && styles.webStepsRowWide]}>
              {HOW_IT_WORKS.map((item) => (
                <View key={item.step} style={[styles.webStepCard, isWide && styles.webStepCardWide]}>
                  <View style={styles.webStepNumber}>
                    <Text style={styles.webStepNumberText}>{item.step}</Text>
                  </View>
                  <Text style={styles.webStepTitle}>{item.title}</Text>
                  <Text style={styles.webStepText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Logo Section (native only — web has the hero above) */}
        {!isWeb && (
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
        )}

        {/* Form Section */}
        <Animated.View
          onLayout={(e) => {
            formY.current = e.nativeEvent.layout.y;
          }}
          style={[styles.formSection, formAnimatedStyle, isWeb && styles.formSectionWeb]}
        >
          {isWeb && (
            <Text style={styles.webFormTitle}>
              {isLogin ? 'Welcome back' : 'Create your free account'}
            </Text>
          )}
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

          {/* Inline form error (Alert.alert doesn't render on web) */}
          {formError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{formError}</Text>
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
            onPress={startAsGuest}
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

        {/* ─── Web landing: footer ─── */}
        {isWeb && (
          <View style={styles.webFooter}>
            <View style={styles.webFooterBrand}>
              <Image source={require('@/assets/logo.png')} style={styles.webFooterLogo} resizeMode="contain" />
              <Text style={styles.webFooterName}>FinNest</Text>
            </View>
            <Text style={styles.webFooterTagline}>Track every ISA. Keep every pound tax-free.</Text>
            <View style={styles.webFooterLinks}>
              <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                <Text style={styles.webFooterLink}>Terms & Conditions</Text>
              </TouchableOpacity>
              <Text style={styles.webFooterDivider}>•</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
                <Text style={styles.webFooterLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.webFooterNote}>
              FinNest is a tracking tool, not a financial adviser. Capital at risk with investment ISAs.
            </Text>
            <Text style={styles.webFooterCopyright}>© {new Date().getFullYear()} FinNest. All rights reserved.</Text>
          </View>
        )}
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

  // ─── Web landing styles ───
  webNav: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  webNavBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  webNavLogo: {
    width: 36,
    height: 36,
    tintColor: Colors.gold,
  },
  webNavTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  webNavActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  webNavLink: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  webNavLinkText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
  },
  webNavCta: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  webNavCtaText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.deepNavy,
  },
  webHero: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    marginBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  webHeroWide: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 480,
  },
  webHeroCopy: {
    alignItems: 'flex-start',
  },
  webHeroCopyWide: {
    flex: 1.1,
    paddingRight: Spacing.xl,
  },
  webEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.35)',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  webEyebrowText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.gold,
    letterSpacing: 1.5,
  },
  webHeadline: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
    marginBottom: Spacing.lg,
  },
  webHeadlineWide: {
    fontSize: 64,
    lineHeight: 72,
  },
  webHeadlineAccent: {
    color: Colors.gold,
  },
  webSubhead: {
    fontSize: Typography.sizes.lg,
    lineHeight: 30,
    color: Colors.lightGray,
    marginBottom: Spacing.xl,
    maxWidth: 560,
  },
  webHeroCtas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  webPrimaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  webPrimaryCtaText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.extrabold,
    color: Colors.deepNavy,
  },
  webSecondaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  webSecondaryCtaText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  webTrustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  webTrustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  webTrustText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },
  webMockWrap: {
    width: '100%',
    alignItems: 'center',
  },
  webMockWrapWide: {
    flex: 0.9,
  },
  webMockCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.45,
    shadowRadius: 48,
  },
  webMockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  webMockTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.lightGray,
    letterSpacing: 0.5,
  },
  webMockBadge: {
    backgroundColor: 'rgba(91, 155, 213, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(91, 155, 213, 0.5)',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  webMockBadgeText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: '#5B9BD5',
    letterSpacing: 1,
  },
  webMockAmount: {
    fontSize: 40,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
  },
  webMockAmountSub: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginBottom: Spacing.md,
  },
  webMockBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  webMockBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  webMockRows: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  webMockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  webMockDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  webMockRowLabel: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
  },
  webMockRowValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  webMockBonus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  webMockBonusText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.gold,
  },
  webStats: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  webStatsWide: {
    paddingHorizontal: Spacing.xxl,
  },
  webStatItem: {
    alignItems: 'center',
    minWidth: 130,
    flexGrow: 1,
  },
  webStatValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.gold,
  },
  webStatLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginTop: 4,
    textAlign: 'center',
  },
  webSection: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    marginBottom: Spacing.xxl,
    alignItems: 'center',
  },
  webSectionTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  webSectionSub: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  webFeatureGrid: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  webFeatureGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  webFeatureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  webFeatureCardWide: {
    flexBasis: '23%',
    flexGrow: 1,
    minWidth: 240,
  },
  webFeatureIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  webFeatureTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  webFeatureText: {
    fontSize: Typography.sizes.sm,
    lineHeight: 22,
    color: Colors.lightGray,
  },
  webStepsRow: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  webStepsRowWide: {
    flexDirection: 'row',
  },
  webStepCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'flex-start',
  },
  webStepCardWide: {
    flex: 1,
  },
  webStepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  webStepNumberText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.extrabold,
    color: Colors.gold,
  },
  webStepTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  webStepText: {
    fontSize: Typography.sizes.sm,
    lineHeight: 22,
    color: Colors.lightGray,
  },
  formSectionWeb: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  webFormTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  webFooter: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  webFooterBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  webFooterLogo: {
    width: 28,
    height: 28,
    tintColor: Colors.gold,
  },
  webFooterName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
  },
  webFooterTagline: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },
  webFooterLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  webFooterLink: {
    fontSize: Typography.sizes.sm,
    color: Colors.gold,
    fontWeight: Typography.weights.semibold,
  },
  webFooterDivider: {
    color: Colors.mediumGray,
  },
  webFooterNote: {
    fontSize: Typography.sizes.xs,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  webFooterCopyright: {
    fontSize: Typography.sizes.xs,
    color: Colors.mediumGray,
  },
});
