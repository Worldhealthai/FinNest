import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from './Modal';
import { Button, IconTile, Input } from '@/components/ui';
import { Colors, Spacing, Type } from '@/constants/theme';
import { ISA_LABELS, ISA_ICONS, isaColor } from '@/constants/isaData';
import {
  getAvailableTaxYears,
  getTaxYearFromDate,
  isDateInTaxYear,
  formatDateKey,
  parseDateKey,
  type TaxYear,
} from '@/utils/taxYear';
import { haptics } from '@/utils/haptics';
import {
  ISAContribution,
  ContributionAmountFields,
  getContributionAmountError,
  formatAmount,
} from './AddISAContributionModal';

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
  const [amount, setAmount] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const [notes, setNotes] = useState('');
  const [contributionDate, setContributionDate] = useState(new Date());
  const [availableTaxYears] = useState<TaxYear[]>(() => getAvailableTaxYears(5, 1)); // 5 previous + 1 future year
  const [selectedTaxYear, setSelectedTaxYear] = useState<TaxYear>(() => getTaxYearFromDate(new Date()));
  // Keep showing the last contribution while the sheet slides closed (the
  // parent clears `contribution` in the same tick as it hides the sheet).
  const [shown, setShown] = useState<ISAContribution | null>(contribution);

  // Load form values when the modal opens or the contribution changes
  useEffect(() => {
    if (visible && contribution) {
      setShown(contribution);
      setAmount(contribution.amount.toString());
      setAmountTouched(false);
      setNotes(contribution.notes || '');
      const date = parseDateKey(contribution.date);
      setContributionDate(date);
      setSelectedTaxYear(getTaxYearFromDate(date));
    }
  }, [visible, contribution]);

  if (!shown) return null;

  // Validated against the cap for this contribution's ISA type
  // (£4,000 for a Lifetime ISA, £20,000 otherwise)
  const amountError = getContributionAmountError(amount, shown.isaType);
  const visibleAmountError = amountTouched ? amountError : null;
  const newAmount = amountError ? null : Number(amount);
  const amountChanged = newAmount !== null && newAmount !== shown.amount;

  const selectTaxYear = (year: TaxYear) => {
    setSelectedTaxYear(year);
    // Keep the original date if it's in the chosen tax year, otherwise use
    // that year's first day so the date always sits inside it.
    const original = parseDateKey(shown.date);
    setContributionDate(isDateInTaxYear(original, year) ? original : year.startDate);
  };

  const handleSave = () => {
    if (amountError) return;

    const updated: ISAContribution = {
      ...shown,
      amount: Number(amount),
      date: formatDateKey(contributionDate),
      notes: notes.trim() || undefined,
    };

    onUpdate?.(updated);
    haptics.success();
    onClose();
  };

  const footer = <Button title="Save changes" onPress={handleSave} disabled={!!amountError} />;

  return (
    <Modal visible={visible} onClose={onClose} title="Edit contribution" footer={footer}>
      <View style={styles.context}>
        <IconTile name={ISA_ICONS[shown.isaType] ?? 'wallet-outline'} color={isaColor(shown.isaType)} size={28} />
        <Text style={styles.contextText} numberOfLines={1}>
          {shown.provider} · {ISA_LABELS[shown.isaType] ?? shown.isaType}
        </Text>
      </View>

      <ContributionAmountFields
        amount={amount}
        onChangeAmount={(value) => {
          setAmount(value);
          setAmountTouched(true);
        }}
        isaType={shown.isaType}
        error={visibleAmountError}
        hint={amountChanged ? `Previously ${formatAmount(shown.amount)}` : undefined}
        taxYears={availableTaxYears}
        selectedTaxYear={selectedTaxYear}
        onSelectTaxYear={selectTaxYear}
      />

      <Input
        label="Notes (optional)"
        placeholder="e.g. Monthly transfer"
        value={notes}
        onChangeText={setNotes}
        maxLength={200}
        returnKeyType="done"
        containerStyle={styles.notes}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  context: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: Spacing.xs,
  },
  contextText: {
    ...Type.callout,
    color: Colors.text,
    flexShrink: 1,
  },
  notes: {
    marginTop: Spacing.lg,
  },
});
