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
import { searchProviders, getPopularProviders, ISAProvider } from '@/constants/isaProviders';
import { getAvailableTaxYears, getTaxYearLabel, getTaxYearFromDate, type TaxYear } from '@/utils/taxYear';
import { getISASetting, setISASetting } from '@/utils/isaSettings';

const { width } = Dimensions.get('window');

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
  const [selectedType, setSelectedType] = useState(ISA_TYPES.CASH);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [contributionDate, setContributionDate] = useState(new Date());
  const [providerSearch, setProviderSearch] = useState('');
  const [filteredProviders, setFilteredProviders] = useState<ISAProvider[]>(getPopularProviders());
  const [submittedContribution, setSubmittedContribution] = useState<ISAContribution | null>(null);
  const [availableTaxYears] = useState<TaxYear[]>(getAvailableTaxYears(5, 1)); // 5 previous + 1 future year
  const [selectedTaxYear, setSelectedTaxYear] = useState<TaxYear>(getTaxYearFromDate(new Date()));
  const [showFlexibilityQuestion, setShowFlexibilityQuestion] = useState(false);
  const [isFlexible, setIsFlexible] = useState<boolean | null>(null);
  const [needsFlexibilityAnswer, setNeedsFlexibilityAnswer] = useState(false);

  const TOTAL_STEPS = 4;

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      console.log('Modal opened, resetting form');
      setStep(1);
      setProvider('');
      setSelectedProviderData(null);
      setSelectedType(preSelectedType || ISA_TYPES.CASH);
      setAmount('');
      setNotes('');
      setContributionDate(new Date());
      setSelectedTaxYear(getTaxYearFromDate(new Date()));
      setProviderSearch('');
      setFilteredProviders(getPopularProviders());
      setSubmittedContribution(null);
      setShowFlexibilityQuestion(false);
      setIsFlexible(null);
      setNeedsFlexibilityAnswer(false);
    }
  }, [visible, preSelectedType]);

  const resetForm = () => {
    setStep(1);
    setProvider('');
    setSelectedProviderData(null);
    setSelectedType(ISA_TYPES.CASH);
    setAmount('');
    setNotes('');
    setContributionDate(new Date());
    setSelectedTaxYear(getTaxYearFromDate(new Date()));
    setProviderSearch('');
    setFilteredProviders(getPopularProviders());
    setSubmittedContribution(null);
    setShowFlexibilityQuestion(false);
    setIsFlexible(null);
    setNeedsFlexibilityAnswer(false);
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
    setSelectedProviderData(providerData);
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
    console.log('=== handleSubmit called ===');

    // Check if we need to ask about flexibility
    const setting = await getISASetting(provider.trim(), selectedType);

    // Lifetime ISAs are NEVER flexible - automatically set as non-flexible
    if (selectedType === ISA_TYPES.LIFETIME && !setting) {
      console.log('Lifetime ISA detected - automatically setting as non-flexible');
      await setISASetting(provider.trim(), selectedType, false);
      console.log(`✅ Saved flexibility setting for Lifetime ISA: false`);

      // Close modal directly for Lifetime ISA
      const contributionAmount = parseFloat(amount);
      const contribution: ISAContribution = {
        id: Date.now().toString(),
        provider: provider.trim(),
        isaType: selectedType,
        amount: contributionAmount,
        date: contributionDate.toISOString(),
        notes: notes.trim() || undefined,
      };

      console.log('Created contribution:', contribution);

      if (onAdd) {
        console.log('Calling parent onAdd');
        onAdd(contribution);
      }

      // Close modal directly
      handleDone();
      return;
    } else if (!setting && !needsFlexibilityAnswer) {
      // First time adding to this provider+type combo (non-Lifetime ISA)
      // Show flexibility question
      console.log('First time for this provider+type - showing flexibility question');
      setShowFlexibilityQuestion(true);
      setNeedsFlexibilityAnswer(true);
      return; // Don't submit yet
    }

    // If we need an answer but haven't set it yet, don't proceed
    if (needsFlexibilityAnswer && isFlexible === null) {
      Alert.alert('Please Answer', 'Please indicate if your ISA is flexible before continuing.');
      return;
    }

    // Save the flexibility setting if this is the first time
    if (needsFlexibilityAnswer && isFlexible !== null) {
      await setISASetting(provider.trim(), selectedType, isFlexible);
      console.log(`✅ Saved flexibility setting: ${isFlexible}`);
    }

    const contributionAmount = parseFloat(amount);

    const contribution: ISAContribution = {
      id: Date.now().toString(),
      provider: provider.trim(),
      isaType: selectedType,
      amount: contributionAmount,
      date: contributionDate.toISOString(),
      notes: notes.trim() || undefined,
    };

    console.log('Created contribution:', contribution);

    // Call parent's onAdd
    if (onAdd) {
      console.log('Calling parent onAdd');
      onAdd(contribution);
    }

    // Close modal directly instead of going to confirmation screen
    handleDone();
  };

  const handleDone = () => {
    resetForm();
    onClose();
  };

  const handleFlexibilityDone = async () => {
    // Save the flexibility setting
    if (needsFlexibilityAnswer && isFlexible !== null) {
      await setISASetting(provider.trim(), selectedType, isFlexible);
      console.log(`✅ Saved flexibility setting: ${isFlexible}`);
    }

    const contributionAmount = parseFloat(amount);

    const contribution: ISAContribution = {
      id: Date.now().toString(),
      provider: provider.trim(),
      isaType: selectedType,
      amount: contributionAmount,
      date: contributionDate.toISOString(),
      notes: notes.trim() || undefined,
    };

    console.log('Created contribution:', contribution);

    // Call parent's onAdd
    if (onAdd) {
      console.log('Calling parent onAdd');
      onAdd(contribution);
    }

    // Close modal directly instead of going to confirmation screen
    handleDone();
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

  // Helper function to check if selected provider offers a specific ISA type
  const isISATypeAvailable = (isaType: string): boolean => {
    if (!selectedProviderData) return true; // If no provider selected, show all types

    // Check if provider offers this ISA type
    const typeMap: Record<string, string> = {
      [ISA_TYPES.CASH]: 'Cash ISA',
      [ISA_TYPES.STOCKS_SHARES]: 'Stocks & Shares ISA',
      [ISA_TYPES.LIFETIME]: 'Lifetime ISA',
      [ISA_TYPES.INNOVATIVE_FINANCE]: 'Innovative Finance ISA',
    };

    const mappedType = typeMap[isaType];
    const providerOffersType = selectedProviderData.types.includes(mappedType);

    // Additional check for Lifetime ISA - only one provider allowed
    if (isaType === ISA_TYPES.LIFETIME && currentISAs) {
      const currentLifetimeISA = currentISAs.lifetime;
      if (currentLifetimeISA && currentLifetimeISA.provider &&
          currentLifetimeISA.provider !== 'None' &&
          currentLifetimeISA.provider !== selectedProviderData.name) {
        return false; // Different provider already exists for Lifetime ISA
      }
    }

    return providerOffersType;
  };

  const maxContribution =
    selectedType === ISA_TYPES.LIFETIME ? LIFETIME_ISA_MAX : ISA_ANNUAL_ALLOWANCE;

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((s) => (
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
      <View style={styles.searchCard}>
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
            <Pressable
              onPress={() => {
                setProviderSearch('');
                setFilteredProviders(getPopularProviders());
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
            >
              <Ionicons name="close-circle" size={20} color={Colors.lightGray} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Provider List */}
      <Text style={styles.listTitle}>
        {providerSearch.trim().length > 0 ? `Results (${filteredProviders.length})` : 'Popular Providers'}
      </Text>
      {filteredProviders.map((providerData, index) => (
        <Pressable
          key={index}
          onPress={() => selectProvider(providerData)}
          style={({ pressed }) => [
            { opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <View style={styles.providerCard}>
            <View style={styles.providerCardContent}>
              <View style={[
                styles.providerBadge,
                { backgroundColor: getCategoryColor(providerData.category) + '20' }
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
          </View>
        </Pressable>
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
      <View style={styles.selectedProviderCard}>
        <Text style={styles.selectedProviderLabel}>Selected Provider</Text>
        <Text style={styles.selectedProviderName}>{provider}</Text>
        {selectedProviderData && (
          <View style={styles.providerTypesList}>
            <Text style={styles.providerTypesLabel}>Available ISA Types</Text>
            <View style={styles.providerTypesChips}>
              {selectedProviderData.types.map((type, idx) => (
                <View key={idx} style={styles.providerTypeChip}>
                  <Text style={styles.providerTypeChipText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* ISA Type Grid */}
      <View style={styles.isaTypeGrid}>
        {Object.values(ISA_TYPES).map((type) => {
          const info = ISA_INFO[type];
          const isSelected = selectedType === type;
          const isAvailable = isISATypeAvailable(type);

          // Check if Lifetime ISA is unavailable due to different provider
          const isLifetimeWithDifferentProvider =
            type === ISA_TYPES.LIFETIME &&
            currentISAs?.lifetime?.provider &&
            currentISAs.lifetime.provider !== 'None' &&
            selectedProviderData &&
            currentISAs.lifetime.provider !== selectedProviderData.name;

          const handleISATypePress = () => {
            if (isAvailable) {
              setSelectedType(type);
            } else if (isLifetimeWithDifferentProvider) {
              Alert.alert(
                'Lifetime ISA Rule',
                `You can only have one Lifetime ISA provider at a time.\n\nYou currently have a Lifetime ISA with ${currentISAs?.lifetime?.provider}.\n\nTo add contributions from ${selectedProviderData?.name}, you would need to transfer your Lifetime ISA to them first.`,
                [{ text: 'OK' }]
              );
            }
          };

          return (
            <Pressable
              key={type}
              onPress={handleISATypePress}
              disabled={!isAvailable && !isLifetimeWithDifferentProvider}
              style={({ pressed }) => [
                styles.isaTypeButton,
                { opacity: pressed && isAvailable ? 0.8 : 1 }
              ]}
            >
              <View
                style={[
                  styles.isaTypeCard,
                  isSelected && styles.isaTypeCardSelected,
                  !isAvailable && styles.isaTypeCardDisabled,
                ]}
              >
                {isSelected && isAvailable && (
                  <View style={styles.selectedBadgeCorner}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.gold} />
                  </View>
                )}
                {!isAvailable && (
                  <View style={styles.unavailableBadge}>
                    <Ionicons name="close-circle" size={20} color={Colors.error} />
                  </View>
                )}
                <View style={[
                  styles.isaTypeIcon,
                  { backgroundColor: (isAvailable ? info.color : Colors.mediumGray) + '20' }
                ]}>
                  <Ionicons
                    name={getISAIcon(type)}
                    size={32}
                    color={isAvailable ? info.color : Colors.mediumGray}
                  />
                </View>
                <Text style={[
                  styles.isaTypeName,
                  !isAvailable && styles.isaTypeNameDisabled
                ]}>
                  {info.shortName}
                </Text>
                <Text style={[
                  styles.isaTypeDescription,
                  !isAvailable && styles.isaTypeDescriptionDisabled
                ]}>
                  {isAvailable ? `${info.riskLevel} Risk` : 'Not Available'}
                </Text>
              </View>
            </Pressable>
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
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Provider</Text>
          <Text style={styles.summaryValue}>{provider}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>ISA Type</Text>
          <Text style={styles.summaryValue}>{ISA_INFO[selectedType].shortName}</Text>
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
      {selectedType === ISA_TYPES.LIFETIME && parseFloat(amount) > 0 && (
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

  const renderFlexibilityQuestion = () => {
    if (!showFlexibilityQuestion) return null;

    const isaInfo = ISA_INFO[selectedType];

    return (
      <View style={styles.flexibilityOverlay}>
        <View style={styles.flexibilityCard}>
          <View style={styles.flexibilityHeader}>
            <Ionicons name="help-circle" size={48} color={Colors.gold} />
            <Text style={styles.flexibilityTitle}>
              Is Your {provider} {isaInfo.shortName} ISA Flexible?
            </Text>
          </View>

          <View style={styles.flexibilityInfo}>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color={Colors.info} />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={styles.infoBoxTitle}>What's a Flexible ISA?</Text>
                <Text style={styles.infoBoxText}>
                  Flexible ISAs let you withdraw money and put it back in the same tax year without losing your allowance.
                </Text>
                <Text style={[styles.infoBoxText, { marginTop: Spacing.sm }]}>
                  Check your {provider} account details or contact them if you're unsure.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.flexibilityOptions}>
            <Pressable
              onPress={() => setIsFlexible(true)}
              style={({ pressed }) => [
                styles.flexibilityOption,
                isFlexible === true && styles.flexibilityOptionSelected,
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <View style={styles.flexibilityOptionContent}>
                <View style={[
                  styles.radioCircle,
                  isFlexible === true && styles.radioCircleSelected
                ]}>
                  {isFlexible === true && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.flexibilityOptionTitle}>Yes, it's flexible</Text>
                  <Text style={styles.flexibilityOptionDesc}>
                    I can withdraw and replace money without losing allowance
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={isFlexible === true ? Colors.gold : Colors.mediumGray} />
              </View>
            </Pressable>

            <Pressable
              onPress={() => setIsFlexible(false)}
              style={({ pressed }) => [
                styles.flexibilityOption,
                isFlexible === false && styles.flexibilityOptionSelected,
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <View style={styles.flexibilityOptionContent}>
                <View style={[
                  styles.radioCircle,
                  isFlexible === false && styles.radioCircleSelected
                ]}>
                  {isFlexible === false && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.flexibilityOptionTitle}>No, it's not flexible</Text>
                  <Text style={styles.flexibilityOptionDesc}>
                    Withdrawals reduce my allowance permanently
                  </Text>
                </View>
                <Ionicons name="close-circle" size={24} color={isFlexible === false ? Colors.error : Colors.mediumGray} />
              </View>
            </Pressable>
          </View>

          <View style={styles.flexibilityActions}>
            <Pressable
              onPress={() => {
                setShowFlexibilityQuestion(false);
                setIsFlexible(null);
                setNeedsFlexibilityAnswer(false);
              }}
              style={({ pressed }) => [
                styles.flexibilityCancelButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Text style={styles.flexibilityCancelText}>Cancel</Text>
            </Pressable>

            {isFlexible !== null && (
              <Pressable
                onPress={handleFlexibilityDone}
                style={({ pressed }) => [
                  styles.flexibilityConfirmButton,
                  { opacity: pressed ? 0.9 : 1 }
                ]}
              >
                <LinearGradient
                  colors={Colors.goldGradient}
                  style={styles.flexibilityConfirmGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark-circle" size={24} color={Colors.deepNavy} />
                  <Text style={styles.flexibilityConfirmText}>Done</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderStep4 = () => {
    console.log('=== renderStep4 called ===');
    console.log('submittedContribution:', submittedContribution);
    console.log('current step:', step);

    if (!submittedContribution) {
      console.log('No submitted contribution, returning null');
      return null;
    }

    const isaInfo = ISA_INFO[submittedContribution.isaType];
    const lisaBonus = submittedContribution.isaType === ISA_TYPES.LIFETIME
      ? submittedContribution.amount * 0.25
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
          <Text style={styles.confirmationTitle}>✓ Confirmed</Text>
          <Text style={styles.confirmationSubtitle}>
            Your contribution has been added successfully
          </Text>
        </View>

        {/* Contribution Details Card */}
        <View style={styles.confirmationCard}>
          <View style={styles.confirmationRow}>
            <View style={[styles.isaIconCircle, { backgroundColor: isaInfo.color + '20' }]}>
              <Ionicons name={getISAIcon(submittedContribution.isaType)} size={28} color={isaInfo.color} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.confirmationISAType}>{isaInfo.name}</Text>
              <Text style={styles.confirmationProvider}>{submittedContribution.provider}</Text>
            </View>
          </View>

          <View style={styles.confirmationDivider} />

          <View style={styles.confirmationDetail}>
            <Text style={styles.confirmationDetailLabel}>Amount Added</Text>
            <Text style={styles.confirmationDetailValue}>
              {formatCurrency(submittedContribution.amount)}
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

          {submittedContribution.notes && (
            <>
              <View style={styles.confirmationDivider} />
              <View style={styles.confirmationDetail}>
                <Text style={styles.confirmationDetailLabel}>Notes</Text>
                <Text style={styles.confirmationNotes}>{submittedContribution.notes}</Text>
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
        {step === 4 && renderStep4()}

        {/* Flexibility Question Overlay */}
        {renderFlexibilityQuestion()}

        {/* Navigation Buttons */}
        {step < 4 && (
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

          {step < 3 ? (
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
                <Text style={styles.submitButtonText}>Add Contribution</Text>
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

  // Step 1: Provider Selection
  searchCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectedProviderLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    marginBottom: Spacing.sm,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  selectedProviderName: {
    fontSize: Typography.sizes.xxxl,
    color: Colors.gold,
    fontWeight: Typography.weights.extrabold,
    textAlign: 'center',
  },
  providerTypesList: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  providerTypesLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    marginBottom: Spacing.md,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  providerTypesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  providerTypeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  providerTypeChipText: {
    fontSize: Typography.sizes.xs,
    color: Colors.gold,
    fontWeight: Typography.weights.semibold,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  isaTypeCardSelected: {
    borderWidth: 2.5,
    borderColor: Colors.gold,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  isaTypeCardDisabled: {
    opacity: 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedBadgeCorner: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  unavailableBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    borderRadius: 20,
    padding: 6,
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
  isaTypeNameDisabled: {
    color: Colors.mediumGray,
  },
  isaTypeDescription: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    textAlign: 'center',
    fontWeight: Typography.weights.semibold,
  },
  isaTypeDescriptionDisabled: {
    color: Colors.mediumGray,
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
  taxYearButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
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

  // Flexibility Question Overlay
  flexibilityOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    zIndex: 1000,
  },
  flexibilityCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: Colors.mediumNavy,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.gold + '40',
  },
  flexibilityHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  flexibilityTitle: {
    fontSize: Typography.sizes.xl,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 28,
  },
  flexibilityInfo: {
    marginBottom: Spacing.xl,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.info + '15',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  infoBoxTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  infoBoxText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 20,
  },
  flexibilityOptions: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  flexibilityOption: {
    backgroundColor: Colors.glassDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  flexibilityOptionSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold + '15',
  },
  flexibilityOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.gold,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.gold,
  },
  flexibilityOptionTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  flexibilityOptionDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 18,
  },
  flexibilityActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flexibilityCancelButton: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.glassDark,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexibilityCancelText: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  flexibilityConfirmButton: {
    flex: 2,
  },
  flexibilityConfirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  flexibilityConfirmText: {
    fontSize: Typography.sizes.md,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
});
