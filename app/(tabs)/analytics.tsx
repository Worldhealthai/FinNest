import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlassCard from '@/components/GlassCard';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency, ISA_INFO, ISA_ANNUAL_ALLOWANCE } from '@/constants/isaData';
import { Dimensions } from 'react-native';
import { getCurrentTaxYear, isDateInTaxYear } from '@/utils/taxYear';

const { width } = Dimensions.get('window');
const CONTRIBUTIONS_STORAGE_KEY = '@finnest_contributions';

interface ISAContribution {
  id: string;
  isaType: string;
  provider: string;
  amount: number;
  date: string;
}

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

export default function AnalyticsScreen() {
  const [contributions, setContributions] = useState<ISAContribution[]>([]);

  // Load saved ISA data on mount
  useEffect(() => {
    loadISAData();
  }, []);

  const loadISAData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(CONTRIBUTIONS_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setContributions(parsed);
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
    }
  };

  // Filter contributions by current tax year
  const currentTaxYear = getCurrentTaxYear();
  const filteredContributions = contributions.filter(contribution =>
    isDateInTaxYear(new Date(contribution.date), currentTaxYear)
  );

  const groupedISAs = groupContributions(filteredContributions);
  const totalSaved = Object.values(groupedISAs).reduce((s, i) => s + i.total, 0);
  const remaining = ISA_ANNUAL_ALLOWANCE - totalSaved;
  const lifetimeBonus = groupedISAs.lifetime.total * 0.25;

  // Calculate estimated tax saved (20% basic rate on contributions)
  const taxSaved = totalSaved * 0.20;

  const chartData = {
    labels: ['Apr', 'Jun', 'Aug', 'Oct', 'Dec', 'Feb'],
    datasets: [{ data: [0, totalSaved * 0.2, totalSaved * 0.45, totalSaved * 0.65, totalSaved * 0.85, totalSaved], color: () => Colors.gold }],
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>ISA Summary</Text>

          <GlassCard style={styles.card} intensity="dark">
            <Text style={styles.label}>Contribution Progress</Text>
            <LineChart
              data={chartData}
              width={width - 64}
              height={220}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
                labelColor: () => Colors.lightGray,
                strokeWidth: 3,
                propsForDots: { r: '5', stroke: Colors.gold, strokeWidth: '2' },
              }}
              bezier
              style={{ borderRadius: 16 }}
              withInnerLines={false}
              withOuterLines={false}
            />
          </GlassCard>

          <Text style={styles.section}>Year Overview</Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <GlassCard style={[styles.card, { flex: 1 }]} intensity="medium">
              <Ionicons name="trending-up" size={24} color={Colors.success} />
              <Text style={styles.big}>{formatCurrency(totalSaved)}</Text>
              <Text style={styles.sub}>Total Saved</Text>
            </GlassCard>
            <GlassCard style={[styles.card, { flex: 1 }]} intensity="medium">
              <Ionicons name="calendar" size={24} color={Colors.info} />
              <Text style={styles.big}>{formatCurrency(remaining)}</Text>
              <Text style={styles.sub}>Remaining</Text>
            </GlassCard>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <GlassCard style={[styles.card, { flex: 1 }]} intensity="medium">
              <Ionicons name="shield-checkmark" size={24} color={Colors.gold} />
              <Text style={styles.big}>{formatCurrency(taxSaved)}</Text>
              <Text style={styles.sub}>Tax Saved</Text>
            </GlassCard>
            <GlassCard style={[styles.card, { flex: 1 }]} intensity="medium">
              <Ionicons name="flash" size={24} color={ISA_INFO.lifetime.color} />
              <Text style={styles.big}>{formatCurrency(lifetimeBonus)}</Text>
              <Text style={styles.sub}>Gov Bonus</Text>
            </GlassCard>
          </View>

          <Text style={styles.section}>ISA Breakdown</Text>

          <GlassCard style={styles.card} intensity="dark">
            {/* Cash ISA */}
            {groupedISAs.cash.total > 0 && (
              <View style={styles.breakdown}>
                <View style={styles.brow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bname}>{ISA_INFO.cash.name}</Text>
                    <Text style={styles.sub}>
                      {Object.keys(groupedISAs.cash.providers).join(', ') || 'No providers'}
                    </Text>
                  </View>
                  <Text style={styles.bval}>{formatCurrency(groupedISAs.cash.total)}</Text>
                </View>
                <View style={styles.bbar}>
                  <View style={[styles.bprog, {
                    width: `${(groupedISAs.cash.total / ISA_ANNUAL_ALLOWANCE) * 100}%`,
                    backgroundColor: ISA_INFO.cash.color
                  }]} />
                </View>
              </View>
            )}

            {/* Stocks & Shares ISA */}
            {groupedISAs.stocks_shares.total > 0 && (
              <View style={styles.breakdown}>
                <View style={styles.brow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bname}>{ISA_INFO.stocks_shares.name}</Text>
                    <Text style={styles.sub}>
                      {Object.keys(groupedISAs.stocks_shares.providers).join(', ') || 'No providers'}
                    </Text>
                  </View>
                  <Text style={styles.bval}>{formatCurrency(groupedISAs.stocks_shares.total)}</Text>
                </View>
                <View style={styles.bbar}>
                  <View style={[styles.bprog, {
                    width: `${(groupedISAs.stocks_shares.total / ISA_ANNUAL_ALLOWANCE) * 100}%`,
                    backgroundColor: ISA_INFO.stocks_shares.color
                  }]} />
                </View>
              </View>
            )}

            {/* Lifetime ISA */}
            {groupedISAs.lifetime.total > 0 && (
              <View style={styles.breakdown}>
                <View style={styles.brow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bname}>{ISA_INFO.lifetime.name}</Text>
                    <Text style={styles.sub}>
                      {Object.keys(groupedISAs.lifetime.providers).join(', ') || 'No providers'}
                    </Text>
                  </View>
                  <Text style={styles.bval}>{formatCurrency(groupedISAs.lifetime.total)}</Text>
                </View>
                <View style={styles.bbar}>
                  <View style={[styles.bprog, {
                    width: `${(groupedISAs.lifetime.total / ISA_ANNUAL_ALLOWANCE) * 100}%`,
                    backgroundColor: ISA_INFO.lifetime.color
                  }]} />
                </View>
              </View>
            )}

            {/* Innovative Finance ISA (IFISA) */}
            {groupedISAs.innovative_finance.total > 0 && (
              <View style={styles.breakdown}>
                <View style={styles.brow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bname}>{ISA_INFO.innovative_finance.name}</Text>
                    <Text style={styles.sub}>
                      {Object.keys(groupedISAs.innovative_finance.providers).join(', ') || 'No providers'}
                    </Text>
                  </View>
                  <Text style={styles.bval}>{formatCurrency(groupedISAs.innovative_finance.total)}</Text>
                </View>
                <View style={styles.bbar}>
                  <View style={[styles.bprog, {
                    width: `${(groupedISAs.innovative_finance.total / ISA_ANNUAL_ALLOWANCE) * 100}%`,
                    backgroundColor: ISA_INFO.innovative_finance.color
                  }]} />
                </View>
              </View>
            )}

            {/* Show message if no ISAs */}
            {totalSaved === 0 && (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={styles.sub}>No ISA contributions yet</Text>
              </View>
            )}
          </GlassCard>

          <Text style={styles.section}>Historical Performance</Text>

          <GlassCard style={styles.card} intensity="medium">
            <View style={styles.histrow}>
              <Text style={styles.histyear}>2023/24</Text>
              <Text style={styles.histval}>£18,500</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>92.5%</Text>
              </View>
            </View>
            <View style={styles.histrow}>
              <Text style={styles.histyear}>2022/23</Text>
              <Text style={styles.histval}>£15,200</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>76%</Text>
              </View>
            </View>
            <View style={styles.histrow}>
              <Text style={styles.histyear}>2021/22</Text>
              <Text style={styles.histval}>£12,000</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>60%</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.card} intensity="dark">
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="trophy" size={24} color={Colors.gold} />
              <Text style={[styles.name, { marginLeft: 12 }]}>On Track!</Text>
            </View>
            <Text style={[styles.sub, { marginTop: 8, lineHeight: 20 }]}>
              You're using your ISA allowance more efficiently than 78% of UK savers. Keep it up!
            </Text>
          </GlassCard>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.md },
  title: { fontSize: Typography.sizes.xxl, color: Colors.white, fontWeight: Typography.weights.bold, marginBottom: Spacing.lg },
  section: { fontSize: Typography.sizes.lg, color: Colors.white, fontWeight: Typography.weights.bold, marginBottom: Spacing.md, marginTop: Spacing.md },
  card: { marginBottom: Spacing.sm, padding: Spacing.md },
  label: { fontSize: Typography.sizes.sm, color: Colors.lightGray, marginBottom: 8 },
  big: { fontSize: Typography.sizes.xl, color: Colors.white, fontWeight: Typography.weights.bold, marginTop: 8 },
  sub: { fontSize: Typography.sizes.xs, color: Colors.lightGray, marginTop: 4 },
  name: { fontSize: Typography.sizes.md, color: Colors.white, fontWeight: Typography.weights.semibold },
  breakdown: { marginBottom: 16 },
  brow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  bname: { fontSize: Typography.sizes.md, color: Colors.white, fontWeight: Typography.weights.semibold },
  bval: { fontSize: Typography.sizes.md, color: Colors.gold, fontWeight: Typography.weights.bold },
  bbar: { height: 6, backgroundColor: Colors.glassLight, borderRadius: 3, overflow: 'hidden' },
  bprog: { height: '100%', borderRadius: 3 },
  histrow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.glassLight },
  histyear: { flex: 1, fontSize: Typography.sizes.md, color: Colors.white },
  histval: { fontSize: Typography.sizes.md, color: Colors.white, fontWeight: Typography.weights.semibold, marginRight: 12 },
  badge: { backgroundColor: Colors.gold + '30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: Typography.sizes.xs, color: Colors.gold, fontWeight: Typography.weights.bold },
});
