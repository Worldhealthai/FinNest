import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import { Button, Chip, IconTile, Input, ListItem, ListGroup } from '@/components/ui';
import { Colors, Spacing, Type, BorderRadius } from '@/constants/theme';
import {
  ISA_TYPES,
  ISA_TYPE_ORDER,
  ISA_LABELS,
  ISA_ICONS,
  isaColor,
  ISA_ANNUAL_ALLOWANCE,
  LIFETIME_ISA_MAX,
  LIFETIME_ISA_BONUS_RATE,
  formatCurrency,
} from '@/constants/isaData';
import { searchProviders, getPopularProviders, ISAProvider } from '@/constants/isaProviders';
import {
  getAvailableTaxYears,
  getTaxYearLabel,
  getTaxYearFromDate,
  getCurrentTaxYear,
  isDateInTaxYear,
  formatDateKey,
  type TaxYear,
} from '@/utils/taxYear';
import { getISASetting, setISASetting } from '@/utils/isaSettings';
import { haptics } from '@/utils/haptics';

interface AddISAContributionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd?: (contribution: ISAContribution) => void;
  preSelectedType?: string; // Optional: pre-select ISA type when modal opens
  currentISAs?: {
    [key: string]: {
      contributed: number;
      balance: number;
      provider: string;
    };
  };
}

export interface ISAContribution {
  id: string;
  provider: string;
  isaType: string;
  amount: number;
  date: string;
  notes?: string;
  withdrawn?: boolean;
  withdrawnDate?: string;
}

// ─── Shared amount helpers (also used by EditISAContributionModal) ───

/** Per-contribution cap: £4,000 for a Lifetime ISA, otherwise the £20,000 allowance. */
export const contributionCap = (isaType: string) =>
  isaType === ISA_TYPES.LIFETIME ? LIFETIME_ISA_MAX : ISA_ANNUAL_ALLOWANCE;

/** Strips the £ prefix, thousands separators and spaces so pasted values still parse. */
export const cleanAmountInput = (text: string) => text.replace(/[£,\s]/g, '');

/** £1,250 or £1,250.50 — keeps pence only when the amount has them. */
export function formatAmount(value: number): string {
  const hasPence = Math.round(value * 100) % 100 !== 0;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: hasPence ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

const toAmountString = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(2));

/** Returns a user-facing message when the amount can't be saved, otherwise null. */
export function getContributionAmountError(raw: string, isaType: string): string | null {
  const value = raw.trim();
  if (!value) return 'Enter an amount';
  if (value.startsWith('-')) return 'Amount must be more than £0';
  if (!/^(\d+\.?\d*|\.\d+)$/.test(value)) return 'Enter a number, like 250 or 250.50';
  if (/\.\d{3,}$/.test(value)) return 'Use no more than 2 decimal places';
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Amount must be more than £0';
  if (isaType === ISA_TYPES.LIFETIME && amount > LIFETIME_ISA_MAX) {
    return `Lifetime ISA contributions are capped at ${formatCurrency(LIFETIME_ISA_MAX)} per tax year`;
  }
  if (amount > ISA_ANNUAL_ALLOWANCE) {
    return `That's over the ${formatCurrency(ISA_ANNUAL_ALLOWANCE)} annual ISA allowance`;
  }
  return null;
}

interface ContributionAmountFieldsProps {
  amount: string;
  onChangeAmount: (value: string) => void;
  isaType: string;
  /** Message to show under the amount (already gated on whether to show it). */
  error: string | null;
  /** Replaces the default "Up to £X per tax year" hint. */
  hint?: string;
  /** Allowance left for this ISA type in the selected tax year, when known. */
  remaining?: number | null;
  taxYears: TaxYear[];
  selectedTaxYear: TaxYear;
  onSelectTaxYear: (year: TaxYear) => void;
  autoFocus?: boolean;
}

/** Large centred amount, quick-amount chips and tax-year chips. */
export function ContributionAmountFields({
  amount,
  onChangeAmount,
  isaType,
  error,
  hint,
  remaining,
  taxYears,
  selectedTaxYear,
  onSelectTaxYear,
  autoFocus,
}: ContributionAmountFieldsProps) {
  const [focused, setFocused] = useState(false);
  const cap = contributionCap(isaType);
  const valid = !getContributionAmountError(amount, isaType);
  const value = valid ? Number(amount) : 0;
  const quickAmounts = [100, 500, 1000].filter((v) => v <= cap);
  const showRemaining = remaining != null && remaining > 0;
  const overRemaining = valid && remaining != null && value > remaining;
  const bonus = isaType === ISA_TYPES.LIFETIME && valid ? value * LIFETIME_ISA_BONUS_RATE : 0;

  return (
    <View>
      <View style={styles.amountBlock}>
        <TextInput
          value={amount ? `£${amount}` : ''}
          onChangeText={(text) => onChangeAmount(cleanAmountInput(text))}
          placeholder="£0"
          placeholderTextColor={Colors.textTertiary}
          selectionColor={Colors.accent}
          keyboardType="decimal-pad"
          inputMode="decimal"
          returnKeyType="done"
          maxLength={12}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.amountInput}
          accessibilityLabel="Contribution amount in pounds"
        />
        <View
          style={[styles.amountRule, focused && styles.amountRuleFocused, !!error && styles.amountRuleError]}
        />
        {error ? (
          <View style={styles.messageRow} accessibilityLiveRegion="polite">
            <Ionicons name="alert-circle" size={14} color={Colors.negative} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : overRemaining ? (
          <Text style={[styles.amountHint, styles.cautionText]}>
            That's more than the {formatAmount(remaining!)} left in your allowance this tax year
          </Text>
        ) : (
          <Text style={styles.amountHint}>{hint ?? `Up to ${formatCurrency(cap)} per tax year`}</Text>
        )}
        {bonus > 0 ? (
          <View style={styles.bonusRow}>
            <Ionicons name="gift-outline" size={14} color={Colors.positive} />
            <Text style={styles.bonusText}>+{formatAmount(bonus)} government bonus (25%)</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.quickRow}>
        {quickAmounts.map((v) => (
          <Chip
            key={v}
            label={formatCurrency(v)}
            selected={valid && value === v}
            onPress={() => onChangeAmount(String(v))}
          />
        ))}
        {showRemaining ? (
          <Chip
            label={`Remaining ${formatAmount(remaining!)}`}
            selected={valid && value === remaining}
            onPress={() => onChangeAmount(toAmountString(remaining!))}
          />
        ) : null}
      </View>

      <Text style={styles.sectionLabel}>Tax year</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        {taxYears.map((year) => (
          <Chip
            key={year.startYear}
            label={getTaxYearLabel(year)}
            selected={year.startYear === selectedTaxYear.startYear}
            onPress={() => onSelectTaxYear(year)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Add flow ───

const TOTAL_STEPS = 3;
const STEP_LABELS = ['Provider', 'ISA type', 'Amount'];

const TYPE_SUMMARIES: Record<string, string> = {
  [ISA_TYPES.CASH]: 'Savings with tax-free interest',
  [ISA_TYPES.STOCKS_SHARES]: 'Investments with tax-free growth',
  [ISA_TYPES.LIFETIME]: `First home or retirement · up to ${formatCurrency(LIFETIME_ISA_MAX)} a year`,
  [ISA_TYPES.INNOVATIVE_FINANCE]: 'Peer-to-peer lending',
};

const CATEGORY_ICONS: Record<ISAProvider['category'], keyof typeof Ionicons.glyphMap> = {
  bank: 'business-outline',
  'investment-platform': 'trending-up-outline',
  fintech: 'phone-portrait-outline',
  'building-society': 'home-outline',
};

const SHORT_TYPE_NAMES: Record<string, string> = {
  'Cash ISA': 'Cash',
  'Stocks & Shares ISA': 'Stocks & Shares',
  'Lifetime ISA': 'Lifetime',
  'Innovative Finance ISA': 'Innovative Finance',
};

const providerSubtitle = (p: ISAProvider) =>
  p.types
    .filter((t) => SHORT_TYPE_NAMES[t])
    .map((t) => SHORT_TYPE_NAMES[t])
    .join(' · ');

interface Availability {
  available: boolean;
  reason?: string;
}

function getTypeAvailability(
  type: string,
  providerName: string,
  providerData: ISAProvider | null,
  currentISAs: AddISAContributionModalProps['currentISAs']
): Availability {
  if (providerData && !providerData.types.includes(ISA_LABELS[type])) {
    return { available: false, reason: `Not offered by ${providerData.name}` };
  }
  // Only one Lifetime ISA can be paid into per tax year
  if (type === ISA_TYPES.LIFETIME && currentISAs) {
    const existing = currentISAs.lifetime?.provider;
    if (existing && existing !== 'None' && providerName && existing !== providerName) {
      return { available: false, reason: `You already pay into a Lifetime ISA with ${existing} this tax year` };
    }
  }
  return { available: true };
}

function StepIndicator({ step }: { step: number }) {
  return (
    <View style={styles.indicator}>
      <View style={styles.segments}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View key={i} style={[styles.segment, i < step && styles.segmentActive]} />
        ))}
      </View>
      <Text style={styles.indicatorText}>
        Step {step} of {TOTAL_STEPS} · {STEP_LABELS[step - 1]}
      </Text>
    </View>
  );
}

interface OptionRowProps {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}

/** Single-choice row with a selected state (accent tint + check). */
function OptionRow({ title, subtitle, leading, selected, disabled, onPress }: OptionRowProps) {
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && !disabled && !selected && styles.optionPressed,
      ]}
    >
      {leading ? <View style={disabled && styles.dimmed}>{leading}</View> : null}
      <View style={[styles.optionBody, !!leading && styles.optionBodyIndented]}>
        <Text style={[styles.optionTitle, disabled && styles.optionTitleDisabled]}>{title}</Text>
        {subtitle ? <Text style={styles.optionSubtitle}>{subtitle}</Text> : null}
      </View>
      {selected ? (
        <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />
      ) : disabled ? (
        <Ionicons name="remove-circle-outline" size={20} color={Colors.textTertiary} />
      ) : (
        <View style={styles.radio} />
      )}
    </Pressable>
  );
}

type FlexStatus = 'idle' | 'loading' | 'known' | 'missing';

export default function AddISAContributionModal({
  visible,
  onClose,
  onAdd,
  preSelectedType,
  currentISAs,
}: AddISAContributionModalProps) {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState('');
  const [selectedProviderData, setSelectedProviderData] = useState<ISAProvider | null>(null);
  const [selectedType, setSelectedType] = useState<string>(ISA_TYPES.CASH);
  const [amount, setAmount] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const [notes, setNotes] = useState('');
  const [contributionDate, setContributionDate] = useState(new Date());
  const [providerSearch, setProviderSearch] = useState('');
  const [availableTaxYears] = useState<TaxYear[]>(() => getAvailableTaxYears(5, 1)); // 5 previous + 1 future year
  const [selectedTaxYear, setSelectedTaxYear] = useState<TaxYear>(() => getTaxYearFromDate(new Date()));
  const [flexStatus, setFlexStatus] = useState<FlexStatus>('idle');
  const [isFlexible, setIsFlexible] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form when modal opens (not on close, so the sheet doesn't flash
  // back to step 1 while it slides away)
  useEffect(() => {
    if (visible) {
      setStep(1);
      setProvider('');
      setSelectedProviderData(null);
      setSelectedType(preSelectedType || ISA_TYPES.CASH);
      setAmount('');
      setAmountTouched(false);
      setNotes('');
      setContributionDate(new Date());
      setSelectedTaxYear(getTaxYearFromDate(new Date()));
      setProviderSearch('');
      setFlexStatus('idle');
      setIsFlexible(null);
      setSubmitting(false);
      setSubmitError(null);
    }
  }, [visible, preSelectedType]);

  // On the amount step, look up whether this provider+type already has a
  // flexibility setting — the question is only asked the first time.
  useEffect(() => {
    if (!visible || step !== 3) return;
    let cancelled = false;
    setFlexStatus('loading');
    getISASetting(provider.trim(), selectedType)
      .then((setting) => {
        if (!cancelled) setFlexStatus(setting ? 'known' : 'missing');
      })
      .catch(() => {
        if (!cancelled) setFlexStatus('missing');
      });
    return () => {
      cancelled = true;
    };
  }, [visible, step, provider, selectedType]);

  // ─── Provider search ───
  const query = providerSearch.trim();
  const searchResults = useMemo(() => (query ? searchProviders(query).slice(0, 8) : []), [query]);
  const popularProviders = useMemo(() => getPopularProviders(), []);
  const hasExactMatch = searchResults.some((p) => p.name.toLowerCase() === query.toLowerCase());
  const listedProviders = query ? searchResults : popularProviders;
  const customIsSelected = !!provider && !selectedProviderData;

  const handleProviderSearch = (text: string) => {
    setProviderSearch(text);
    // Typing something different clears an earlier choice
    if (text.trim() !== provider) {
      setProvider('');
      setSelectedProviderData(null);
    }
  };

  const chooseProvider = (name: string, data: ISAProvider | null) => {
    setProvider(name);
    setSelectedProviderData(data);
    setProviderSearch(name);
    // Keep the chosen type if this provider can take it, otherwise pick the first one it can
    if (!getTypeAvailability(selectedType, name, data, currentISAs).available) {
      const firstAvailable = ISA_TYPE_ORDER.find((t) => getTypeAvailability(t, name, data, currentISAs).available);
      if (firstAvailable) setSelectedType(firstAvailable);
    }
    setStep(2);
  };

  const submitSearch = () => {
    if (!query) return;
    const exact = searchResults.find((p) => p.name.toLowerCase() === query.toLowerCase());
    chooseProvider(exact ? exact.name : query, exact ?? null);
  };

  // ─── Amount + allowance ───
  const amountError = getContributionAmountError(amount, selectedType);
  const visibleAmountError = amountTouched ? amountError : null;

  const remaining = useMemo(() => {
    // currentISAs describes the current tax year only
    if (!currentISAs || selectedTaxYear.startYear !== getCurrentTaxYear().startYear) return null;
    const used = Object.values(currentISAs).reduce((sum, isa) => sum + (isa?.contributed || 0), 0);
    let left = ISA_ANNUAL_ALLOWANCE - used;
    if (selectedType === ISA_TYPES.LIFETIME) {
      left = Math.min(left, LIFETIME_ISA_MAX - (currentISAs.lifetime?.contributed || 0));
    }
    return Math.max(0, Math.round(left * 100) / 100);
  }, [currentISAs, selectedTaxYear.startYear, selectedType]);

  const selectTaxYear = (year: TaxYear) => {
    setSelectedTaxYear(year);
    // Keep the contribution date inside the selected tax year: today if it
    // falls in that year, otherwise the year's first day.
    const today = new Date();
    setContributionDate(isDateInTaxYear(today, year) ? today : year.startDate);
  };

  const needsFlexibilityAnswer = selectedType !== ISA_TYPES.LIFETIME && flexStatus === 'missing';

  // ─── Navigation ───
  const typeAvailability = getTypeAvailability(selectedType, provider.trim(), selectedProviderData, currentISAs);
  const canProceed =
    step === 1
      ? !!provider.trim()
      : step === 2
        ? typeAvailability.available
        : !amountError && flexStatus !== 'loading' && flexStatus !== 'idle' && (!needsFlexibilityAnswer || isFlexible !== null);

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!canProceed || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    const providerName = provider.trim();

    try {
      const setting = await getISASetting(providerName, selectedType);
      if (!setting) {
        if (selectedType === ISA_TYPES.LIFETIME) {
          // Lifetime ISAs are never flexible
          await setISASetting(providerName, selectedType, false);
        } else if (isFlexible === null) {
          // Setting disappeared since the step loaded — ask before saving
          setFlexStatus('missing');
          return;
        } else {
          await setISASetting(providerName, selectedType, isFlexible);
        }
      }

      const contribution: ISAContribution = {
        id: Date.now().toString(),
        provider: providerName,
        isaType: selectedType,
        amount: Number(amount),
        date: formatDateKey(contributionDate),
        notes: notes.trim() || undefined,
      };

      // The parent saves it, plays the success haptic and shows the new entry
      onAdd?.(contribution);
      onClose();
    } catch (error) {
      console.error('Error saving ISA contribution:', error);
      setSubmitError("Couldn't save this contribution. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimary = () => {
    if (step < TOTAL_STEPS) {
      if (canProceed) setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  // ─── Steps ───
  const renderProviderStep = () => (
    <View>
      <Text style={styles.question}>Who is your ISA with?</Text>
      <Input
        icon="search"
        placeholder="Search providers"
        value={providerSearch}
        onChangeText={handleProviderSearch}
        onSubmitEditing={submitSearch}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        accessibilityLabel="Search providers"
        containerStyle={styles.search}
        right={
          providerSearch.length > 0 ? (
            <Pressable
              onPress={() => handleProviderSearch('')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </Pressable>
          ) : null
        }
      />

      <Text style={styles.sectionLabel}>{query ? 'Results' : 'Popular providers'}</Text>
      {query && searchResults.length === 0 ? (
        <Text style={styles.emptyText}>No providers in our list match "{query}".</Text>
      ) : null}
      <ListGroup>
        {listedProviders.map((p) => {
          const isSelected = selectedProviderData?.name === p.name;
          return (
            <ListItem
              key={p.name}
              title={p.name}
              subtitle={providerSubtitle(p)}
              leading={<IconTile name={CATEGORY_ICONS[p.category] ?? 'business-outline'} color={Colors.textSecondary} size={36} />}
              onPress={() => chooseProvider(p.name, p)}
              right={isSelected ? <Ionicons name="checkmark-circle" size={22} color={Colors.accent} /> : undefined}
            />
          );
        })}
        {query && !hasExactMatch ? (
          <ListItem
            title={`Use "${query}"`}
            subtitle="Add a provider that isn't in our list"
            leading={<IconTile name="add" color={Colors.textSecondary} size={36} />}
            onPress={() => chooseProvider(query, null)}
            right={customIsSelected ? <Ionicons name="checkmark-circle" size={22} color={Colors.accent} /> : undefined}
          />
        ) : null}
      </ListGroup>
    </View>
  );

  const renderTypeStep = () => (
    <View>
      <Text style={styles.question}>Which type of ISA?</Text>
      <Text style={styles.questionCaption}>With {provider}</Text>
      <View style={styles.options}>
        {ISA_TYPE_ORDER.map((type) => {
          const { available, reason } = getTypeAvailability(type, provider.trim(), selectedProviderData, currentISAs);
          return (
            <OptionRow
              key={type}
              title={ISA_LABELS[type]}
              subtitle={available ? TYPE_SUMMARIES[type] : reason}
              leading={<IconTile name={ISA_ICONS[type]} color={isaColor(type)} size={36} />}
              selected={available && selectedType === type}
              disabled={!available}
              onPress={() => setSelectedType(type)}
            />
          );
        })}
      </View>
    </View>
  );

  const renderAmountStep = () => (
    <View>
      <View style={styles.context}>
        <IconTile name={ISA_ICONS[selectedType]} color={isaColor(selectedType)} size={28} />
        <Text style={styles.contextText} numberOfLines={1}>
          {provider} · {ISA_LABELS[selectedType]}
        </Text>
      </View>

      <ContributionAmountFields
        amount={amount}
        onChangeAmount={(value) => {
          setAmount(value);
          setAmountTouched(true);
        }}
        isaType={selectedType}
        error={visibleAmountError}
        remaining={remaining}
        taxYears={availableTaxYears}
        selectedTaxYear={selectedTaxYear}
        onSelectTaxYear={selectTaxYear}
        autoFocus
      />

      {needsFlexibilityAnswer ? (
        <View style={styles.flexSection}>
          <Text style={styles.flexTitle}>Is this ISA flexible?</Text>
          <Text style={styles.flexBody}>
            A flexible ISA lets you take money out and put it back in the same tax year without using up more of
            your allowance.
          </Text>
          <View style={styles.options}>
            <OptionRow
              title="Flexible"
              subtitle="Withdrawals can be replaced this tax year"
              selected={isFlexible === true}
              onPress={() => setIsFlexible(true)}
            />
            <OptionRow
              title="Not flexible"
              subtitle="Withdrawals still count towards your allowance"
              selected={isFlexible === false}
              onPress={() => setIsFlexible(false)}
            />
          </View>
          <Text style={styles.flexHint}>Not sure? Choose not flexible — it's the safer assumption.</Text>
        </View>
      ) : null}

      <Input
        label="Notes (optional)"
        placeholder="e.g. Monthly transfer"
        value={notes}
        onChangeText={setNotes}
        maxLength={200}
        returnKeyType="done"
        containerStyle={styles.notes}
      />
    </View>
  );

  const footerNote =
    submitError ??
    (step === 3 && !amountError && needsFlexibilityAnswer && isFlexible === null
      ? 'Choose whether this ISA is flexible to continue'
      : null);

  const footer = (
    <View>
      {footerNote ? (
        <Text style={[styles.footerNote, submitError ? styles.footerNoteError : null]}>{footerNote}</Text>
      ) : null}
      <View style={styles.footerRow}>
        {step > 1 ? (
          <Button
            title="Back"
            variant="secondary"
            icon="chevron-back"
            fullWidth={false}
            onPress={handleBack}
            style={styles.backButton}
          />
        ) : null}
        <Button
          title={step < TOTAL_STEPS ? 'Continue' : 'Add contribution'}
          onPress={handlePrimary}
          disabled={!canProceed}
          loading={submitting}
          style={styles.primaryButton}
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} onClose={onClose} title="Add contribution" footer={footer}>
      <StepIndicator step={step} />
      {step === 1 && renderProviderStep()}
      {step === 2 && renderTypeStep()}
      {step === 3 && renderAmountStep()}
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Step indicator
  indicator: {
    marginBottom: Spacing.lg,
  },
  segments: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.surfaceRaised,
  },
  segmentActive: {
    backgroundColor: Colors.accent,
  },
  indicatorText: {
    ...Type.caption,
    marginTop: 10,
  },

  // Shared headings
  question: {
    ...Type.headline,
    marginBottom: Spacing.md,
  },
  questionCaption: {
    ...Type.callout,
    marginTop: -12,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Type.overline,
    marginTop: Spacing.lg,
    marginBottom: 10,
  },

  // Provider step
  search: {
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Type.callout,
    marginBottom: 12,
  },

  // Option rows (ISA type, flexibility)
  options: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionSelected: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accentBorder,
  },
  optionPressed: {
    backgroundColor: Colors.surfaceRaised,
  },
  dimmed: {
    opacity: 0.4,
  },
  optionBody: {
    flex: 1,
    marginRight: 12,
  },
  optionBodyIndented: {
    marginLeft: 14,
  },
  optionTitle: {
    ...Type.bodyStrong,
  },
  optionTitleDisabled: {
    color: Colors.textTertiary,
  },
  optionSubtitle: {
    ...Type.caption,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
  },

  // Amount step
  context: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  contextText: {
    ...Type.callout,
    color: Colors.text,
    flexShrink: 1,
  },
  amountBlock: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  amountInput: {
    ...Type.display,
    ...Type.number,
    fontSize: 44,
    lineHeight: 52,
    alignSelf: 'stretch',
    textAlign: 'center',
    paddingVertical: 4,
    color: Colors.text,
    // Remove the browser focus ring on web; the rule below shows focus instead
    outlineStyle: 'none',
  } as any,
  amountRule: {
    width: 160,
    height: 1,
    marginTop: 4,
    backgroundColor: Colors.borderStrong,
  },
  amountRuleFocused: {
    backgroundColor: Colors.accentBorder,
  },
  amountRuleError: {
    backgroundColor: Colors.negative,
  },
  amountHint: {
    ...Type.caption,
    marginTop: 10,
    textAlign: 'center',
  },
  cautionText: {
    color: Colors.caution,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  errorText: {
    ...Type.caption,
    color: Colors.negative,
    flexShrink: 1,
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  bonusText: {
    ...Type.caption,
    ...Type.number,
    color: Colors.positive,
    fontWeight: '600',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.md,
  },
  chipsScroll: {
    marginHorizontal: -20,
  },
  chips: {
    gap: 8,
    paddingHorizontal: 20,
  },

  // Flexibility question
  flexSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderStrong,
  },
  flexTitle: {
    ...Type.headline,
  },
  flexBody: {
    ...Type.callout,
    marginTop: 4,
    marginBottom: 12,
  },
  flexHint: {
    ...Type.caption,
    color: Colors.textTertiary,
    marginTop: 8,
  },

  notes: {
    marginTop: Spacing.lg,
  },

  // Footer
  footerNote: {
    ...Type.caption,
    textAlign: 'center',
    marginBottom: 10,
  },
  footerNoteError: {
    color: Colors.negative,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    paddingHorizontal: 18,
  },
  primaryButton: {
    flex: 1,
  },
});
