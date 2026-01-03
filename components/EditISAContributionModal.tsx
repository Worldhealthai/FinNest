import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import GlassCard from './GlassCard';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import {
  ISA_TYPES,
  ISA_INFO,
  ISA_ANNUAL_ALLOWANCE,
  LIFETIME_ISA_MAX,
  formatCurrency,
} from '@/constants/isaData';
import { getAvailableTaxYears, getTaxYearLabel, getTaxYearFromDate, type TaxYear } from '@/utils/taxYear';
import { ISAContribution } from './AddISAContributionModal';

const { width } = Dimensions.get('window');

interface EditISAContributionModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate?: (contribution: ISAContribution) => void;
  contribution: ISAContribution | null;
}

export default function EditISAContributionModal({
  visible,
  onClose,
  onUpdate,
  contribution,
}: EditISAContributionModalProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [contributionDate, setContributionDate] = useState(new Date());
  const [updatedContribution, setUpdatedContribution] = useState<ISAContribution | null>(null);
  const [availableTaxYears] = useState<TaxYear[]>(getAvailableTaxYears(5, 1)); // 5 previous + 1 future year
  const [selectedTaxYear, setSelectedTaxYear] = useState<TaxYear>(getTaxYearFromDate(new Date()));

  const TOTAL_STEPS = 3;

  // Reset form when modal opens or contribution changes
  useEffect(() => {
    if (visible && contribution) {
      console.log('Edit modal opened, setting form values from contribution:', contribution);
      setStep(1);
      setAmount(contribution.amount.toString());
      setNotes(contribution.notes || '');
      const date = new Date(contribution.date);
      setContributionDate(date);
      setSelectedTaxYear(getTaxYearFromDate(date));
      setUpdatedContribution(null);
    }
  }, [visible, contribution]);

  const resetForm = () => {
    setStep(1);
    setAmount('');
    setNotes('');
    setContributionDate(new Date());
    setSelectedTaxYear(getTaxYearFromDate(new Date()));
    setUpdatedContribution(null);
  };

  const handleNext = () => {
    if (step === 1) {
      const contributionAmount = parseFloat(amount);
      if (!contributionAmount || contributionAmount <= 0) {
        Alert.alert('Amount Required', 'Please enter a valid contribution amount');
        return;
      }
      if (contributionAmount > ISA_ANNUAL_ALLOWANCE) {
        Alert.alert(
          'Amount Too High',
          `The amount exceeds the annual ISA allowance of ${formatCurrency(ISA_ANNUAL_ALLOWANCE)}`
        );
        return;
      }
    }

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!contribution) return;

    console.log('=== handleSubmit called ===');

    const contributionAmount = parseFloat(amount);

    const updated: ISAContribution = {
      ...contribution,
      amount: contributionAmount,
      date: contributionDate.toISOString(),
      notes: notes.trim() || undefined,
    };

    console.log('Updated contribution:', updated);

    // Store contribution first
    setUpdatedContribution(updated);
    console.log('Set updatedContribution');

    // Then call parent's onUpdate
    if (onUpdate) {
      console.log('Calling parent onUpdate');
      onUpdate(updated);
    }

    // Move to confirmation screen after a short delay to ensure state is set
    console.log('Setting timeout to move to step 3');
    setTimeout(() => {
      console.log('Moving to step 3');
      setStep(3);
    }, 100);
  };

  const handleDone = () => {
    resetForm();
    onClose();
  };

  const getISAIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      [ISA_TYPES.CASH]: 'cash',
      [ISA_TYPES.STOCKS_SHARES]: 'trending-up',
      [ISA_TYPES.LIFETIME]: 'home',
      [ISA_TYPES.INNOVATIVE_FINANCE]: 'flash',
    };
    return iconMap[type] || 'wallet';
  };

  if (!contribution) return null;

  const isaInfo = ISA_INFO[contribution.isaType];
  const maxContribution =
    contribution.isaType === ISA_TYPES.LIFETIME ? LIFETIME_ISA_MAX : ISA_ANNUAL_ALLOWANCE;

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={styles.stepContainer}>
          <View style={[styles.stepDot, step >= s && styles.stepDotActive]}>
            {step > s ? (
              <Ionicons name="checkmark" size={14} color={Colors.deepNavy} />
            ) : (
              <Text style={[styles.stepNumber, step >= s && styles.stepNumberActive]}>{s}</Text>
            )}
          </View>
          {s < TOTAL_STEPS && (
            <View style={[styles.stepLine, step > s && styles.stepLineActive]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="calculator" size={32} color={Colors.gold} />
        <Text style={styles.stepTitle}>Edit Amount</Text>
        <Text style={styles.stepSubtitle}>
          Update your contribution amount
        </Text>
      </View>

      {/* Provider & Type Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Provider</Text>
          <Text style={styles.summaryValue}>{contribution.provider}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>ISA Type</Text>
          <Text style={styles.summaryValue}>{isaInfo.shortName}</Text>
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>CONTRIBUTION AMOUNT</Text>
        <View style={styles.amountInputBox}>
          <Text style={styles.currencySymbol}>£</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            placeholderTextColor={Colors.mediumGray}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoFocus
            textAlign="left"
          />
        </View>
        <View style={styles.amountHint}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
          <Text style={styles.amountHintText}>
            Max: {formatCurrency(maxContribution)} per tax year
          </Text>
        </View>
      </View>

      {/* LISA Bonus */}
      {contribution.isaType === ISA_TYPES.LIFETIME && parseFloat(amount) > 0 && (
        <View style={styles.bonusCard}>
          <LinearGradient
            colors={['rgba(40, 167, 69, 0.25)', 'rgba(40, 167, 69, 0.15)']}
            style={styles.bonusGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="gift" size={28} color={Colors.success} />
            <Text style={styles.bonusTitle}>Government Bonus</Text>
            <Text style={styles.bonusAmount}>
              +{formatCurrency(parseFloat(amount) * 0.25)}
            </Text>
            <Text style={styles.bonusDescription}>
              You'll receive a 25% bonus on this contribution!
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Tax Year Selection */}
      <View style={styles.taxYearSection}>
        <Text style={styles.inputLabel}>Tax Year</Text>
        <Text style={styles.taxYearHint}>Select when this contribution was made</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          {availableTaxYears.map((year) => {
            const isSelected = year.startYear === selectedTaxYear.startYear;
            return (
              <Pressable
                key={year.startYear}
                onPress={() => {
                  setSelectedTaxYear(year);
                  // Set contribution date to be within the selected tax year
                  setContributionDate(year.startDate);
                }}
                style={({ pressed }) => [
                  styles.taxYearButton,
                  isSelected && styles.taxYearButtonActive,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <Text style={[
                  styles.taxYearButtonText,
                  isSelected && styles.taxYearButtonTextActive
                ]}>
                  {getTaxYearLabel(year)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Optional Details */}
      <View style={styles.optionalSection}>
        <Text style={styles.optionalTitle}>Optional Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Notes</Text>
          <View style={styles.inputCard}>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add any notes..."
              placeholderTextColor={Colors.mediumGray}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="checkmark-circle-outline" size={32} color={Colors.gold} />
        <Text style={styles.stepTitle}>Review Changes</Text>
        <Text style={styles.stepSubtitle}>
          Confirm your updated contribution details
        </Text>
      </View>

      {/* Contribution Details Card */}
      <View style={styles.confirmationCard}>
        <View style={styles.confirmationRow}>
          <View style={[styles.isaIconCircle, { backgroundColor: isaInfo.color + '20' }]}>
            <Ionicons name={getISAIcon(contribution.isaType)} size={28} color={isaInfo.color} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.confirmationISAType}>{isaInfo.name}</Text>
            <Text style={styles.confirmationProvider}>{contribution.provider}</Text>
          </View>
        </View>

        <View style={styles.confirmationDivider} />

        <View style={styles.confirmationDetail}>
          <Text style={styles.confirmationDetailLabel}>New Amount</Text>
          <Text style={styles.confirmationDetailValue}>
            {formatCurrency(parseFloat(amount))}
          </Text>
          {parseFloat(amount) !== contribution.amount && (
            <Text style={styles.previousAmountText}>
              Previously: {formatCurrency(contribution.amount)}
            </Text>
          )}
        </View>

        {contribution.isaType === ISA_TYPES.LIFETIME && parseFloat(amount) > 0 && (
          <View style={styles.confirmationDetail}>
            <Text style={styles.confirmationDetailLabel}>Government Bonus</Text>
            <Text style={[styles.confirmationDetailValue, { color: isaInfo.color }]}>
              +{formatCurrency(parseFloat(amount) * 0.25)}
            </Text>
          </View>
        )}

        {notes && (
          <>
            <View style={styles.confirmationDivider} />
            <View style={styles.confirmationDetail}>
              <Text style={styles.confirmationDetailLabel}>Notes</Text>
              <Text style={styles.confirmationNotes}>{notes}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => {
    console.log('=== renderStep3 called ===');
    console.log('updatedContribution:', updatedContribution);
    console.log('current step:', step);

    if (!updatedContribution) {
      console.log('No updated contribution, returning null');
      return null;
    }

    const lisaBonus = updatedContribution.isaType === ISA_TYPES.LIFETIME
      ? updatedContribution.amount * 0.25
      : 0;

    console.log('Rendering confirmation screen for:', isaInfo.name);

    return (
      <View style={styles.stepContent}>
        {/* Success Icon */}
        <View style={styles.confirmationHeader}>
          <LinearGradient
            colors={[Colors.success + 'DD', Colors.success + '88']}
            style={styles.successIconWrapper}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark-circle" size={64} color={Colors.white} />
          </LinearGradient>
          <Text style={styles.confirmationTitle}>✓ Updated</Text>
          <Text style={styles.confirmationSubtitle}>
            Your contribution has been updated successfully
          </Text>
        </View>

        {/* Contribution Details Card */}
        <View style={styles.confirmationCard}>
          <View style={styles.confirmationRow}>
            <View style={[styles.isaIconCircle, { backgroundColor: isaInfo.color + '20' }]}>
              <Ionicons name={getISAIcon(updatedContribution.isaType)} size={28} color={isaInfo.color} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.confirmationISAType}>{isaInfo.name}</Text>
              <Text style={styles.confirmationProvider}>{updatedContribution.provider}</Text>
            </View>
          </View>

          <View style={styles.confirmationDivider} />

          <View style={styles.confirmationDetail}>
            <Text style={styles.confirmationDetailLabel}>Amount</Text>
            <Text style={styles.confirmationDetailValue}>
              {formatCurrency(updatedContribution.amount)}
            </Text>
          </View>

          {lisaBonus > 0 && (
            <View style={styles.confirmationDetail}>
              <Text style={styles.confirmationDetailLabel}>Government Bonus</Text>
              <Text style={[styles.confirmationDetailValue, { color: isaInfo.color }]}>
                +{formatCurrency(lisaBonus)}
              </Text>
            </View>
          )}

          {updatedContribution.notes && (
            <>
              <View style={styles.confirmationDivider} />
              <View style={styles.confirmationDetail}>
                <Text style={styles.confirmationDetailLabel}>Notes</Text>
                <Text style={styles.confirmationNotes}>{updatedContribution.notes}</Text>
              </View>
            </>
          )}
        </View>

        {/* Done Button */}
        <Pressable
          onPress={handleDone}
          style={({ pressed }) => [
            styles.doneButton,
            { opacity: pressed ? 0.9 : 1 }
          ]}
        >
          <LinearGradient
            colors={Colors.goldGradient}
            style={styles.doneButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Edit ISA Contribution"
      icon="create"
    >
      <>
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation Buttons */}
        {step < 3 && (
        <View style={styles.navigationButtons}>
          {step > 1 && (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <View style={styles.backButtonCard}>
                <Ionicons name="arrow-back" size={24} color={Colors.white} />
                <Text style={styles.backButtonText}>Back</Text>
              </View>
            </Pressable>
          )}

          {step < 2 ? (
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                styles.nextButton,
                step === 1 && styles.nextButtonFull,
                { opacity: pressed ? 0.9 : 1 }
              ]}
            >
              <LinearGradient
                colors={Colors.goldGradient}
                style={styles.nextButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="arrow-forward" size={24} color={Colors.deepNavy} />
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                { opacity: pressed ? 0.9 : 1 }
              ]}
            >
              <LinearGradient
                colors={Colors.goldGradient}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="checkmark-circle" size={24} color={Colors.deepNavy} />
                <Text style={styles.submitButtonText}>Update Contribution</Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>
        )}
      </>
    </Modal>
  );
}

const styles = StyleSheet.create({
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.gold,
  },
  stepNumber: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    fontWeight: Typography.weights.bold,
  },
  stepNumberActive: {
    color: Colors.deepNavy,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.glassLight,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: Colors.gold,
  },
  stepContent: {
    // Removed flex: 1 to allow proper scrolling
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  stepTitle: {
    fontSize: Typography.sizes.xxl,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Step 1: Amount Entry
  summaryCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: Typography.weights.semibold,
  },
  summaryValue: {
    fontSize: Typography.sizes.md,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
  },
  amountSection: {
    marginBottom: Spacing.lg,
  },
  amountLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  amountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  currencySymbol: {
    fontSize: Typography.sizes.xxxl,
    color: Colors.gold,
    fontWeight: Typography.weights.extrabold,
    marginRight: Spacing.xs,
  },
  amountInput: {
    fontSize: Typography.sizes.xxxl,
    color: Colors.gold,
    fontWeight: Typography.weights.extrabold,
    minWidth: 100,
    maxWidth: 200,
  },
  amountHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  amountHintText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },
  bonusCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(40, 167, 69, 0.3)',
  },
  bonusGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
  },
  bonusTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.success,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  bonusAmount: {
    fontSize: Typography.sizes.xxxl,
    color: Colors.success,
    fontWeight: Typography.weights.extrabold,
    marginBottom: Spacing.xs,
  },
  bonusDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    opacity: 0.9,
  },
  taxYearSection: {
    marginBottom: Spacing.lg,
  },
  taxYearHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginBottom: Spacing.md,
    marginTop: 4,
  },
  taxYearButton: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.glassLight,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  taxYearButtonActive: {
    backgroundColor: Colors.gold + '20',
    borderColor: Colors.gold,
  },
  taxYearButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
  },
  taxYearButtonTextActive: {
    color: Colors.gold,
  },
  optionalSection: {
    marginTop: Spacing.md,
  },
  optionalTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
  },
  inputCard: {
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  notesInput: {
    minHeight: 60,
  },

  // Navigation
  navigationButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    flex: 1,
  },
  backButtonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.glassDark,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  nextButton: {
    flex: 1,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  nextButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
  submitButton: {
    flex: 1,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  submitButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },

  // Confirmation Screen Styles
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  successIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  confirmationTitle: {
    fontSize: Typography.sizes.xl,
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
    marginBottom: Spacing.xs,
  },
  confirmationSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    textAlign: 'center',
  },
  confirmationCard: {
    backgroundColor: Colors.glassDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  isaIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationISAType: {
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  confirmationProvider: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginTop: 4,
  },
  confirmationDivider: {
    height: 1,
    backgroundColor: Colors.glassLight,
    marginVertical: Spacing.md,
  },
  confirmationDetail: {
    marginBottom: Spacing.md,
  },
  confirmationDetailLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginBottom: 4,
  },
  confirmationDetailValue: {
    fontSize: Typography.sizes.xxl,
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
  },
  confirmationNotes: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    lineHeight: 22,
    marginTop: 4,
  },
  previousAmountText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginTop: 4,
    fontStyle: 'italic',
  },
  doneButton: {
    width: '100%',
  },
  doneButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  doneButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.extrabold,
  },
});
