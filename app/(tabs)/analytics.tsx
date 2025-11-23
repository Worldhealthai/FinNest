import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlassCard from '@/components/GlassCard';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency, ISA_INFO, ISA_ANNUAL_ALLOWANCE } from '@/constants/isaData';
import { Dimensions } from 'react-native';
import { getCurrentTaxYear, isDateInTaxYear, getTaxYearFromDate, getTaxYearBoundaries } from '@/utils/taxYear';

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

// Helper to calculate historical performance by tax year
const calculateHistoricalPerformance = (contributions: ISAContribution[]) => {
  const currentTaxYear = getCurrentTaxYear();
  const historicalData: { year: string; amount: number; percentage: number }[] = [];

  // Group contributions by tax year
  const byTaxYear: Record<string, number> = {};

  contributions.forEach(contribution => {
    const taxYear = getTaxYearFromDate(new Date(contribution.date));
    const yearLabel = taxYear.label;

    if (!byTaxYear[yearLabel]) {
      byTaxYear[yearLabel] = 0;
    }
    byTaxYear[yearLabel] += contribution.amount;
  });

  // Get the last 3 tax years (excluding current year)
  const years = [];
  for (let i = 1; i <= 3; i++) {
    const taxYear = getTaxYearBoundaries(currentTaxYear.startYear - i);
    const amount = byTaxYear[taxYear.label] || 0;
    const percentage = (amount / ISA_ANNUAL_ALLOWANCE) * 100;

    years.push({
      year: taxYear.label,
      amount,
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
    });
  }

  return years;
};

// Helper to calculate contribution trend data for the chart
const calculateContributionTrend = (contributions: ISAContribution[]) => {
  if (contributions.length === 0) {
    return { labels: [], data: [] };
  }

  const currentTaxYear = getCurrentTaxYear();

  // Group contributions by tax year
  const byTaxYear: Record<string, number> = {};

  contributions.forEach(contribution => {
    const taxYear = getTaxYearFromDate(new Date(contribution.date));
    const yearLabel = taxYear.label;

    if (!byTaxYear[yearLabel]) {
      byTaxYear[yearLabel] = 0;
    }
    byTaxYear[yearLabel] += contribution.amount;
  });

  // Get all tax years from oldest to current
  const allYears = Object.keys(byTaxYear).sort();

  // If we have less than 4 years, pad with recent years including current
  const yearsToShow: string[] = [];
  const dataPoints: number[] = [];

  if (allYears.length === 0) {
    // No data, show last 4 years with zeros
    for (let i = 3; i >= 0; i--) {
      const year = getTaxYearBoundaries(currentTaxYear.startYear - i);
      yearsToShow.push(year.label);
      dataPoints.push(0);
    }
  } else if (allYears.length < 4) {
    // Pad with recent years up to 4 total
    const yearsNeeded = 4 - allYears.length;
    for (let i = yearsNeeded; i > 0; i--) {
      const year = getTaxYearBoundaries(currentTaxYear.startYear - allYears.length - i + 1);
      yearsToShow.push(year.label);
      dataPoints.push(0);
    }
    // Add actual years
    allYears.forEach(year => {
      yearsToShow.push(year);
      dataPoints.push(byTaxYear[year]);
    });
  } else {
    // Show last 4 years of actual data
    const lastFourYears = allYears.slice(-4);
    lastFourYears.forEach(year => {
      yearsToShow.push(year);
      dataPoints.push(byTaxYear[year]);
    });
  }

  // Format labels to show short form (e.g., "21/22")
  const labels = yearsToShow.map(year => {
    const match = year.match(/20(\d{2})\/(\d{2})/);
    return match ? `${match[1]}/${match[2]}` : year;
  });

  return { labels, data: dataPoints };
};

export default function AnalyticsScreen() {
  const [contributions, setContributions] = useState<ISAContribution[]>([]);

  // Load saved ISA data on mount
  useEffect(() => {
    loadISAData();
  }, []);

  // Reload contributions whenever the analytics tab is focused
  useFocusEffect(
    React.useCallback(() => {
      loadISAData();
    }, [])
  );

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

  // Filter contributions by current tax year for allowance tracking
  const currentTaxYear = getCurrentTaxYear();
  const currentYearContributions = contributions.filter(contribution =>
    isDateInTaxYear(new Date(contribution.date), currentTaxYear)
  );

  // For ISA breakdown, show all contributions across all years
  const groupedISAs = groupContributions(contributions);

  // For allowance calculations, use only current year
  const currentYearGrouped = groupContributions(currentYearContributions);
  const totalSaved = Object.values(currentYearGrouped).reduce((s, i) => s + i.total, 0);
  const remaining = ISA_ANNUAL_ALLOWANCE - totalSaved;
  const lifetimeBonus = currentYearGrouped.lifetime.total * 0.25;

  // Calculate estimated tax saved (20% basic rate on contributions)
  const taxSaved = totalSaved * 0.20;

  // Calculate historical performance data
  const historicalPerformance = calculateHistoricalPerformance(contributions);

  // Calculate contribution trend for the chart
  const contributionTrend = calculateContributionTrend(contributions);

  const chartData = {
    labels: contributionTrend.labels.length > 0 ? contributionTrend.labels : ['21/22', '22/23', '23/24', '24/25'],
    datasets: [{
      data: contributionTrend.data.length > 0 ? contributionTrend.data : [0, 0, 0, 0],
      color: () => Colors.gold
    }],
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>ISA Summary</Text>

          <GlassCard style={styles.card} intensity="dark">
            <Text style={styles.label}>Contribution History</Text>
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
            {historicalPerformance.length > 0 ? (
              historicalPerformance.map((yearData, index) => (
                <View
                  key={yearData.year}
                  style={[
                    styles.histrow,
                    index === historicalPerformance.length - 1 && { borderBottomWidth: 0 }
                  ]}
                >
                  <Text style={styles.histyear}>{yearData.year}</Text>
                  <Text style={styles.histval}>{formatCurrency(yearData.amount)}</Text>
                  {yearData.amount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{yearData.percentage}%</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={styles.sub}>No historical data available</Text>
              </View>
            )}
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
