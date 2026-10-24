import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from './Modal';
import { Input, Button, Card, Badge } from '@/components/ui';
import { Colors, Spacing, Type } from '@/constants/theme';
import { ISA_ANNUAL_ALLOWANCE, formatCurrency, calculateFlexibleISA, FlexibleISAResult } from '@/constants/isaData';

interface FlexibleCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  currentContributions?: number;
}

function Figure({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <View style={styles.figureRow}>
      <Text style={styles.figureLabel}>{label}</Text>
      <Text style={[styles.figureValue, muted && { color: Colors.textSecondary }]}>{value}</Text>
    </View>
  );
}

export default function FlexibleCalculatorModal({ visible, onClose, currentContributions = 0 }: FlexibleCalculatorModalProps) {
  const [withdrawals, setWithdrawals] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [calcResult, setCalcResult] = useState<FlexibleISAResult | null>(null);

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

  // A result only describes the inputs it was calculated from
  const onEdit = (setter: (v: string) => void) => (text: string) => {
    setter(text.replace(/[^0-9.]/g, ''));
    setCalcResult(null);
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Flexible ISA calculator"
      subtitle="Flexible ISAs let you withdraw and replace money in the same tax year without losing your allowance."
      footer={<Button title="Calculate" onPress={handleCalculate} />}
    >
      {/* Current state */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={Type.overline}>Annual allowance</Text>
          <Text style={styles.summaryValue}>{formatCurrency(ISA_ANNUAL_ALLOWANCE)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={Type.overline}>Contributed</Text>
          <Text style={styles.summaryValue}>{formatCurrency(currentContributions)}</Text>
        </View>
      </View>

      {/* Inputs */}
      <View style={styles.fields}>
        <Input
          label="Withdrawals this year"
          icon="arrow-up-circle-outline"
          value={withdrawals}
          onChangeText={onEdit(setWithdrawals)}
          keyboardType="decimal-pad"
          placeholder="£0"
          hint="Money you've taken out of a flexible ISA this tax year"
        />
        <Input
          label="Deposit amount"
          icon="arrow-down-circle-outline"
          value={depositAmount}
          onChangeText={onEdit(setDepositAmount)}
          keyboardType="decimal-pad"
          placeholder="£0"
          hint="How much you'd like to pay in"
          returnKeyType="done"
          onSubmitEditing={handleCalculate}
        />
      </View>

      {/* Result */}
      {calcResult && (
        <Card style={styles.result}>
          <Badge
            label={calcResult.allowed ? 'Deposit allowed' : 'Deposit not allowed'}
            tone={calcResult.allowed ? 'positive' : 'negative'}
          />

          {!calcResult.allowed && calcResult.errorMessage ? (
            <Text style={styles.resultMessage}>{calcResult.errorMessage}</Text>
          ) : null}

          {calcResult.allowed && (
            <>
              <Text style={styles.keyLabel}>Remaining capacity after deposit</Text>
              <Text style={styles.keyValue}>{formatCurrency(calcResult.totalRemainingCapacity!)}</Text>

              <View style={styles.divider} />
              <Text style={styles.groupTitle}>Deposit uses</Text>
              {calcResult.amountAllocatedToReplacement! > 0 && (
                <Figure label="Replacement allowance" value={formatCurrency(calcResult.amountAllocatedToReplacement!)} />
              )}
              {calcResult.amountAllocatedToUnused! > 0 && (
                <Figure label="Unused allowance" value={formatCurrency(calcResult.amountAllocatedToUnused!)} />
              )}

              <View style={styles.divider} />
              <Text style={styles.groupTitle}>After deposit</Text>
              <Figure label="Total contributed" value={formatCurrency(calcResult.updatedContributions!)} />
              <Figure label="Unused allowance" value={formatCurrency(calcResult.unusedAllowance!)} muted />
              <Figure label="Replacement allowance" value={formatCurrency(calcResult.replacementAllowance!)} muted />
            </>
          )}
        </Card>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
    marginTop: Spacing.sm,
  },
  summaryItem: {
    flex: 1,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: Colors.borderStrong,
    marginHorizontal: Spacing.md,
  },
  summaryValue: {
    ...Type.headline,
    ...Type.number,
    marginTop: 4,
  },
  fields: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  result: {
    marginTop: Spacing.lg,
  },
  resultMessage: {
    ...Type.body,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  keyLabel: {
    ...Type.caption,
    marginTop: Spacing.md,
  },
  keyValue: {
    ...Type.title1,
    ...Type.number,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderStrong,
    marginVertical: Spacing.md,
  },
  groupTitle: {
    ...Type.overline,
    marginBottom: 4,
  },
  figureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 6,
  },
  figureLabel: {
    ...Type.callout,
    flex: 1,
    marginRight: 12,
  },
  figureValue: {
    ...Type.bodyStrong,
    ...Type.number,
  },
});
