import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
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
  const [provider, setProvider] = useState('');
  const [selectedType, setSelectedType] = useState(ISA_TYPES.CASH);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setProvider('');
    setSelectedType(ISA_TYPES.CASH);
    setAmount('');
    setAccountNumber('');
    setNotes('');
  };

  const handleSubmit = () => {
    // Validation
    if (!provider.trim()) {
      Alert.alert('Required Field', 'Please enter the provider name');
      return;
    }

    const contributionAmount = parseFloat(amount);
    if (!contributionAmount || contributionAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid contribution amount');
      return;
    }

    // Check if amount exceeds annual allowance
    if (contributionAmount > ISA_ANNUAL_ALLOWANCE) {
      Alert.alert(
        'Amount Too High',
        `The amount exceeds the annual ISA allowance of ${formatCurrency(ISA_ANNUAL_ALLOWANCE)}`
      );
      return;
    }

    // Check Lifetime ISA limit
    if (selectedType === ISA_TYPES.LIFETIME && contributionAmount > LIFETIME_ISA_MAX) {
      Alert.alert(
        'LISA Limit Exceeded',
        `Lifetime ISA contributions are limited to ${formatCurrency(LIFETIME_ISA_MAX)} per year`
      );
      return;
    }

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
      'Contribution Added',
      `Successfully added ${formatCurrency(contributionAmount)} to your ${ISA_INFO[selectedType].name}!`,
      [
        {
          text: 'OK',
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

  const maxContribution =
    selectedType === ISA_TYPES.LIFETIME ? LIFETIME_ISA_MAX : ISA_ANNUAL_ALLOWANCE;

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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <GlassCard style={styles.infoCard} intensity="dark">
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={24} color={Colors.info} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.infoTitle}>Track Your ISA Contributions</Text>
              <Text style={styles.infoText}>
                Add details about your ISA contribution to track your annual allowance and
                manage your investments.
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Provider Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Provider Name *</Text>
          <Text style={styles.helperText}>
            e.g., Barclays, Vanguard, Moneybox, Hargreaves Lansdown
          </Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="Enter provider name"
              placeholderTextColor={Colors.mediumGray}
              value={provider}
              onChangeText={setProvider}
            />
          </GlassCard>
        </View>

        {/* ISA Type Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ISA Type *</Text>
          <View style={styles.typeGrid}>
            {Object.values(ISA_TYPES).map((type) => {
              const info = ISA_INFO[type];
              const isSelected = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedType(type)}
                  style={styles.typeCardWrapper}
                >
                  <GlassCard
                    style={[
                      styles.typeCard,
                      isSelected && styles.typeCardSelected,
                    ]}
                    intensity={isSelected ? 'dark' : 'medium'}
                  >
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
                      </View>
                    )}
                    <View
                      style={[
                        styles.typeIcon,
                        { backgroundColor: info.color + '30' },
                      ]}
                    >
                      <Ionicons
                        name={getISAIcon(type)}
                        size={24}
                        color={info.color}
                      />
                    </View>
                    <Text style={styles.typeName}>{info.shortName}</Text>
                    <Text style={styles.typeRisk}>{info.riskLevel} Risk</Text>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ISA Details */}
        <GlassCard style={styles.detailsCard} intensity="medium">
          <Text style={styles.detailsTitle}>{ISA_INFO[selectedType].name}</Text>
          <Text style={styles.detailsDesc}>
            {ISA_INFO[selectedType].description}
          </Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={18} color={Colors.gold} />
              <Text style={styles.detailLabel}>Max Contribution</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(maxContribution)}
              </Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.success} />
              <Text style={styles.detailLabel}>Risk Level</Text>
              <Text style={styles.detailValue}>
                {ISA_INFO[selectedType].riskLevel}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Contribution Amount - PROMINENT */}
        <GlassCard style={styles.amountSection} intensity="dark">
          <View style={styles.amountHeader}>
            <Ionicons name="cash-outline" size={28} color={Colors.gold} />
            <Text style={styles.amountHeaderText}>How much are you contributing?</Text>
          </View>

          <View style={styles.amountInputWrapper}>
            <Text style={styles.amountLabel}>CONTRIBUTION AMOUNT *</Text>
            <GlassCard style={styles.amountInputCard} intensity="medium">
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>£</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={Colors.mediumGray}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  autoFocus={false}
                />
              </View>
            </GlassCard>
          </View>

          {parseFloat(amount) > 0 && (
            <View style={styles.amountPreview}>
              <Text style={styles.amountPreviewLabel}>You're adding:</Text>
              <Text style={styles.amountPreviewValue}>
                {formatCurrency(parseFloat(amount))}
              </Text>
            </View>
          )}

          <View style={styles.amountInfo}>
            <View style={styles.amountInfoRow}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
              <Text style={styles.amountInfoText}>
                Maximum: {formatCurrency(maxContribution)} per tax year
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Account Number (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Number (Optional)</Text>
          <Text style={styles.helperText}>
            For your records only - helps track multiple accounts
          </Text>
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

        {/* Notes (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add any notes about this contribution..."
              placeholderTextColor={Colors.mediumGray}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </GlassCard>
        </View>

        {/* Lifetime ISA Bonus Preview */}
        {selectedType === ISA_TYPES.LIFETIME && parseFloat(amount) > 0 && (
          <GlassCard style={styles.bonusCard} intensity="dark">
            <LinearGradient
              colors={[Colors.success + 'DD', Colors.success + '88']}
              style={styles.bonusGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.bonusRow}>
                <Ionicons name="gift" size={28} color={Colors.white} />
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={styles.bonusTitle}>Government Bonus</Text>
                  <Text style={styles.bonusAmount}>
                    +{formatCurrency(parseFloat(amount) * 0.25)}
                  </Text>
                  <Text style={styles.bonusDesc}>
                    You'll receive a 25% bonus on this contribution!
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </GlassCard>
        )}

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSubmit}>
          <LinearGradient
            colors={Colors.goldGradient}
            style={styles.submitButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark-circle" size={24} color={Colors.deepNavy} />
            <Text style={styles.submitButtonText}>Add Contribution</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            resetForm();
            onClose();
          }}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  helperText: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  inputCard: {
    padding: Spacing.lg,
  },
  input: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  notesInput: {
    minHeight: 80,
  },
  // Enhanced Amount Section
  amountSection: {
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  amountHeaderText: {
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    flex: 1,
  },
  amountInputWrapper: {
    marginBottom: Spacing.md,
  },
  amountLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  amountInputCard: {
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.gold + '40',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: Typography.sizes.xxxl,
    color: Colors.gold,
    fontWeight: Typography.weights.extrabold,
    marginRight: Spacing.md,
  },
  amountInput: {
    flex: 1,
    fontSize: Typography.sizes.xxxl,
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
  },
  amountPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.gold + '20',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
  },
  amountPreviewLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    fontWeight: Typography.weights.semibold,
  },
  amountPreviewValue: {
    fontSize: Typography.sizes.xxl,
    color: Colors.gold,
    fontWeight: Typography.weights.extrabold,
  },
  amountInfo: {
    marginTop: Spacing.md,
  },
  amountInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  amountInfoText: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    flex: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  typeCardWrapper: {
    width: '48%',
  },
  typeCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    position: 'relative',
  },
  typeCardSelected: {
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  selectedBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    zIndex: 10,
  },
  typeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeName: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  typeRisk: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
  },
  detailsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  detailsTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  detailsDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  detailDivider: {
    width: 1,
    backgroundColor: Colors.glassLight,
    marginHorizontal: Spacing.md,
  },
  detailLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  bonusCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  bonusGradient: {
    padding: Spacing.lg,
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bonusTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  bonusAmount: {
    fontSize: Typography.sizes.xxl,
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
    marginBottom: 4,
  },
  bonusDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    opacity: 0.9,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  submitButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
  cancelButton: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    fontWeight: Typography.weights.semibold,
  },
});
