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
  calculateFlexibleISA,
  formatCurrency,
  FlexibleISAState,
} from '@/constants/isaData';

interface ISAAccount {
  id: string;
  providerName: string;
  isaType: string;
  currentBalance: number;
  contributionsThisYear: number;
  withdrawalsThisYear: number;
  interestRate?: number;
  openedDate: string;
}

interface ISAAccountsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ISAAccountsModal({ visible, onClose }: ISAAccountsModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [accounts, setAccounts] = useState<ISAAccount[]>([
    {
      id: '1',
      providerName: 'Barclays',
      isaType: ISA_TYPES.CASH,
      currentBalance: 8000,
      contributionsThisYear: 5000,
      withdrawalsThisYear: 0,
      interestRate: 4.5,
      openedDate: '2023-04-15',
    },
    {
      id: '2',
      providerName: 'Vanguard',
      isaType: ISA_TYPES.STOCKS_SHARES,
      currentBalance: 12000,
      contributionsThisYear: 8000,
      withdrawalsThisYear: 0,
      openedDate: '2022-06-20',
    },
    {
      id: '3',
      providerName: 'Moneybox',
      isaType: ISA_TYPES.LIFETIME,
      currentBalance: 6000,
      contributionsThisYear: 4000,
      withdrawalsThisYear: 0,
      openedDate: '2023-01-10',
    },
  ]);

  // Form state
  const [providerName, setProviderName] = useState('');
  const [selectedType, setSelectedType] = useState(ISA_TYPES.CASH);
  const [currentBalance, setCurrentBalance] = useState('');
  const [contributionsThisYear, setContributionsThisYear] = useState('');
  const [withdrawalsThisYear, setWithdrawalsThisYear] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [testDepositAmount, setTestDepositAmount] = useState('');
  const [flexibleResult, setFlexibleResult] = useState<any>(null);

  const resetForm = () => {
    setProviderName('');
    setSelectedType(ISA_TYPES.CASH);
    setCurrentBalance('');
    setContributionsThisYear('');
    setWithdrawalsThisYear('');
    setInterestRate('');
    setTestDepositAmount('');
    setFlexibleResult(null);
  };

  const handleAddAccount = () => {
    if (!providerName.trim()) {
      Alert.alert('Error', 'Please enter a provider name');
      return;
    }

    const balance = parseFloat(currentBalance) || 0;
    const contributions = parseFloat(contributionsThisYear) || 0;
    const withdrawals = parseFloat(withdrawalsThisYear) || 0;

    const newAccount: ISAAccount = {
      id: Date.now().toString(),
      providerName: providerName.trim(),
      isaType: selectedType,
      currentBalance: balance,
      contributionsThisYear: contributions,
      withdrawalsThisYear: withdrawals,
      interestRate: selectedType === ISA_TYPES.CASH ? parseFloat(interestRate) : undefined,
      openedDate: new Date().toISOString().split('T')[0],
    };

    setAccounts([...accounts, newAccount]);
    setShowAddForm(false);
    resetForm();
    Alert.alert('Success', 'ISA account added successfully!');
  };

  const calculateFlexible = () => {
    const contributions = parseFloat(contributionsThisYear) || 0;
    const withdrawals = parseFloat(withdrawalsThisYear) || 0;
    const deposit = parseFloat(testDepositAmount) || 0;

    if (deposit <= 0) {
      Alert.alert('Error', 'Please enter a valid deposit amount');
      return;
    }

    const state: FlexibleISAState = {
      annualAllowance: ISA_ANNUAL_ALLOWANCE,
      contributionsThisYear: contributions,
      withdrawalsThisYear: withdrawals,
    };

    const result = calculateFlexibleISA(state, deposit);
    setFlexibleResult(result);
  };

  const getTotalContributions = () => {
    return accounts.reduce((sum, acc) => sum + acc.contributionsThisYear, 0);
  };

  const getRemainingAllowance = () => {
    return ISA_ANNUAL_ALLOWANCE - getTotalContributions();
  };

  const handleDeleteAccount = (accountId: string, providerName: string) => {
    Alert.alert(
      'Delete ISA Account',
      `Are you sure you want to delete your ${providerName} ISA account? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAccounts(accounts.filter(acc => acc.id !== accountId));
            Alert.alert('Success', 'ISA account deleted successfully');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getISAIcon = (type: string) => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      [ISA_TYPES.CASH]: 'cash',
      [ISA_TYPES.STOCKS_SHARES]: 'trending-up',
      [ISA_TYPES.LIFETIME]: 'home',
      [ISA_TYPES.INNOVATIVE_FINANCE]: 'flash',
    };
    return iconMap[type] || 'wallet';
  };

  if (showAddForm) {
    return (
      <Modal
        visible={visible}
        onClose={() => {
          setShowAddForm(false);
          resetForm();
        }}
        title="Add ISA Account"
        icon="add-circle"
      >
        <View style={styles.formContainer}>
          {/* Provider Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Provider Name *</Text>
            <GlassCard style={styles.inputCard} intensity="medium">
              <TextInput
                style={styles.input}
                placeholder="e.g., Barclays, Vanguard, Moneybox"
                placeholderTextColor={Colors.mediumGray}
                value={providerName}
                onChangeText={setProviderName}
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
                      <Ionicons name={getISAIcon(type)} size={28} color={Colors.gold} />
                      <Text style={styles.typeName}>{info.shortName}</Text>
                      <Text style={styles.typeRisk}>{info.riskLevel} Risk</Text>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Current Balance */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Balance (£)</Text>
            <GlassCard style={styles.inputCard} intensity="medium">
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.mediumGray}
                value={currentBalance}
                onChangeText={setCurrentBalance}
                keyboardType="numeric"
              />
            </GlassCard>
          </View>

          {/* Contributions This Year */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contributions This Tax Year (£)</Text>
            <GlassCard style={styles.inputCard} intensity="medium">
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.mediumGray}
                value={contributionsThisYear}
                onChangeText={setContributionsThisYear}
                keyboardType="numeric"
              />
            </GlassCard>
          </View>

          {/* Withdrawals This Year (for Flexible ISA) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Withdrawals This Tax Year (£)</Text>
            <Text style={styles.helperText}>
              For Flexible ISAs only - you can replace withdrawn amounts
            </Text>
            <GlassCard style={styles.inputCard} intensity="medium">
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.mediumGray}
                value={withdrawalsThisYear}
                onChangeText={setWithdrawalsThisYear}
                keyboardType="numeric"
              />
            </GlassCard>
          </View>

          {/* Interest Rate (for Cash ISA only) */}
          {selectedType === ISA_TYPES.CASH && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Interest Rate (% AER)</Text>
              <GlassCard style={styles.inputCard} intensity="medium">
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 4.5"
                  placeholderTextColor={Colors.mediumGray}
                  value={interestRate}
                  onChangeText={setInterestRate}
                  keyboardType="numeric"
                />
              </GlassCard>
            </View>
          )}

          {/* Flexible ISA Calculator */}
          <GlassCard style={styles.calculatorCard} intensity="dark">
            <View style={styles.calculatorHeader}>
              <Ionicons name="calculator" size={24} color={Colors.gold} />
              <Text style={styles.calculatorTitle}>Flexible ISA Calculator</Text>
            </View>
            <Text style={styles.calculatorDesc}>
              Test if a future deposit will fit within your allowance
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Test Deposit Amount (£)</Text>
              <GlassCard style={styles.inputCard} intensity="medium">
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount to test"
                  placeholderTextColor={Colors.mediumGray}
                  value={testDepositAmount}
                  onChangeText={setTestDepositAmount}
                  keyboardType="numeric"
                />
              </GlassCard>
            </View>

            <TouchableOpacity onPress={calculateFlexible}>
              <LinearGradient
                colors={Colors.goldGradient}
                style={styles.calculateButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.calculateButtonText}>Calculate</Text>
              </LinearGradient>
            </TouchableOpacity>

            {flexibleResult && (
              <GlassCard style={styles.resultCard} intensity="medium">
                {flexibleResult.allowed ? (
                  <>
                    <View style={styles.resultHeader}>
                      <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
                      <Text style={styles.resultTitle}>Deposit Allowed!</Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Allocated to Replacement:</Text>
                      <Text style={styles.resultValue}>
                        {formatCurrency(flexibleResult.amountAllocatedToReplacement || 0)}
                      </Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Allocated to Unused:</Text>
                      <Text style={styles.resultValue}>
                        {formatCurrency(flexibleResult.amountAllocatedToUnused || 0)}
                      </Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Remaining Capacity:</Text>
                      <Text style={[styles.resultValue, { color: Colors.gold }]}>
                        {formatCurrency(flexibleResult.totalRemainingCapacity || 0)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.resultHeader}>
                      <Ionicons name="close-circle" size={32} color={Colors.error} />
                      <Text style={[styles.resultTitle, { color: Colors.error }]}>
                        Deposit Not Allowed
                      </Text>
                    </View>
                    <Text style={styles.errorMessage}>{flexibleResult.errorMessage}</Text>
                  </>
                )}
              </GlassCard>
            )}
          </GlassCard>

          {/* Add Button */}
          <TouchableOpacity onPress={handleAddAccount}>
            <LinearGradient
              colors={Colors.goldGradient}
              style={styles.addButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add-circle" size={24} color={Colors.deepNavy} />
              <Text style={styles.addButtonText}>Add ISA Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowAddForm(false);
              resetForm();
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Connected ISA Accounts"
      icon="wallet"
    >
      {/* Summary Card */}
      <GlassCard style={styles.summaryCard} intensity="dark">
        <LinearGradient
          colors={[Colors.deepNavy + 'DD', Colors.mediumNavy + 'AA']}
          style={styles.summaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Contributed</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(getTotalContributions())}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Remaining Allowance</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                {formatCurrency(getRemainingAllowance())}
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={Colors.goldGradient}
              style={[
                styles.progressFill,
                { width: `${(getTotalContributions() / ISA_ANNUAL_ALLOWANCE) * 100}%` },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.allowanceText}>
            {formatCurrency(ISA_ANNUAL_ALLOWANCE)} Annual Allowance
          </Text>
        </LinearGradient>
      </GlassCard>

      {/* Accounts List */}
      <Text style={styles.sectionTitle}>Your ISA Accounts ({accounts.length})</Text>

      {accounts.map((account) => {
        const info = ISA_INFO[account.isaType];
        return (
          <GlassCard key={account.id} style={styles.accountCard} intensity="medium">
            <View style={styles.accountHeader}>
              <View style={styles.accountLeft}>
                <View style={[styles.accountIcon, { backgroundColor: info.color + '30' }]}>
                  <Ionicons
                    name={getISAIcon(account.isaType)}
                    size={24}
                    color={info.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.accountProvider}>{account.providerName}</Text>
                  <Text style={styles.accountType}>{info.name}</Text>
                </View>
              </View>
              <View style={styles.accountRight}>
                <Text style={styles.accountBalance}>
                  {formatCurrency(account.currentBalance)}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteAccount(account.id, account.providerName)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.accountDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Contributed This Year:</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(account.contributionsThisYear)}
                </Text>
              </View>
              {account.withdrawalsThisYear > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Withdrawals:</Text>
                  <Text style={[styles.detailValue, { color: Colors.warning }]}>
                    {formatCurrency(account.withdrawalsThisYear)}
                  </Text>
                </View>
              )}
              {account.interestRate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Interest Rate:</Text>
                  <Text style={[styles.detailValue, { color: Colors.success }]}>
                    {account.interestRate}% AER
                  </Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Opened:</Text>
                <Text style={styles.detailValue}>
                  {new Date(account.openedDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </GlassCard>
        );
      })}

      {/* Add New Account Button */}
      <TouchableOpacity onPress={() => setShowAddForm(true)}>
        <LinearGradient
          colors={Colors.goldGradient}
          style={styles.addNewButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="add-circle" size={24} color={Colors.deepNavy} />
          <Text style={styles.addNewButtonText}>Add New ISA Account</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginBottom: Spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: Typography.sizes.xl,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.glassLight,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.glassLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
  },
  allowanceText: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  accountCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassLight,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountRight: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  deleteButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.error + '20',
  },
  accountIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  accountProvider: {
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  accountType: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginTop: 2,
  },
  accountBalance: {
    fontSize: Typography.sizes.xl,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
  },
  accountDetails: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },
  detailValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  addNewButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
  formContainer: {
    gap: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
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
  },
  inputCard: {
    padding: Spacing.md,
  },
  input: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeCardWrapper: {
    width: '48%',
  },
  typeCard: {
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
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
  calculatorCard: {
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  calculatorTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
  },
  calculatorDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginBottom: Spacing.md,
  },
  calculateButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  calculateButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
  resultCard: {
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.success,
    fontWeight: Typography.weights.bold,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  resultLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },
  resultValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  errorMessage: {
    fontSize: Typography.sizes.sm,
    color: Colors.error,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  addButtonText: {
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
