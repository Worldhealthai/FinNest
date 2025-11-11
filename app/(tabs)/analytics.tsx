import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlassCard from '@/components/GlassCard';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency, ISA_INFO } from '@/constants/isaData';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const chartData = {
    labels: ['Apr', 'Jun', 'Aug', 'Oct', 'Dec', 'Feb'],
    datasets: [{ data: [0, 3000, 7000, 10500, 14000, 16000], color: () => Colors.gold }],
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
              <Text style={styles.big}>£16,000</Text>
              <Text style={styles.sub}>Total Saved</Text>
            </GlassCard>
            <GlassCard style={[styles.card, { flex: 1 }]} intensity="medium">
              <Ionicons name="calendar" size={24} color={Colors.info} />
              <Text style={styles.big}>£4,000</Text>
              <Text style={styles.sub}>Remaining</Text>
            </GlassCard>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <GlassCard style={[styles.card, { flex: 1 }]} intensity="medium">
              <Ionicons name="shield-checkmark" size={24} color={Colors.gold} />
              <Text style={styles.big}>£1,200</Text>
              <Text style={styles.sub}>Tax Saved</Text>
            </GlassCard>
            <GlassCard style={[styles.card, { flex: 1 }]} intensity="medium">
              <Ionicons name="flash" size={24} color={ISA_INFO.lifetime.color} />
              <Text style={styles.big}>£750</Text>
              <Text style={styles.sub}>Gov Bonus</Text>
            </GlassCard>
          </View>

          <Text style={styles.section}>ISA Breakdown</Text>

          <GlassCard style={styles.card} intensity="dark">
            <View style={styles.breakdown}>
              <View style={styles.brow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bname}>Cash ISA</Text>
                  <Text style={styles.sub}>NatWest</Text>
                </View>
                <Text style={styles.bval}>£5,000</Text>
              </View>
              <View style={styles.bbar}>
                <View style={[styles.bprog, { width: '25%', backgroundColor: '#00C9FF' }]} />
              </View>
            </View>

            <View style={styles.breakdown}>
              <View style={styles.brow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bname}>Stocks & Shares</Text>
                  <Text style={styles.sub}>Vanguard</Text>
                </View>
                <Text style={styles.bval}>£8,000</Text>
              </View>
              <View style={styles.bbar}>
                <View style={[styles.bprog, { width: '40%', backgroundColor: Colors.gold }]} />
              </View>
            </View>

            <View style={styles.breakdown}>
              <View style={styles.brow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bname}>Lifetime ISA</Text>
                  <Text style={styles.sub}>Moneybox</Text>
                </View>
                <Text style={styles.bval}>£3,000</Text>
              </View>
              <View style={styles.bbar}>
                <View style={[styles.bprog, { width: '15%', backgroundColor: '#00FF87' }]} />
              </View>
            </View>
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
