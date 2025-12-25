import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { ISA_ANNUAL_ALLOWANCE, formatCurrency, calculateFlexibleISA } from '@/constants/isaData';
import GlassCard from './GlassCard';

interface FlexibleCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  currentContributions?: number;
}

export default function FlexibleCalculatorModal({ visible, onClose, currentContributions = 0 }: FlexibleCalculatorModalProps) {
  const [withdrawals, setWithdrawals] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [calcResult, setCalcResult] = useState<any>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setWithdrawals('');
      setDepositAmount('');
      setCalcResult(null);
    }
  }, [visible]);

  const handleCalculate = () => {
    const result = calculateFlexibleISA(
      {
        annualAllowance: ISA_ANNUAL_ALLOWANCE,
        contributionsThisYear: currentContributions,
        withdrawalsThisYear: parseFloat(withdrawals) || 0,
      },
      parseFloat(depositAmount) || 0
    );
    setCalcResult(result);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[Colors.deepNavy, Colors.navyBlue]}
              style={styles.gradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Ionicons name="calculator" size={28} color={Colors.info} />
                  <Text style={styles.title}>Flexible ISA Calculator</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color={Colors.white} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Info */}
                <Text style={styles.infoText}>
                  Flexible ISAs let you withdraw and replace money in the same tax year without losing your allowance.
                </Text>

                {/* Current State */}
                <GlassCard style={styles.card} intensity="medium">
                  <View style={styles.row}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Annual Allowance</Text>
                      <Text style={styles.statValue}>{formatCurrency(ISA_ANNUAL_ALLOWANCE)}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Contributed</Text>
                      <Text style={[styles.statValue, { color: Colors.gold }]}>
                        {formatCurrency(currentContributions)}
                      </Text>
                    </View>
                  </View>
                </GlassCard>

                {/* Input: Withdrawals */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Withdrawals This Year (£)</Text>
                  <TextInput
                    style={styles.input}
                    value={withdrawals}
                    onChangeText={setWithdrawals}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.mediumGray}
                  />
                </View>

                {/* Input: Deposit Amount */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Deposit Amount (£)</Text>
                  <TextInput
                    style={styles.input}
                    value={depositAmount}
                    onChangeText={setDepositAmount}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.mediumGray}
                  />
                </View>

                {/* Calculate Button */}
                <TouchableOpacity onPress={handleCalculate} style={styles.calcButton}>
                  <LinearGradient
                    colors={Colors.goldGradient}
                    style={styles.calcButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="checkmark-circle" size={20} color={Colors.deepNavy} />
                    <Text style={styles.calcButtonText}>Calculate Deposit</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Results */}
                {calcResult && (
                  <GlassCard
                    style={[
                      styles.resultCard,
                      { backgroundColor: calcResult.allowed ? Colors.success + '20' : Colors.error + '20' }
                    ]}
                    intensity="dark"
                  >
                    <View style={styles.row}>
                      <Ionicons
                        name={calcResult.allowed ? 'checkmark-circle' : 'close-circle'}
                        size={24}
                        color={calcResult.allowed ? Colors.success : Colors.error}
                      />
                      <Text
                        style={[
                          styles.resultTitle,
                          { marginLeft: 12, color: calcResult.allowed ? Colors.success : Colors.error }
                        ]}
                      >
                        {calcResult.allowed ? 'Deposit Allowed' : 'Deposit Not Allowed'}
                      </Text>
                    </View>

                    {calcResult.errorMessage && (
                      <Text style={[styles.infoText, { marginTop: 8, color: Colors.error }]}>
                        {calcResult.errorMessage}
                      </Text>
                    )}

                    {calcResult.allowed && (
                      <>
                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>Allocation Breakdown:</Text>
                        {calcResult.amountAllocatedToReplacement! > 0 && (
                          <View style={[styles.row, { justifyContent: 'space-between', marginTop: 8 }]}>
                            <Text style={styles.infoText}>From Replacement Allowance:</Text>
                            <Text style={[styles.valueText, { color: Colors.info }]}>
                              {formatCurrency(calcResult.amountAllocatedToReplacement!)}
                            </Text>
                          </View>
                        )}
                        {calcResult.amountAllocatedToUnused! > 0 && (
                          <View style={[styles.row, { justifyContent: 'space-between', marginTop: 4 }]}>
                            <Text style={styles.infoText}>From Unused Allowance:</Text>
                            <Text style={[styles.valueText, { color: Colors.gold }]}>
                              {formatCurrency(calcResult.amountAllocatedToUnused!)}
                            </Text>
                          </View>
                        )}

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>After Deposit:</Text>
                        <View style={styles.row}>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Total Contributed</Text>
                            <Text style={[styles.statValue, { color: Colors.gold }]}>
                              {formatCurrency(calcResult.updatedContributions!)}
                            </Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Remaining Capacity</Text>
                            <Text style={[styles.statValue, { color: Colors.success }]}>
                              {formatCurrency(calcResult.totalRemainingCapacity!)}
                            </Text>
                          </View>
                        </View>

                        <View style={[styles.row, { justifyContent: 'space-between', marginTop: 12 }]}>
                          <Text style={styles.infoText}>Unused Allowance:</Text>
                          <Text style={styles.valueText}>{formatCurrency(calcResult.unusedAllowance!)}</Text>
                        </View>
                        <View style={[styles.row, { justifyContent: 'space-between', marginTop: 4 }]}>
                          <Text style={styles.infoText}>Replacement Allowance:</Text>
                          <Text style={styles.valueText}>{formatCurrency(calcResult.replacementAllowance!)}</Text>
                        </View>
                      </>
                    )}
                  </GlassCard>
                )}

                <View style={{ height: 40 }} />
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    paddingTop: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    color: Colors.white,
    fontWeight: Typography.weights.extrabold,
    marginLeft: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    maxHeight: 600,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  infoText: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: Typography.sizes.xl,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: Colors.glassLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  calcButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  calcButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  calcButtonText: {
    fontSize: Typography.sizes.lg,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
  resultCard: {
    padding: Spacing.lg,
  },
  resultTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginTop: 12,
    marginBottom: 4,
  },
  valueText: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.glassLight,
    marginVertical: Spacing.md,
  },
});
