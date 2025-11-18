import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
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
import { searchProviders, getPopularProviders, ISAProvider } from '@/constants/isaProviders';

const { width } = Dimensions.get('window');

interface AddISAContributionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd?: (contribution: ISAContribution) => void;
}

export interface ISAContribution {
  id: string;
  provider: string;
  isaType: string;
  amount: number;
  date: string;
  accountNumber?: string;
  notes?: string;
}

export default function AddISAContributionModal({
  visible,
  onClose,
  onAdd,
}: AddISAContributionModalProps) {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState('');
  const [selectedType, setSelectedType] = useState(ISA_TYPES.CASH);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [providerSearch, setProviderSearch] = useState('');
  const [filteredProviders, setFilteredProviders] = useState<ISAProvider[]>(getPopularProviders());

  const TOTAL_STEPS = 3;

  const resetForm = () => {
    setStep(1);
    setProvider('');
    setSelectedType(ISA_TYPES.CASH);
    setAmount('');
    setAccountNumber('');
    setNotes('');
    setProviderSearch('');
    setFilteredProviders(getPopularProviders());
  };

  const handleProviderSearch = (text: string) => {
    setProviderSearch(text);
    if (text.trim().length > 0) {
      const results = searchProviders(text);
      setFilteredProviders(results.slice(0, 10));
    } else {
      setFilteredProviders(getPopularProviders());
    }
  };

  const selectProvider = (providerData: ISAProvider) => {
    setProvider(providerData.name);
    setProviderSearch(providerData.name);
    // Auto-advance to next step
    setTimeout(() => setStep(2), 300);
  };

  const handleNext = () => {
    if (step === 1 && !provider.trim()) {
      Alert.alert('Provider Required', 'Please select or enter an ISA provider');
      return;
    }
    if (step === 2) {
      // ISA type is always selected
    }
    if (step === 3) {
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
      if (selectedType === ISA_TYPES.LIFETIME && contributionAmount > LIFETIME_ISA_MAX) {
        Alert.alert(
          'LISA Limit Exceeded',
          `Lifetime ISA contributions are limited to ${formatCurrency(LIFETIME_ISA_MAX)} per year`
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

  const handleSubmit = () => {
    const contributionAmount = parseFloat(amount);

    const contribution: ISAContribution = {
      id: Date.now().toString(),
      provider: provider.trim(),
      isaType: selectedType,
      amount: contributionAmount,
      date: new Date().toISOString(),
      accountNumber: accountNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (onAdd) {
      onAdd(contribution);
    }

    Alert.alert(
      'Success!',
      `Added ${formatCurrency(contributionAmount)} to your ${ISA_INFO[selectedType].name}`,
      [
        {
          text: 'Done',
          onPress: () => {
            resetForm();
            onClose();
          },
        },
      ]
    );
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

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'bank': 'business',
      'investment-platform': 'trending-up',
      'fintech': 'phone-portrait',
      'building-society': 'home',
    };
    return iconMap[category] || 'business';
  };

  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'bank': Colors.info,
      'investment-platform': Colors.success,
      'fintech': Colors.gold,
      'building-society': Colors.warning,
    };
    return colorMap[category] || Colors.info;
  };

  const maxContribution =
    selectedType === ISA_TYPES.LIFETIME ? LIFETIME_ISA_MAX : ISA_ANNUAL_ALLOWANCE;

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
        <Ionicons name="business" size={32} color={Colors.gold} />
        <Text style={styles.stepTitle}>Choose Your Provider</Text>
        <Text style={styles.stepSubtitle}>
          Select from popular providers or search for your ISA provider
        </Text>
      </View>

      {/* Search Bar */}
      <GlassCard style={styles.searchCard} intensity="medium">
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.gold} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search providers..."
            placeholderTextColor={Colors.mediumGray}
            value={providerSearch}
            onChangeText={handleProviderSearch}
            autoCapitalize="words"
          />
          {providerSearch.length > 0 && (
            <TouchableOpacity onPress={() => {
              setProviderSearch('');
              setFilteredProviders(getPopularProviders());
            }}>
              <Ionicons name="close-circle" size={20} color={Colors.lightGray} />
            </TouchableOpacity>
          )}
        </View>
      </GlassCard>

      {/* Provider List */}
      <Text style={styles.listTitle}>
        {providerSearch.trim().length > 0 ? `Results (${filteredProviders.length})` : 'Popular Providers'}
      </Text>
      {filteredProviders.map((providerData, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => selectProvider(providerData)}
          activeOpacity={0.7}
        >
          <GlassCard style={styles.providerCard} intensity="medium">
            <View style={styles.providerCardContent}>
              <View style={[
                styles.providerBadge,
                { backgroundColor: getCategoryColor(providerData.category) + '30' }
              ]}>
                <Ionicons
                  name={getCategoryIcon(providerData.category)}
                  size={24}
                  color={getCategoryColor(providerData.category)}
                />
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{providerData.name}</Text>
                <Text style={styles.providerTypes}>
                  {providerData.types.join(' • ')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.lightGray} />
            </View>
          </GlassCard>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="wallet" size={32} color={Colors.gold} />
        <Text style={styles.stepTitle}>Select ISA Type</Text>
        <Text style={styles.stepSubtitle}>
          Choose the type of ISA you're contributing to
        </Text>
      </View>

      {/* Selected Provider Display */}
      <GlassCard style={styles.selectedProviderCard} intensity="dark">
        <Text style={styles.selectedProviderLabel}>Provider</Text>
        <Text style={styles.selectedProviderName}>{provider}</Text>
      </GlassCard>

      {/* ISA Type Grid */}
      <View style={styles.isaTypeGrid}>
        {Object.values(ISA_TYPES).map((type) => {
          const info = ISA_INFO[type];
          const isSelected = selectedType === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedType(type)}
              activeOpacity={0.7}
              style={styles.isaTypeButton}
            >
              <GlassCard
                style={[
                  styles.isaTypeCard,
                  isSelected && styles.isaTypeCardSelected,
                ]}
                intensity={isSelected ? 'dark' : 'medium'}
              >
                {isSelected && (
                  <View style={styles.selectedBadgeCorner}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.gold} />
                  </View>
                )}
                <View style={[styles.isaTypeIcon, { backgroundColor: info.color + '30' }]}>
                  <Ionicons
                    name={getISAIcon(type)}
                    size={32}
                    color={info.color}
                  />
                </View>
                <Text style={styles.isaTypeName}>{info.shortName}</Text>
                <Text style={styles.isaTypeDescription}>{info.riskLevel} Risk</Text>
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="calculator" size={32} color={Colors.gold} />
        <Text style={styles.stepTitle}>Enter Amount</Text>
        <Text style={styles.stepSubtitle}>
          How much are you contributing?
        </Text>
      </View>

      {/* Provider & Type Summary */}
      <GlassCard style={styles.summaryCard} intensity="dark">
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Provider:</Text>
          <Text style={styles.summaryValue}>{provider}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>ISA Type:</Text>
          <Text style={styles.summaryValue}>{ISA_INFO[selectedType].shortName}</Text>
        </View>
      </GlassCard>

      {/* Amount Input */}
      <GlassCard style={styles.amountCard} intensity="dark">
        <Text style={styles.amountLabel}>CONTRIBUTION AMOUNT</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>£</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={Colors.mediumGray}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>
        {parseFloat(amount) > 0 && (
          <View style={styles.amountDisplay}>
            <Text style={styles.amountDisplayText}>
              {formatCurrency(parseFloat(amount))}
            </Text>
          </View>
        )}
        <View style={styles.amountHint}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
          <Text style={styles.amountHintText}>
            Max: {formatCurrency(maxContribution)} per tax year
          </Text>
        </View>
      </GlassCard>

      {/* LISA Bonus */}
      {selectedType === ISA_TYPES.LIFETIME && parseFloat(amount) > 0 && (
        <GlassCard style={styles.bonusCard} intensity="dark">
          <LinearGradient
            colors={[Colors.success + 'DD', Colors.success + '88']}
            style={styles.bonusGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="gift" size={28} color={Colors.white} />
            <Text style={styles.bonusTitle}>Government Bonus</Text>
            <Text style={styles.bonusAmount}>
              +{formatCurrency(parseFloat(amount) * 0.25)}
            </Text>
            <Text style={styles.bonusDescription}>
              You'll receive a 25% bonus on this contribution!
            </Text>
          </LinearGradient>
        </GlassCard>
      )}

      {/* Optional Details */}
      <View style={styles.optionalSection}>
        <Text style={styles.optionalTitle}>Optional Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Account Number</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="Last 4 digits or full account number"
              placeholderTextColor={Colors.mediumGray}
              value={accountNumber}
              onChangeText={setAccountNumber}
            />
          </GlassCard>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Notes</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
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
          </GlassCard>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Add ISA Contribution"
      icon="add-circle"
    >
      <>
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {step > 1 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <View style={styles.backButtonCard}>
                <Ionicons name="arrow-back" size={24} color={Colors.white} />
                <Text style={styles.backButtonText}>Back</Text>
              </View>
            </TouchableOpacity>
          )}

          {step < TOTAL_STEPS ? (
            <TouchableOpacity
              onPress={handleNext}
              style={[styles.nextButton, step === 1 && styles.nextButtonFull]}
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
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              <LinearGradient
                colors={Colors.goldGradient}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="checkmark-circle" size={24} color={Colors.deepNavy} />
                <Text style={styles.submitButtonText}>Add Contribution</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
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

  // Step 1: Provider Selection
  searchCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  listTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  providerCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  providerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  providerTypes: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },

  // Step 2: ISA Type Selection
  selectedProviderCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
  },
  selectedProviderLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginBottom: Spacing.sm,
    fontWeight: Typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  selectedProviderName: {
    fontSize: Typography.sizes.xxl,
    color: Colors.gold,
    fontWeight: Typography.weights.extrabold,
  },
  isaTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  isaTypeButton: {
    width: (width - Spacing.lg * 4) / 2,
    maxWidth: 180,
  },
  isaTypeCard: {
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 170,
    aspectRatio: 1,
    borderRadius: BorderRadius.xl,
  },
  isaTypeCardSelected: {
    borderWidth: 3,
    borderColor: Colors.gold,
    backgroundColor: Colors.gold + '10',
  },
  selectedBadgeCorner: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  isaTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  isaTypeName: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  isaTypeDescription: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    textAlign: 'center',
    fontWeight: Typography.weights.semibold,
  },
  isaInfoCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  isaInfoTitle: {
    fontSize: Typography.sizes.xl,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  isaInfoDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    lineHeight: 22,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  isaInfoStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.deepNavy + '80',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  isaInfoStat: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  isaInfoStatLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    fontWeight: Typography.weights.medium,
  },
  isaInfoStatValue: {
    fontSize: Typography.sizes.xl,
    color: Colors.gold,
    fontWeight: Typography.weights.extrabold,
  },

  // Step 3: Amount Entry
  summaryCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },
  summaryValue: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
  },
  amountCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1.5,
    marginBottom: Spacing.lg,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  currencySymbol: {
    fontSize: 48,
    color: Colors.gold,
    fontWeight: Typography.weights.extrabold,
    marginRight: Spacing.sm,
  },
  amountInput: {
    fontSize: 48,
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
    minWidth: 120,
  },
  amountDisplay: {
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
    marginBottom: Spacing.md,
  },
  amountDisplayText: {
    fontSize: Typography.sizes.xl,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
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
  },
  bonusGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  bonusTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  bonusAmount: {
    fontSize: Typography.sizes.xxxl,
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
    marginBottom: Spacing.xs,
  },
  bonusDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    opacity: 0.9,
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
});
