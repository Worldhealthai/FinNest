import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
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
  deleted?: boolean;
  deletedDate?: string;
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
    // Skip deleted contributions in display
    if (contribution.deleted) return;

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

  // Group contributions by tax year
  const byTaxYear: Record<string, number> = {};

  contributions.forEach(contribution => {
    // Skip deleted contributions
    if (contribution.deleted) return;

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

    years.push({
      year: taxYear.label,
      amount,
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
    // Skip deleted contributions
    if (contribution.deleted) return;

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

  // Calculate Consistency Score - Simple & Transparent
  const calculateConsistencyScore = (contributions: ISAContribution[]) => {
    if (contributions.length === 0) {
      return {
        score: 0,
        baseScore: 0,
        monthsCovered: 0,
        bonuses: [],
        rating: 'Not Started',
        monthlyHeatmap: Array(12).fill(false)
      };
    }

    const currentTaxYear = getCurrentTaxYear();

    // Get contributions for current tax year only
    const yearContributions = contributions.filter(c =>
      !c.deleted && isDateInTaxYear(new Date(c.date), currentTaxYear)
    );

    if (yearContributions.length === 0) {
      return {
        score: 0,
        baseScore: 0,
        monthsCovered: 0,
        bonuses: [],
        rating: 'Not Started',
        monthlyHeatmap: Array(12).fill(false)
      };
    }

    // BASE SCORE: Simple monthly coverage (0-100%)
    const monthsWithContributions = new Set(
      yearContributions.map(c => {
        const date = new Date(c.date);
        return date.getMonth(); // 0-11 for Jan-Dec
      })
    );
    const monthsCovered = monthsWithContributions.size;
    const baseScore = Math.round((monthsCovered / 12) * 100);

    // Create monthly heatmap (April = index 0, March = index 11)
    const taxYearStart = currentTaxYear.startDate.getMonth(); // April = 3
    const monthlyHeatmap = Array(12).fill(false);
    monthsWithContributions.forEach(month => {
      // Convert calendar month to tax year month (April = 0, May = 1, etc.)
      const taxYearMonth = (month - taxYearStart + 12) % 12;
      monthlyHeatmap[taxYearMonth] = true;
    });

    // BONUSES (transparent and visible)
    const bonuses: Array<{ name: string; value: number; earned: boolean }> = [];

    // 1. EARLY BIRD BONUS (+10%)
    const firstContribution = new Date(Math.min(...yearContributions.map(c => new Date(c.date).getTime())));
    const monthsSinceStart = Math.max(0,
      (firstContribution.getFullYear() - currentTaxYear.startDate.getFullYear()) * 12 +
      (firstContribution.getMonth() - currentTaxYear.startDate.getMonth())
    );
    const earnedEarlyBird = monthsSinceStart <= 2; // First 3 months (Apr, May, Jun)
    bonuses.push({
      name: 'Early Bird',
      value: 10,
      earned: earnedEarlyBird
    });

    // 2. ACTIVE STREAK BONUS (+10%)
    // Check for 3+ consecutive months
    let maxStreak = 0;
    let currentStreak = 0;
    for (let i = 0; i < 12; i++) {
      if (monthlyHeatmap[i]) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    const earnedStreak = maxStreak >= 3;
    bonuses.push({
      name: 'Active Streak',
      value: 10,
      earned: earnedStreak
    });

    // 3. FREQUENT SAVER BONUS (+5%)
    const earnedFrequent = monthsCovered >= 6;
    bonuses.push({
      name: 'Frequent Saver',
      value: 5,
      earned: earnedFrequent
    });

    // TOTAL SCORE (base + earned bonuses, capped at 100%)
    const bonusPoints = bonuses.filter(b => b.earned).reduce((sum, b) => sum + b.value, 0);
    const totalScore = Math.min(100, baseScore + bonusPoints);

    // RATING
    let rating = 'Getting Started';
    if (totalScore >= 90) rating = 'ISA Pro';
    else if (totalScore >= 75) rating = 'Steady Investor';
    else if (totalScore >= 60) rating = 'Building Habits';
    else if (totalScore >= 40) rating = 'Making Progress';

    return {
      score: totalScore,
      baseScore,
      monthsCovered,
      bonuses,
      rating,
      monthlyHeatmap
    };
  };

  const consistencyData = calculateConsistencyScore(currentYearContributions);

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
          <View style={styles.header}>
            <Text style={styles.title}>ISA Summary</Text>
            <Image source={require('@/assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>

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

          {/* Consistency Score Card - Full Width */}
          <GlassCard style={styles.card} intensity="medium">
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="analytics" size={24} color={Colors.gold} style={{ marginRight: 8 }} />
                <Text style={styles.name}>Consistency Score</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.big, { fontSize: Typography.sizes.xxxl, marginBottom: 0 }]}>{consistencyData.score}%</Text>
                <Text style={[styles.sub, { fontSize: 11, color: Colors.gold, marginTop: 2 }]}>
                  {consistencyData.rating}
                </Text>
              </View>
            </View>

            {/* Base Score + Bonuses */}
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.sub, { fontSize: 12 }]}>Base: {consistencyData.monthsCovered}/12 months</Text>
                <Text style={[styles.val, { fontSize: 14, color: Colors.gold }]}>{consistencyData.baseScore}%</Text>
              </View>

              {/* Bonuses */}
              {consistencyData.bonuses.map((bonus: any, index: number) => (
                <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, opacity: bonus.earned ? 1 : 0.4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                      name={bonus.earned ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={bonus.earned ? Colors.success : Colors.mediumGray}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.sub, { fontSize: 11 }]}>
                      {bonus.name} {!bonus.earned && '(locked)'}
                    </Text>
                  </View>
                  <Text style={[styles.sub, { fontSize: 11, color: bonus.earned ? Colors.success : Colors.mediumGray }]}>
                    +{bonus.value}%
                  </Text>
                </View>
              ))}
            </View>

            {/* Monthly Heatmap */}
            <View>
              <Text style={[styles.sub, { fontSize: 10, marginBottom: 6, opacity: 0.7 }]}>Monthly Activity</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {['A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D', 'J', 'F', 'M'].map((month, index) => (
                  <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{
                      width: '100%',
                      aspectRatio: 1,
                      backgroundColor: consistencyData.monthlyHeatmap[index] ? Colors.gold : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 4,
                      marginBottom: 2
                    }} />
                    <Text style={{ fontSize: 8, color: Colors.lightGray }}>{month}</Text>
                  </View>
                ))}
              </View>
            </View>
          </GlassCard>

          {/* Gov Bonus Card */}
          <GlassCard style={styles.card} intensity="medium">
            <Ionicons name="flash" size={24} color={ISA_INFO.lifetime.color} />
            <Text style={styles.big}>{formatCurrency(lifetimeBonus)}</Text>
            <Text style={styles.sub}>Government Bonus (LISA)</Text>
          </GlassCard>

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
                </View>
              ))
            ) : (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={styles.sub}>No historical data available</Text>
              </View>
            )}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  title: { fontSize: Typography.sizes.xxl, color: Colors.white, fontWeight: Typography.weights.bold },
  logo: { width: 60, height: 60 },
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
