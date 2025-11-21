import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlassCard from '@/components/GlassCard';
import AddISAContributionModal, { ISAContribution } from '@/components/AddISAContributionModal';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { ISA_INFO, ISA_ANNUAL_ALLOWANCE, LIFETIME_ISA_MAX, getDaysUntilTaxYearEnd, formatCurrency, getTaxYearDates, calculateFlexibleISA } from '@/constants/isaData';

const CONTRIBUTIONS_STORAGE_KEY = '@finnest_contributions';

// Helper to group contributions by ISA type and provider
const groupContributions = (contributions: ISAContribution[]) => {
  const grouped: Record<string, { providers: Record<string, { contributed: number; balance: number }>, total: number }> = {
    cash: { providers: {}, total: 0 },
    stocks_shares: { providers: {}, total: 0 },
    lifetime: { providers: {}, total: 0 },
    innovative_finance: { providers: {}, total: 0 },
  };

  contributions.forEach(contribution => {
    const type = contribution.isaType;
    if (!grouped[type].providers[contribution.provider]) {
      grouped[type].providers[contribution.provider] = { contributed: 0, balance: 0 };
    }
    grouped[type].providers[contribution.provider].contributed += contribution.amount;
    grouped[type].providers[contribution.provider].balance += contribution.amount;
    grouped[type].total += contribution.amount;
  });

  return grouped;
};

export default function DashboardScreen() {
  const [contributions, setContributions] = useState<ISAContribution[]>([]);
  const [expandedISA, setExpandedISA] = useState<string | null>(null);

  const groupedISAs = groupContributions(contributions);
  const total = Object.values(groupedISAs).reduce((s, i) => s + i.total, 0);
  const remaining = ISA_ANNUAL_ALLOWANCE - total;
  const days = getDaysUntilTaxYearEnd();
  const taxYear = getTaxYearDates();
  const percent = (total / ISA_ANNUAL_ALLOWANCE) * 100;
  const lisaBonus = groupedISAs.lifetime.total * 0.25;

  // Modal state
  const [addContributionVisible, setAddContributionVisible] = useState(false);

  // Flexible ISA Calculator State
  const [withdrawals, setWithdrawals] = useState('2000');
  const [depositAmount, setDepositAmount] = useState('5000');
  const [calcResult, setCalcResult] = useState<any>(null);

  // Load saved ISA data on mount
  useEffect(() => {
    loadISAData();
  }, []);

  const loadISAData = async () => {
    try {
      console.log('Loading contributions from AsyncStorage...');
      const savedData = await AsyncStorage.getItem(CONTRIBUTIONS_STORAGE_KEY);
      console.log('Saved data:', savedData);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log('Parsed contributions:', parsed);
        setContributions(parsed);
        console.log('Contributions loaded successfully');
      } else {
        console.log('No saved contributions found');
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
    }
  };

  const saveContributions = async (contributionsData: ISAContribution[]) => {
    try {
      console.log('Saving contributions to AsyncStorage:', contributionsData);
      await AsyncStorage.setItem(CONTRIBUTIONS_STORAGE_KEY, JSON.stringify(contributionsData));
      console.log('Contributions saved successfully');
    } catch (error) {
      console.error('Error saving contributions:', error);
    }
  };

  const handleCalculate = () => {
    const result = calculateFlexibleISA(
      {
        annualAllowance: ISA_ANNUAL_ALLOWANCE,
        contributionsThisYear: total,
        withdrawalsThisYear: parseFloat(withdrawals) || 0,
      },
      parseFloat(depositAmount) || 0
    );
    setCalcResult(result);
  };

  const handleAddContribution = (contribution: ISAContribution) => {
    console.log('=== handleAddContribution called ===');
    console.log('Contribution received:', contribution);

    // Add new contribution to the array
    const updatedContributions = [...contributions, contribution];

    setContributions(updatedContributions);
    saveContributions(updatedContributions);

    // Calculate new total for this ISA type
    const newGrouped = groupContributions(updatedContributions);
    const newTotal = newGrouped[contribution.isaType].total;

    // Show alert to confirm
    Alert.alert(
      'Contribution Added!',
      `${formatCurrency(contribution.amount)} added to ${ISA_INFO[contribution.isaType].name} with ${contribution.provider}\n\nNew ${ISA_INFO[contribution.isaType].shortName} total: ${formatCurrency(newTotal)}`,
      [{ text: 'OK' }]
    );

    console.log('Contribution added successfully');
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>ISA Dashboard</Text>
              <Text style={styles.year}>{taxYear.start.getFullYear()}/{taxYear.end.getFullYear()} Tax Year</Text>
            </View>
            <Image source={require('@/assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>

          {days <= 30 && (
            <GlassCard style={styles.card} intensity="dark">
              <View style={styles.row}>
                <Ionicons name="warning" size={24} color={Colors.warning} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.warn}>Tax Year Ends in {days} Days!</Text>
                  <Text style={styles.sub}>Use your {formatCurrency(remaining)} allowance</Text>
                </View>
              </View>
            </GlassCard>
          )}

          <GlassCard style={styles.card} intensity="dark">
            <Text style={styles.label}>Annual ISA Allowance</Text>
            <Text style={styles.big}>{formatCurrency(ISA_ANNUAL_ALLOWANCE)}</Text>
            <View style={styles.bar}>
              <LinearGradient colors={Colors.goldGradient} style={{ width: `${percent}%`, height: '100%', borderRadius: 6 }} />
            </View>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Used</Text>
                <Text style={styles.statVal}>{formatCurrency(total)}</Text>
                <Text style={styles.statPer}>{percent.toFixed(0)}%</Text>
              </View>
              <View style={styles.div} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Left</Text>
                <Text style={styles.statVal}>{formatCurrency(remaining)}</Text>
                <Text style={styles.statPer}>{(100 - percent).toFixed(0)}%</Text>
              </View>
              <View style={styles.div} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Days</Text>
                <Text style={styles.statVal}>{days}</Text>
                <Text style={styles.statPer}>left</Text>
              </View>
            </View>
          </GlassCard>

          <Text style={styles.section}>My ISAs</Text>

          {/* Cash ISA */}
          <Pressable onPress={() => setExpandedISA(expandedISA === 'cash' ? null : 'cash')} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
            <GlassCard style={styles.card} intensity="medium">
              <View style={styles.row}>
                <View style={[styles.icon, { backgroundColor: ISA_INFO.cash.color + '30' }]}>
                  <Ionicons name="cash" size={24} color={ISA_INFO.cash.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>Cash ISA</Text>
                  <Text style={styles.sub}>
                    {Object.keys(groupedISAs.cash.providers).length > 0
                      ? `${Object.keys(groupedISAs.cash.providers).length} provider${Object.keys(groupedISAs.cash.providers).length > 1 ? 's' : ''} • Low Risk`
                      : 'No contributions yet'}
                  </Text>
                </View>
                <Ionicons name={expandedISA === 'cash' ? "chevron-up" : "chevron-down"} size={20} color={Colors.lightGray} />
              </View>
              <View style={[styles.row, { marginTop: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sub}>Total Contributed</Text>
                  <Text style={styles.val}>{formatCurrency(groupedISAs.cash.total)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sub}>Balance</Text>
                  <Text style={[styles.val, { color: Colors.success }]}>{formatCurrency(groupedISAs.cash.total)}</Text>
                </View>
              </View>

              {expandedISA === 'cash' && Object.keys(groupedISAs.cash.providers).length > 0 && (
                <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.glassLight }}>
                  <Text style={[styles.sub, { marginBottom: 12, fontWeight: '600' }]}>Providers:</Text>
                  {Object.entries(groupedISAs.cash.providers).map(([provider, data]) => (
                    <View key={provider} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingLeft: 12 }}>
                      <Text style={styles.sub}>• {provider}</Text>
                      <Text style={styles.val}>{formatCurrency(data.contributed)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>
          </Pressable>

          {/* Stocks & Shares ISA */}
          <Pressable onPress={() => setExpandedISA(expandedISA === 'stocks_shares' ? null : 'stocks_shares')} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
            <GlassCard style={styles.card} intensity="medium">
              <View style={styles.row}>
                <View style={[styles.icon, { backgroundColor: ISA_INFO.stocks_shares.color + '30' }]}>
                  <Ionicons name="trending-up" size={24} color={ISA_INFO.stocks_shares.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>Stocks & Shares ISA</Text>
                  <Text style={styles.sub}>
                    {Object.keys(groupedISAs.stocks_shares.providers).length > 0
                      ? `${Object.keys(groupedISAs.stocks_shares.providers).length} provider${Object.keys(groupedISAs.stocks_shares.providers).length > 1 ? 's' : ''} • Medium Risk`
                      : 'No contributions yet'}
                  </Text>
                </View>
                <Ionicons name={expandedISA === 'stocks_shares' ? "chevron-up" : "chevron-down"} size={20} color={Colors.lightGray} />
              </View>
              <View style={[styles.row, { marginTop: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sub}>Total Contributed</Text>
                  <Text style={styles.val}>{formatCurrency(groupedISAs.stocks_shares.total)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sub}>Balance</Text>
                  <Text style={[styles.val, { color: Colors.success }]}>{formatCurrency(groupedISAs.stocks_shares.total)}</Text>
                </View>
              </View>

              {expandedISA === 'stocks_shares' && Object.keys(groupedISAs.stocks_shares.providers).length > 0 && (
                <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.glassLight }}>
                  <Text style={[styles.sub, { marginBottom: 12, fontWeight: '600' }]}>Providers:</Text>
                  {Object.entries(groupedISAs.stocks_shares.providers).map(([provider, data]) => (
                    <View key={provider} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingLeft: 12 }}>
                      <Text style={styles.sub}>• {provider}</Text>
                      <Text style={styles.val}>{formatCurrency(data.contributed)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>
          </Pressable>

          {/* Lifetime ISA */}
          <Pressable onPress={() => setExpandedISA(expandedISA === 'lifetime' ? null : 'lifetime')} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
            <GlassCard style={styles.card} intensity="medium">
              <View style={styles.row}>
                <View style={[styles.icon, { backgroundColor: ISA_INFO.lifetime.color + '30' }]}>
                  <Ionicons name="home" size={24} color={ISA_INFO.lifetime.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>Lifetime ISA</Text>
                  <Text style={styles.sub}>
                    {Object.keys(groupedISAs.lifetime.providers).length > 0
                      ? `${Object.keys(groupedISAs.lifetime.providers).length} provider${Object.keys(groupedISAs.lifetime.providers).length > 1 ? 's' : ''} • 25% Gov Bonus`
                      : 'No contributions yet'}
                  </Text>
                </View>
                <Ionicons name={expandedISA === 'lifetime' ? "chevron-up" : "chevron-down"} size={20} color={Colors.lightGray} />
              </View>
              <View style={[styles.row, { marginTop: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sub}>Total Contributed</Text>
                  <Text style={styles.val}>{formatCurrency(groupedISAs.lifetime.total)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sub}>Gov Bonus</Text>
                  <Text style={[styles.val, { color: ISA_INFO.lifetime.color }]}>+{formatCurrency(lisaBonus)}</Text>
                </View>
              </View>
              <View style={[styles.bar, { marginTop: 12, height: 4 }]}>
                <View style={{ width: `${(groupedISAs.lifetime.total / LIFETIME_ISA_MAX) * 100}%`, height: '100%', backgroundColor: ISA_INFO.lifetime.color, borderRadius: 2 }} />
              </View>
              <Text style={[styles.sub, { marginTop: 4 }]}>{formatCurrency(LIFETIME_ISA_MAX - groupedISAs.lifetime.total)} left for max bonus</Text>

              {expandedISA === 'lifetime' && Object.keys(groupedISAs.lifetime.providers).length > 0 && (
                <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.glassLight }}>
                  <Text style={[styles.sub, { marginBottom: 12, fontWeight: '600' }]}>Providers:</Text>
                  {Object.entries(groupedISAs.lifetime.providers).map(([provider, data]) => (
                    <View key={provider} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingLeft: 12 }}>
                      <Text style={styles.sub}>• {provider}</Text>
                      <Text style={styles.val}>{formatCurrency(data.contributed)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>
          </Pressable>

          <Pressable
            onPress={() => setAddContributionVisible(true)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <GlassCard style={styles.card} intensity="light">
              <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Ionicons name="add-circle" size={32} color={Colors.gold} />
                <Text style={[styles.name, { marginTop: 8 }]}>Add ISA Contribution</Text>
                <Text style={styles.sub}>Track contributions from any provider</Text>
              </View>
            </GlassCard>
          </Pressable>

          <GlassCard style={[styles.card, { marginTop: 16 }]} intensity="dark">
            <View style={styles.row}>
              <Ionicons name="bulb" size={24} color={Colors.gold} />
              <Text style={[styles.name, { marginLeft: 12 }]}>Quick Tip</Text>
            </View>
            <Text style={[styles.sub, { marginTop: 8, lineHeight: 20 }]}>
              Contribute the remaining {formatCurrency(LIFETIME_ISA_MAX - groupedISAs.lifetime.total)} to your LISA before tax year end to get {formatCurrency((LIFETIME_ISA_MAX - groupedISAs.lifetime.total) * 0.25)} free government bonus!
            </Text>
          </GlassCard>

          <Text style={styles.section}>Flexible ISA Calculator</Text>

          <GlassCard style={styles.card} intensity="dark">
            <View style={styles.row}>
              <Ionicons name="calculator" size={24} color={Colors.info} />
              <Text style={[styles.name, { marginLeft: 12 }]}>Check Your Deposit Capacity</Text>
            </View>
            <Text style={[styles.sub, { marginTop: 8, lineHeight: 20, marginBottom: 16 }]}>
              Flexible ISAs let you withdraw and replace money in the same tax year without losing your allowance.
            </Text>

            {/* Current State */}
            <View style={styles.calcRow}>
              <View style={styles.calcItem}>
                <Text style={styles.calcLabel}>Annual Allowance</Text>
                <Text style={styles.calcValue}>{formatCurrency(ISA_ANNUAL_ALLOWANCE)}</Text>
              </View>
              <View style={styles.calcItem}>
                <Text style={styles.calcLabel}>Contributed</Text>
                <Text style={[styles.calcValue, { color: Colors.gold }]}>{formatCurrency(total)}</Text>
              </View>
            </View>

            {/* Input: Withdrawals */}
            <View style={{ marginTop: 16 }}>
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
            <View style={{ marginTop: 12 }}>
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
              <View style={[styles.resultCard, { backgroundColor: calcResult.allowed ? Colors.success + '20' : Colors.error + '20', marginTop: 16 }]}>
                <View style={styles.row}>
                  <Ionicons name={calcResult.allowed ? 'checkmark-circle' : 'close-circle'} size={24} color={calcResult.allowed ? Colors.success : Colors.error} />
                  <Text style={[styles.name, { marginLeft: 12, color: calcResult.allowed ? Colors.success : Colors.error }]}>
                    {calcResult.allowed ? 'Deposit Allowed' : 'Deposit Not Allowed'}
                  </Text>
                </View>

                {calcResult.errorMessage && (
                  <Text style={[styles.sub, { marginTop: 8, color: Colors.error }]}>
                    {calcResult.errorMessage}
                  </Text>
                )}

                {calcResult.allowed && (
                  <>
                    <View style={styles.divider} />

                    <Text style={[styles.resultTitle, { marginTop: 12 }]}>Allocation Breakdown:</Text>
                    {calcResult.amountAllocatedToReplacement! > 0 && (
                      <View style={[styles.row, { justifyContent: 'space-between', marginTop: 8 }]}>
                        <Text style={styles.sub}>From Replacement Allowance:</Text>
                        <Text style={[styles.val, { color: Colors.info }]}>{formatCurrency(calcResult.amountAllocatedToReplacement!)}</Text>
                      </View>
                    )}
                    {calcResult.amountAllocatedToUnused! > 0 && (
                      <View style={[styles.row, { justifyContent: 'space-between', marginTop: 4 }]}>
                        <Text style={styles.sub}>From Unused Allowance:</Text>
                        <Text style={[styles.val, { color: Colors.gold }]}>{formatCurrency(calcResult.amountAllocatedToUnused!)}</Text>
                      </View>
                    )}

                    <View style={styles.divider} />

                    <Text style={[styles.resultTitle, { marginTop: 12 }]}>After Deposit:</Text>
                    <View style={styles.calcRow}>
                      <View style={styles.calcItem}>
                        <Text style={styles.calcLabel}>Total Contributed</Text>
                        <Text style={[styles.calcValue, { color: Colors.gold }]}>{formatCurrency(calcResult.updatedContributions!)}</Text>
                      </View>
                      <View style={styles.calcItem}>
                        <Text style={styles.calcLabel}>Remaining Capacity</Text>
                        <Text style={[styles.calcValue, { color: Colors.success }]}>{formatCurrency(calcResult.totalRemainingCapacity!)}</Text>
                      </View>
                    </View>

                    <View style={[styles.row, { justifyContent: 'space-between', marginTop: 12 }]}>
                      <Text style={styles.sub}>Unused Allowance:</Text>
                      <Text style={styles.val}>{formatCurrency(calcResult.unusedAllowance!)}</Text>
                    </View>
                    <View style={[styles.row, { justifyContent: 'space-between', marginTop: 4 }]}>
                      <Text style={styles.sub}>Replacement Allowance:</Text>
                      <Text style={styles.val}>{formatCurrency(calcResult.replacementAllowance!)}</Text>
                    </View>
                  </>
                )}
              </View>
            )}
          </GlassCard>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Add ISA Contribution Modal */}
      <AddISAContributionModal
        visible={addContributionVisible}
        onClose={() => setAddContributionVisible(false)}
        onAdd={handleAddContribution}
        currentISAs={{
          cash: {
            contributed: groupedISAs.cash.total,
            balance: groupedISAs.cash.total,
            provider: Object.keys(groupedISAs.cash.providers)[0] || 'None',
          },
          stocks_shares: {
            contributed: groupedISAs.stocks_shares.total,
            balance: groupedISAs.stocks_shares.total,
            provider: Object.keys(groupedISAs.stocks_shares.providers)[0] || 'None',
          },
          lifetime: {
            contributed: groupedISAs.lifetime.total,
            balance: groupedISAs.lifetime.total,
            provider: Object.keys(groupedISAs.lifetime.providers)[0] || 'None',
          },
          innovative_finance: {
            contributed: groupedISAs.innovative_finance.total,
            balance: groupedISAs.innovative_finance.total,
            provider: Object.keys(groupedISAs.innovative_finance.providers)[0] || 'None',
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  title: { fontSize: Typography.sizes.xxl, color: Colors.white, fontWeight: Typography.weights.bold },
  year: { fontSize: Typography.sizes.sm, color: Colors.gold, marginTop: 4, fontWeight: Typography.weights.semibold },
  logo: { width: 60, height: 60 },
  card: { marginBottom: Spacing.sm, padding: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: Typography.sizes.sm, color: Colors.lightGray, marginBottom: 4 },
  big: { fontSize: Typography.sizes.xxxl, color: Colors.gold, fontWeight: Typography.weights.extrabold, marginBottom: 12 },
  bar: { height: 12, backgroundColor: Colors.glassLight, borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: Typography.sizes.xs, color: Colors.lightGray, marginBottom: 4 },
  statVal: { fontSize: Typography.sizes.md, color: Colors.white, fontWeight: Typography.weights.bold },
  statPer: { fontSize: Typography.sizes.xs, color: Colors.gold, fontWeight: Typography.weights.semibold, marginTop: 2 },
  div: { width: 1, backgroundColor: Colors.glassLight, marginHorizontal: Spacing.sm },
  section: { fontSize: Typography.sizes.lg, color: Colors.white, fontWeight: Typography.weights.bold, marginBottom: Spacing.md, marginTop: Spacing.md },
  icon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  name: { fontSize: Typography.sizes.md, color: Colors.white, fontWeight: Typography.weights.semibold },
  sub: { fontSize: Typography.sizes.xs, color: Colors.lightGray, marginTop: 2 },
  val: { fontSize: Typography.sizes.md, color: Colors.white, fontWeight: Typography.weights.bold, marginTop: 2 },
  warn: { fontSize: Typography.sizes.md, color: Colors.warning, fontWeight: Typography.weights.bold },
  calcRow: { flexDirection: 'row', gap: Spacing.md, marginTop: 8 },
  calcItem: { flex: 1, alignItems: 'center', padding: Spacing.sm, backgroundColor: Colors.glassLight, borderRadius: 8 },
  calcLabel: { fontSize: Typography.sizes.xs, color: Colors.lightGray, marginBottom: 4 },
  calcValue: { fontSize: Typography.sizes.lg, color: Colors.white, fontWeight: Typography.weights.bold },
  inputLabel: { fontSize: Typography.sizes.sm, color: Colors.lightGray, marginBottom: 8, fontWeight: Typography.weights.semibold },
  input: { backgroundColor: Colors.glassLight, borderRadius: 8, padding: Spacing.md, fontSize: Typography.sizes.md, color: Colors.white, fontWeight: Typography.weights.semibold, borderWidth: 1, borderColor: Colors.gold + '30' },
  calcButton: { marginTop: 16, borderRadius: 8, overflow: 'hidden' },
  calcButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.md, gap: 8 },
  calcButtonText: { fontSize: Typography.sizes.md, color: Colors.deepNavy, fontWeight: Typography.weights.bold },
  resultCard: { padding: Spacing.md, borderRadius: 8, borderWidth: 1, borderColor: Colors.glassLight },
  resultTitle: { fontSize: Typography.sizes.sm, color: Colors.white, fontWeight: Typography.weights.bold },
  divider: { height: 1, backgroundColor: Colors.glassLight, marginVertical: 12 },
});
