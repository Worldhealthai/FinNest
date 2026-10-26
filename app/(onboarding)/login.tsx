import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Type, Spacing, BorderRadius } from '@/constants/theme';
import { Button, Input, ProgressBar } from '@/components/ui';
import { useOnboarding } from '@/contexts/OnboardingContext';
import TermsModal from '@/components/TermsModal';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import { haptics } from '@/utils/haptics';

const isWeb = Platform.OS === 'web';

// Marketing copy for the web landing page
const FEATURES: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[] = [
  {
    icon: 'pie-chart-outline',
    title: 'Allowance at a glance',
    text: "See exactly how much of your £20,000 annual allowance you've used — across every ISA you hold.",
  },
  {
    icon: 'layers-outline',
    title: 'All four ISA types',
    text: 'Cash, Stocks & Shares, Lifetime and Innovative Finance ISAs, tracked together in one place.',
  },
  {
    icon: 'notifications-outline',
    title: 'Deadline reminders',
    text: 'Never lose unused allowance again. Gentle reminders before the 5 April deadline.',
  },
  {
    icon: 'book-outline',
    title: 'Learn as you go',
    text: 'Short, clear guides plus a saving-rhythm score that rewards regular contributions.',
  },
];

const STEPS = [
  { title: 'Create your free account', text: 'Sign up in under a minute — or explore first as a guest.' },
  { title: 'Log your contributions', text: 'Pick from 440+ UK providers and record payments as you make them.' },
  { title: 'Stay inside your allowance', text: 'Watch what you have left update instantly, with reminders before deadlines.' },
];

const MOCK_SEGMENTS = [
  { value: 0.31, color: '#38BDF8', label: 'Cash ISA', amount: '£6,200' },
  { value: 0.21, color: '#A78BFA', label: 'Stocks & Shares', amount: '£4,250' },
  { value: 0.15, color: '#34D399', label: 'Lifetime ISA', amount: '£3,000' },
];

export default function LoginScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [isLogin, setIsLogin] = useState(params.mode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  // Inline messages — Alert.alert is a silent no-op on web
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { login, signup, continueAsGuest } = useOnboarding();

  const { width: winWidth } = useWindowDimensions();
  const isWide = isWeb && winWidth >= 900;
  const scrollRef = useRef<ScrollView>(null);
  const formRef = useRef<any>(null);
  const formY = useRef(0);

  const selectMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setFormError(null);
    setNotice(null);
  };

  const scrollToForm = (mode: 'login' | 'signup') => {
    selectMode(mode === 'login');
    // Measure at click time: the cached onLayout y goes stale on web because
    // onLayout (ResizeObserver-driven) re-fires only when the form's own box
    // resizes, not when content above it reflows on a window resize.
    const scrollNode: any = scrollRef.current;
    const scrollEl = scrollNode?.getScrollableNode?.();
    const formNode: any = formRef.current;
    if (isWeb && formNode?.getBoundingClientRect && scrollEl?.getBoundingClientRect) {
      const y = scrollEl.scrollTop + formNode.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top;
      scrollNode.scrollTo({ y: Math.max(0, y - 24), animated: true });
    } else {
      scrollNode?.scrollTo({ y: Math.max(0, formY.current - 24), animated: true });
    }
  };

  const startAsGuest = async () => {
    try {
      await continueAsGuest();
      setTimeout(() => router.replace('/(tabs)'), 150);
    } catch (error) {
      console.error('Guest mode error:', error);
    }
  };

  const handleSubmit = async () => {
    setFormError(null);
    setNotice(null);

    if (!isLogin && !fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email || !password) {
      setFormError('Please enter your email and password.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (isLogin) {
      setIsLoading(true);
      const success = await login(email, password);
      setIsLoading(false);
      if (!success) {
        haptics.warning();
        setFormError('That email and password don\'t match an account. Please try again.');
      }
      // On success the root layout routes to the app (or to setup if unfinished)
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords don't match.");
      return;
    }
    if (!agreedToTerms) {
      setFormError('Please accept the Terms and Privacy Policy to continue.');
      return;
    }

    setIsLoading(true);
    const result = await signup(email, password, fullName.trim());
    setIsLoading(false);

    if (result === 'signed_in') {
      haptics.success();
      router.replace('/(onboarding)/personal');
    } else if (result === 'needs_confirmation') {
      setIsLogin(true);
      setPassword('');
      setConfirmPassword('');
      setNotice(`We've sent a confirmation link to ${email}. Confirm your email, then log in here.`);
    } else {
      setFormError("We couldn't create your account. An account with this email may already exist.");
    }
  };

  // ─── The auth form (shared by native and web) ───
  const form = (
    <View
      ref={formRef}
      onLayout={(e) => {
        formY.current = e.nativeEvent.layout.y;
      }}
      style={[styles.form, isWeb && (winWidth >= 600 ? styles.formWeb : styles.formWebNarrow)]}
    >
      <Text style={styles.formTitle}>{isLogin ? 'Welcome back' : 'Create your account'}</Text>
      <Text style={styles.formSubtitle}>
        {isLogin ? 'Log in to see your ISAs.' : 'Free, and it takes less than a minute.'}
      </Text>

      <View style={styles.segmented} accessibilityRole="tablist">
        {[
          { label: 'Log in', login: true },
          { label: 'Sign up', login: false },
        ].map((opt) => {
          const active = isLogin === opt.login;
          return (
            <Pressable
              key={opt.label}
              onPress={() => selectMode(opt.login)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[styles.segment, active && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {notice && (
        <View style={styles.notice}>
          <Ionicons name="mail-outline" size={18} color={Colors.positive} />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      <View style={styles.fields}>
        {!isLogin && (
          <Input
            label="Full name"
            icon="person-outline"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Alex Morgan"
            autoCapitalize="words"
            autoComplete="name"
            editable={!isLoading}
          />
        )}
        <Input
          label="Email"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          editable={!isLoading}
        />
        <Input
          label="Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          placeholder={isLogin ? 'Your password' : 'At least 6 characters'}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          editable={!isLoading}
          onSubmitEditing={isLogin ? handleSubmit : undefined}
          right={
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={10}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textTertiary} />
            </Pressable>
          }
        />
        {!isLogin && (
          <Input
            label="Confirm password"
            icon="lock-closed-outline"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat your password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        )}
      </View>

      {!isLogin && (
        <Pressable
          style={styles.terms}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreedToTerms }}
          disabled={isLoading}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Ionicons name="checkmark" size={14} color={Colors.onAccent} />}
          </View>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={styles.link} onPress={() => setShowTermsModal(true)}>
              Terms
            </Text>{' '}
            and{' '}
            <Text style={styles.link} onPress={() => setShowPrivacyModal(true)}>
              Privacy Policy
            </Text>
          </Text>
        </Pressable>
      )}

      {formError && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={16} color={Colors.negative} />
          <Text style={styles.errorText}>{formError}</Text>
        </View>
      )}

      <Button
        title={isLogin ? 'Log in' : 'Create account'}
        onPress={handleSubmit}
        loading={isLoading}
        style={styles.submit}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button title="Continue as guest" variant="secondary" icon="eye-outline" onPress={startAsGuest} disabled={isLoading} />
      <Text style={styles.guestHint}>Try FinNest without signing up. Guest data stays on this device.</Text>
    </View>
  );

  // ─── Native: focused auth screen ───
  if (!isWeb) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.nativeContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.nativeHeader}>
              {router.canGoBack() ? (
                <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Back" style={styles.backButton}>
                  <Ionicons name="chevron-back" size={22} color={Colors.text} />
                </Pressable>
              ) : (
                <View style={styles.backButton} />
              )}
              <Image source={require('@/assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
              <View style={styles.backButton} />
            </View>
            {form}
          </ScrollView>
        </KeyboardAvoidingView>
        <TermsModal visible={showTermsModal} onClose={() => setShowTermsModal(false)} />
        <PrivacyPolicyModal visible={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      </SafeAreaView>
    );
  }

  // ─── Web: landing page with the auth form ───
  return (
    <View style={styles.root}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.webContent} keyboardShouldPersistTaps="handled">
        {/* Nav */}
        <View style={[styles.section, styles.nav]}>
          <View style={styles.brand}>
            <Image source={require('@/assets/logo.png')} style={styles.brandLogo} resizeMode="contain" />
            <Text style={styles.brandName}>FinNest</Text>
          </View>
          <View style={styles.navActions}>
            <Button title="Log in" variant="ghost" size="md" fullWidth={false} onPress={() => scrollToForm('login')} />
            <Button title="Get started" size="md" fullWidth={false} onPress={() => scrollToForm('signup')} />
          </View>
        </View>

        {/* Hero */}
        <View style={[styles.section, styles.hero, isWide && styles.heroWide]}>
          <View style={[styles.heroCopy, isWide && { flex: 1.1, paddingRight: Spacing.xxl }]}>
            <View style={styles.eyebrow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={Colors.accent} />
              <Text style={styles.eyebrowText}>The UK ISA tracker</Text>
            </View>
            <Text style={[styles.headline, isWide && styles.headlineWide]}>
              Every ISA.{'\n'}
              <Text style={{ color: Colors.accent }}>One nest.</Text>
            </Text>
            <Text style={styles.subhead}>
              Track your £20,000 allowance across Cash, Stocks & Shares, Lifetime and Innovative Finance ISAs — and
              never miss the tax-year deadline.
            </Text>
            <View style={styles.heroCtas}>
              <Button
                title="Start free"
                iconRight="arrow-forward"
                fullWidth={false}
                onPress={() => scrollToForm('signup')}
                style={{ paddingHorizontal: 28 }}
              />
              <Button
                title="Try the demo"
                variant="secondary"
                fullWidth={false}
                onPress={startAsGuest}
                disabled={isLoading}
                style={{ paddingHorizontal: 28 }}
              />
            </View>
            <View style={styles.trustRow}>
              {['No bank login needed', '440+ UK providers', 'Free'].map((t) => (
                <View key={t} style={styles.trustItem}>
                  <Ionicons name="checkmark" size={16} color={Colors.positive} />
                  <Text style={styles.trustText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Product preview mirroring the real Home screen */}
          <View style={[styles.mockWrap, isWide && { flex: 0.9 }]}>
            <View style={styles.mock}>
              <Text style={Type.overline}>Allowance remaining</Text>
              <Text style={styles.mockValue}>£6,550</Text>
              <Text style={Type.callout}>of your £20,000 allowance</Text>
              <ProgressBar height={10} style={{ marginTop: 20 }} segments={MOCK_SEGMENTS} />
              <View style={styles.mockMeta}>
                <Text style={Type.caption}>
                  <Text style={{ color: Colors.text, fontWeight: '600' }}>£13,450</Text> used · 67%
                </Text>
                <Text style={Type.caption}>164 days left</Text>
              </View>
              <View style={styles.mockRows}>
                {MOCK_SEGMENTS.map((s) => (
                  <View key={s.label} style={styles.mockRow}>
                    <View style={[styles.mockDot, { backgroundColor: s.color }]} />
                    <Text style={styles.mockRowLabel}>{s.label}</Text>
                    <Text style={styles.mockRowValue}>{s.amount}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.mockBonus}>
                <Ionicons name="gift-outline" size={16} color={Colors.positive} />
                <Text style={styles.mockBonusText}>+£750 Lifetime ISA bonus earned</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={[styles.section, styles.block]}>
          <Text style={styles.blockTitle}>Built for UK savers</Text>
          <Text style={styles.blockSub}>Everything you need to make the most of your tax-free allowance.</Text>
          <View style={[styles.grid, isWide && styles.gridWide]}>
            {FEATURES.map((f) => (
              <View key={f.title} style={[styles.featureCard, isWide && styles.featureCardWide]}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon} size={20} color={Colors.accent} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How it works */}
        <View style={[styles.section, styles.block]}>
          <Text style={styles.blockTitle}>Up and running in minutes</Text>
          <View style={[styles.grid, isWide && styles.stepsWide]}>
            {STEPS.map((s, i) => (
              <View key={s.title} style={[styles.stepCard, isWide && { flex: 1 }]}>
                <Text style={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={styles.featureTitle}>{s.title}</Text>
                <Text style={styles.featureText}>{s.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Auth */}
        <View style={[styles.section, styles.block]}>{form}</View>

        {/* Footer */}
        <View style={[styles.section, styles.footer]}>
          <View style={styles.brand}>
            <Image source={require('@/assets/logo.png')} style={styles.footerLogo} resizeMode="contain" />
            <Text style={styles.footerName}>FinNest</Text>
          </View>
          <View style={styles.footerLinks}>
            <Pressable onPress={() => setShowTermsModal(true)}>
              <Text style={styles.footerLink}>Terms</Text>
            </Pressable>
            <Pressable onPress={() => setShowPrivacyModal(true)}>
              <Text style={styles.footerLink}>Privacy</Text>
            </Pressable>
          </View>
          <Text style={styles.footerNote}>
            FinNest is a tracking tool, not a financial adviser. With investment ISAs your capital is at risk.
          </Text>
          <Text style={styles.footerNote}>© {new Date().getFullYear()} FinNest</Text>
        </View>
      </ScrollView>

      <TermsModal visible={showTermsModal} onClose={() => setShowTermsModal(false)} />
      <PrivacyPolicyModal visible={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ─── Native ───
  nativeContent: {
    paddingHorizontal: 24,
    paddingBottom: Spacing.xl,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  nativeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    marginBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  headerLogo: {
    width: 32,
    height: 32,
    tintColor: Colors.accent,
  },

  // ─── Form ───
  form: {
    width: '100%',
  },
  formWebNarrow: {
    maxWidth: 460,
    alignSelf: 'center',
  },
  formWeb: {
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
  },
  formTitle: {
    ...Type.title1,
  },
  formSubtitle: {
    ...Type.body,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceRaised,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginTop: Spacing.lg,
  },
  segment: {
    flex: 1,
    height: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  segmentTextActive: {
    color: Colors.text,
  },
  notice: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginTop: Spacing.md,
    padding: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.positiveMuted,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  noticeText: {
    ...Type.callout,
    color: Colors.text,
    flex: 1,
  },
  fields: {
    gap: 16,
    marginTop: Spacing.lg,
  },
  terms: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  termsText: {
    ...Type.callout,
    flex: 1,
  },
  link: {
    color: Colors.accent,
    fontWeight: '600',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.md,
  },
  errorText: {
    ...Type.caption,
    color: Colors.negative,
    flex: 1,
  },
  submit: {
    marginTop: Spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderStrong,
  },
  dividerText: {
    ...Type.caption,
    color: Colors.textTertiary,
    marginHorizontal: 12,
  },
  guestHint: {
    ...Type.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 10,
  },

  // ─── Web landing ───
  webContent: {
    paddingHorizontal: 24,
  },
  section: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 30,
    height: 30,
    tintColor: Colors.accent,
  },
  brandName: {
    ...Type.headline,
    fontSize: 19,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hero: {
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xxl,
  },
  heroWide: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 560,
  },
  heroCopy: {
    alignItems: 'flex-start',
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    marginBottom: Spacing.lg,
  },
  eyebrowText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
  },
  headline: {
    ...Type.display,
    fontSize: 48,
    lineHeight: 54,
  },
  headlineWide: {
    fontSize: 68,
    lineHeight: 74,
    letterSpacing: -1.6,
  },
  subhead: {
    ...Type.body,
    fontSize: 19,
    lineHeight: 30,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    maxWidth: 540,
  },
  heroCtas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: Spacing.xl,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: Spacing.lg,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    ...Type.callout,
  },
  mockWrap: {
    width: '100%',
    alignItems: 'center',
  },
  mock: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.45,
    shadowRadius: 60,
  },
  mockValue: {
    ...Type.display,
    ...Type.number,
    marginTop: 8,
  },
  mockMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  mockRows: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderStrong,
    gap: 12,
  },
  mockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  mockRowLabel: {
    ...Type.callout,
    flex: 1,
  },
  mockRowValue: {
    ...Type.bodyStrong,
    ...Type.number,
  },
  mockBonus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    padding: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.positiveMuted,
  },
  mockBonusText: {
    ...Type.caption,
    color: Colors.positive,
    fontWeight: '600',
  },
  block: {
    paddingVertical: Spacing.xxl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  blockTitle: {
    ...Type.title1,
    textAlign: 'center',
  },
  blockSub: {
    ...Type.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  grid: {
    gap: 16,
    marginTop: Spacing.xl,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stepsWide: {
    flexDirection: 'row',
  },
  featureCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
  },
  featureCardWide: {
    flexBasis: '22%',
    flexGrow: 1,
    minWidth: 220,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    ...Type.headline,
    marginBottom: 6,
  },
  featureText: {
    ...Type.callout,
    lineHeight: 21,
  },
  stepCard: {
    padding: 24,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepNumber: {
    ...Type.number,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1,
    marginBottom: 12,
  },
  footer: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: Spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  footerLogo: {
    width: 22,
    height: 22,
    tintColor: Colors.accent,
  },
  footerName: {
    ...Type.bodyStrong,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  footerLink: {
    ...Type.callout,
    color: Colors.text,
  },
  footerNote: {
    ...Type.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
