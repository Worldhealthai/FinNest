import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { ISA_INFO, ISA_ANNUAL_ALLOWANCE, LIFETIME_ISA_MAX, EDUCATIONAL_CONTENT, formatCurrency } from '@/constants/isaData';

export default function HubScreen() {
  const [expandedISA, setExpandedISA] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>ISA Hub</Text>
              <Text style={styles.subtitle}>Essential ISA knowledge and resources</Text>
            </View>
            <Image source={require('@/assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>

          {/* ISA Essentials - Educational Content */}
          <Text style={styles.section}>ISA Essentials</Text>

          {EDUCATIONAL_CONTENT.BEGINNER.map((item, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.eduTitle}>{item.title}</Text>
              <Text style={[styles.sub, { marginTop: 8, lineHeight: 20 }]}>{item.content}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>
            </View>
          ))}

          {EDUCATIONAL_CONTENT.INTERMEDIATE.slice(0, 2).map((item, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.eduTitle}>{item.title}</Text>
              <Text style={[styles.sub, { marginTop: 8, lineHeight: 20 }]}>{item.content}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>
            </View>
          ))}

          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="school" size={24} color={Colors.gold} />
              <Text style={[styles.name, { marginLeft: 12 }]}>Want to Learn More?</Text>
            </View>
            <Text style={[styles.sub, { marginTop: 8, lineHeight: 20 }]}>
              FinNest provides comprehensive ISA education to help you make informed decisions about your financial future.
            </Text>
          </View>

          {/* The 4 ISA Types */}
          <Text style={styles.section}>ISA Types</Text>

          {Object.values(ISA_INFO).map((isa) => (
            <Pressable
              key={isa.id}
              onPress={() => setExpandedISA(expandedISA === isa.id ? null : isa.id)}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <View style={styles.card}>
                <View style={styles.row}>
                  <View style={[styles.icon, { backgroundColor: isa.color + '20' }]}>
                    <Ionicons name={isa.icon as any} size={24} color={isa.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{isa.name}</Text>
                    <Text style={styles.sub}>{isa.riskLevel} Risk • {isa.potentialReturn}</Text>
                  </View>
                  <Ionicons name={expandedISA === isa.id ? "chevron-up" : "chevron-down"} size={20} color={Colors.lightGray} />
                </View>

                {expandedISA === isa.id && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.desc}>{isa.description}</Text>

                    <Text style={[styles.sub, { marginTop: 12, fontWeight: Typography.weights.semibold }]}>Benefits:</Text>
                    {isa.benefits.map((benefit, i) => (
                      <View key={i} style={styles.listRow}>
                        <Text style={styles.bullet}>✓</Text>
                        <Text style={styles.listText}>{benefit}</Text>
                      </View>
                    ))}

                    <Text style={[styles.sub, { marginTop: 8, fontWeight: Typography.weights.semibold }]}>Best For:</Text>
                    {isa.bestFor.map((item, i) => (
                      <View key={i} style={styles.listRow}>
                        <Text style={styles.bullet}>→</Text>
                        <Text style={styles.listText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </Pressable>
          ))}

          <Text style={styles.section}>Key Rules</Text>

          <View style={styles.card}>
            <View style={styles.ruleRow}>
              <Ionicons name="cash" size={20} color={Colors.gold} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.ruleName}>Annual Allowance</Text>
                <Text style={styles.sub}>{formatCurrency(ISA_ANNUAL_ALLOWANCE)} per tax year (6 April - 5 April)</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.ruleRow}>
              <Ionicons name="home" size={20} color={ISA_INFO.lifetime.color} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.ruleName}>Lifetime ISA Limit</Text>
                <Text style={styles.sub}>{formatCurrency(LIFETIME_ISA_MAX)} max per year + 25% government bonus</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.ruleRow}>
              <Ionicons name="calendar" size={20} color={Colors.info} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.ruleName}>Use It or Lose It</Text>
                <Text style={styles.sub}>Unused allowance doesn't carry over</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.ruleRow}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.ruleName}>2024 Update</Text>
                <Text style={styles.sub}>Multiple ISAs of the same type allowed per year (except LISA & Junior ISAs)</Text>
              </View>
            </View>
          </View>

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
  subtitle: { fontSize: Typography.sizes.sm, color: Colors.lightGray, marginTop: 4 },
  logo: { width: 60, height: 60 },
  section: { fontSize: Typography.sizes.lg, color: Colors.white, fontWeight: Typography.weights.bold, marginBottom: Spacing.md, marginTop: Spacing.lg },
  card: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  name: { fontSize: Typography.sizes.md, color: Colors.white, fontWeight: Typography.weights.semibold },
  sub: { fontSize: Typography.sizes.xs, color: Colors.lightGray, marginTop: 2 },
  desc: { fontSize: Typography.sizes.sm, color: Colors.white, lineHeight: 20 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  bullet: { color: Colors.gold, marginRight: 8, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  listText: { flex: 1, fontSize: Typography.sizes.xs, color: Colors.lightGray, lineHeight: 18 },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  ruleName: { fontSize: Typography.sizes.md, color: Colors.white, fontWeight: Typography.weights.semibold, marginBottom: 4 },
  eduTitle: { fontSize: Typography.sizes.md, color: Colors.gold, fontWeight: Typography.weights.bold },
  badge: { alignSelf: 'flex-start', backgroundColor: Colors.gold + '30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  badgeText: { fontSize: Typography.sizes.xs, color: Colors.gold, fontWeight: Typography.weights.bold },

  // Gamification styles
  levelCard: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelGradient: { padding: Spacing.lg },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  levelBadge: { width: 70, height: 70, borderRadius: 35, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md, position: 'relative' },
  levelNumber: { position: 'absolute', fontSize: Typography.sizes.xl, color: Colors.deepNavy, fontWeight: Typography.weights.extrabold, bottom: 4 },
  levelInfo: { flex: 1 },
  levelTitle: { fontSize: Typography.sizes.lg, color: Colors.white, fontWeight: Typography.weights.extrabold },
  levelSubtitle: { fontSize: Typography.sizes.sm, color: Colors.white, opacity: 0.9, marginTop: 2 },
  xpBar: { marginBottom: Spacing.sm },
  xpBarBg: { height: 12, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 6, overflow: 'hidden', marginBottom: Spacing.xs },
  xpBarFill: { height: '100%', borderRadius: 6 },
  xpText: { fontSize: Typography.sizes.sm, color: Colors.white, fontWeight: Typography.weights.bold, textAlign: 'center' },
  xpInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  xpInfoText: { fontSize: Typography.sizes.xs, color: Colors.deepNavy, fontWeight: Typography.weights.semibold },

  streakCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  streakHeader: { flexDirection: 'row', alignItems: 'center' },
  streakIconWrapper: { marginRight: Spacing.md },
  streakIconGradient: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  streakTitle: { fontSize: Typography.sizes.md, color: Colors.white, fontWeight: Typography.weights.bold },
  streakSubtitle: { fontSize: Typography.sizes.xs, color: Colors.lightGray, marginTop: 2 },
  streakStats: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.glassLight },
  streakStat: { alignItems: 'center', gap: 4 },
  streakNumber: { fontSize: Typography.sizes.xl, color: Colors.gold, fontWeight: Typography.weights.extrabold },
  streakLabel: { fontSize: Typography.sizes.xs, color: Colors.lightGray },
  streakDivider: { width: 1, backgroundColor: Colors.glassLight },

  taskCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  taskRow: { flexDirection: 'row', alignItems: 'center' },
  taskIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  taskTitle: { fontSize: Typography.sizes.md, color: Colors.white, fontWeight: Typography.weights.semibold },
  taskXP: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  taskXPText: { fontSize: Typography.sizes.xs, color: Colors.gold, fontWeight: Typography.weights.bold },
  completedBadge: { backgroundColor: Colors.success + '30', paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: 12 },
  completedText: { fontSize: Typography.sizes.xs, color: Colors.success, fontWeight: Typography.weights.bold },

  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  achievementWrapper: { width: '48%' },
  achievementCard: {
    padding: Spacing.md,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementCardLocked: {
    opacity: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  achievementIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  achievementTitle: { fontSize: Typography.sizes.sm, color: Colors.white, fontWeight: Typography.weights.bold, textAlign: 'center', marginBottom: 4 },
  achievementTitleLocked: { color: Colors.mediumGray },
  achievementDesc: { fontSize: Typography.sizes.xs, color: Colors.lightGray, textAlign: 'center', lineHeight: 16 },
  achievementDescLocked: { color: Colors.mediumGray },
  unlockedBadge: { position: 'absolute', top: Spacing.xs, right: Spacing.xs, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' },
});
