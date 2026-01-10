import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlassCard from '@/components/GlassCard';
import AddISAContributionModal, { ISAContribution } from '@/components/AddISAContributionModal';
import EditISAContributionModal from '@/components/EditISAContributionModal';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { ISA_INFO, ISA_ANNUAL_ALLOWANCE, LIFETIME_ISA_MAX, getDaysUntilTaxYearEnd, formatCurrency, getTaxYearDates } from '@/constants/isaData';
import { getCurrentTaxYear, isDateInTaxYear } from '@/utils/taxYear';
import { isISAFlexible } from '@/utils/isaSettings';
import { loadContributions, saveContribution, updateContribution as updateContributionDB, deleteContribution as deleteContributionDB } from '@/lib/contributions';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { sendISALimitNotification } from '@/utils/notificationService';

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

    // Contributed total includes withdrawn amounts (they were still contributed)
    grouped[type].providers[contribution.provider].contributed += contribution.amount;
    grouped[type].total += contribution.amount;

    // Balance only includes active (not withdrawn) amounts
    if (!contribution.withdrawn) {
      grouped[type].providers[contribution.provider].balance += contribution.amount;
    }
  });

  return grouped;
};

// Helper to calculate total allowance used
// For flexible ISAs: withdrawn contributions free up allowance (don't count)
// For non-flexible ISAs: withdrawn contributions still count toward allowance
// Only truly deleted entries never count
const calculateAllowanceUsed = (contributions: ISAContribution[]) => {
  let totalUsed = 0;

  for (const contribution of contributions) {
    // For flexible ISAs, withdrawn contributions don't count toward allowance
    // For non-flexible ISAs, withdrawn contributions still count
    const isaFlexible = isISAFlexible(contribution.isaType, contribution.provider);

    if (contribution.withdrawn && isaFlexible) {
      // Flexible ISA withdrawal - doesn't count toward allowance
      continue;
    }

    // Add to allowance used
    totalUsed += contribution.amount;
  }

  return totalUsed;
};

export default function DashboardScreen() {
  const { isGuest } = useOnboarding();
  const [contributions, setContributions] = useState<ISAContribution[]>([]);
  const [expandedISA, setExpandedISA] = useState<string | null>(null);
  const [allowanceUsed, setAllowanceUsed] = useState<number>(0);

  // Filter contributions by current tax year only
  const currentTaxYear = getCurrentTaxYear();
  const filteredContributions = contributions.filter(contribution =>
    isDateInTaxYear(new Date(contribution.date), currentTaxYear)
  );

  const groupedISAs = groupContributions(filteredContributions);
  const total = Object.values(groupedISAs).reduce((s, i) => s + i.total, 0);
  // Use allowanceUsed instead of total for calculating remaining allowance
  // This accounts for deleted non-flexible contributions
  const remaining = ISA_ANNUAL_ALLOWANCE - allowanceUsed;
  const days = getDaysUntilTaxYearEnd();
  const taxYear = getTaxYearDates();
  // Use allowanceUsed for percentage calculation too
  const percent = (allowanceUsed / ISA_ANNUAL_ALLOWANCE) * 100;
  const lisaBonus = groupedISAs.lifetime.total * 0.25;

  // Modal state
  const [addContributionVisible, setAddContributionVisible] = useState(false);
  const [editContributionVisible, setEditContributionVisible] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<ISAContribution | null>(null);

  // Load saved ISA data on mount
  useEffect(() => {
    loadISAData();
  }, []);

  // Calculate allowance used (withdrawn contributions count, deleted don't)
  useEffect(() => {
    const used = calculateAllowanceUsed(filteredContributions);
    setAllowanceUsed(used);
  }, [filteredContributions]);

  const loadISAData = async () => {
    try {
      // Guest users: load from AsyncStorage
      if (isGuest) {
        console.log('=== Loading contributions from AsyncStorage (Guest Mode) ===');
        const savedData = await AsyncStorage.getItem(CONTRIBUTIONS_STORAGE_KEY);

        if (savedData) {
          const parsed = JSON.parse(savedData);
          console.log('✅ Loaded', parsed.length, 'contributions');
          setContributions(parsed);
        }
        return;
      }

      // Authenticated users: load from Supabase
      console.log('=== Loading contributions from Supabase ===');
      const data = await loadContributions();
      console.log('✅ Loaded', data.length, 'contributions from Supabase');
      setContributions(data);
    } catch (error) {
      console.error('❌ Error loading contributions:', error);
    }
  };

  const saveContributions = async (contributionsData: ISAContribution[]) => {
    try {
      // Only used for guest mode - save to AsyncStorage
      if (isGuest) {
        console.log('=== Saving contributions (Guest Mode) ===');
        const jsonData = JSON.stringify(contributionsData);
        await AsyncStorage.setItem(CONTRIBUTIONS_STORAGE_KEY, jsonData);
        console.log('✅ Saved to AsyncStorage');
      }
      // For authenticated users, contributions are saved individually to Supabase
    } catch (error) {
      console.error('❌ Error saving contributions:', error);
    }
  };

  const handleAddContribution = async (contribution: ISAContribution) => {
    console.log('=== handleAddContribution called ===');
    console.log('Contribution received:', contribution);

    if (isGuest) {
      // Guest mode: save to AsyncStorage
      const updatedContributions = [...contributions, contribution];
      setContributions(updatedContributions);
      await saveContributions(updatedContributions);
    } else {
      // Authenticated: save to Supabase
      const saved = await saveContribution(contribution);
      if (saved) {
        // Reload all contributions from Supabase to ensure sync
        await loadISAData();
      }
    }

    // Calculate new total and send notification if milestone reached
    const allContributions = isGuest ? [...contributions, contribution] : contributions;
    const currentYearContributions = allContributions.filter(c =>
      isDateInTaxYear(new Date(c.date), currentTaxYear)
    );
    const newTotal = calculateAllowanceUsed(currentYearContributions);
    await sendISALimitNotification(newTotal, ISA_ANNUAL_ALLOWANCE);

    console.log('Contribution added and saved successfully');
  };

  const handleEditContribution = (contribution: ISAContribution) => {
    setSelectedContribution(contribution);
    setEditContributionVisible(true);
  };

  const handleUpdateContribution = async (updatedContribution: ISAContribution) => {
    console.log('=== handleUpdateContribution called ===');
    console.log('Updated contribution received:', updatedContribution);

    if (isGuest) {
      // Guest mode: update in AsyncStorage
      const updatedContributions = contributions.map(c =>
        c.id === updatedContribution.id ? updatedContribution : c
      );
      setContributions(updatedContributions);
      await saveContributions(updatedContributions);
    } else {
      // Authenticated: update in Supabase
      const success = await updateContributionDB(updatedContribution.id, updatedContribution);
      if (success) {
        await loadISAData();
      }
    }

    console.log('Contribution updated and saved successfully');
  };

  const handleWithdrawContribution = async (contributionId: string) => {
    const contribution = contributions.find(c => c.id === contributionId);
    if (!contribution) return;

    const isaFlexible = isISAFlexible(contribution.isaType, contribution.provider);
    const message = isaFlexible
      ? `Withdraw this ${formatCurrency(contribution.amount)} contribution from ${contribution.provider}?\n\nThis is a flexible ISA - withdrawing will free up ${formatCurrency(contribution.amount)} of your allowance for re-contribution this tax year.`
      : `Withdraw this ${formatCurrency(contribution.amount)} contribution from ${contribution.provider}?\n\nThe contribution will be marked as withdrawn, but the allowance remains used for this tax year (non-flexible ISA rules).`;

    const performWithdraw = async () => {
      console.log(`Marking contribution as withdrawn - ${isaFlexible ? 'allowance freed up (flexible ISA)' : 'allowance remains used (non-flexible ISA)'}`);

      if (isGuest) {
        // Guest mode: update in AsyncStorage
        const updatedContributions = contributions.map(c =>
          c.id === contributionId
            ? { ...c, withdrawn: true, withdrawnDate: new Date().toISOString() }
            : c
        );
        setContributions(updatedContributions);
        await saveContributions(updatedContributions);
      } else {
        // Authenticated: update in Supabase
        const success = await updateContributionDB(contributionId, { withdrawn: true });
        if (success) {
          await loadISAData();
        }
      }

      console.log('✅ Contribution marked as withdrawn:', contributionId);
    };

    // Use native browser confirm on web, Alert.alert on mobile
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        await performWithdraw();
      }
    } else {
      Alert.alert(
        'Withdraw Contribution',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Withdraw',
            style: 'default',
            onPress: performWithdraw,
          },
        ]
      );
    }
  };

  const handleDeleteContribution = async (contributionId: string) => {
    const contribution = contributions.find(c => c.id === contributionId);
    if (!contribution) return;

    const message = `Delete this ${formatCurrency(contribution.amount)} entry from ${contribution.provider}?\n\nThis will completely remove the entry and restore your allowance.\n\nOnly use this if the entry was added by mistake!`;

    const performDelete = async () => {
      console.log(`Deleting contribution - allowance will be restored`);

      if (isGuest) {
        // Guest mode: delete from AsyncStorage
        const updatedContributions = contributions.filter(c => c.id !== contributionId);
        setContributions(updatedContributions);
        await saveContributions(updatedContributions);
      } else {
        // Authenticated: delete from Supabase
        const success = await deleteContributionDB(contributionId);
        if (success) {
          await loadISAData();
        }
      }

      console.log('✅ Contribution deleted:', contributionId);
    };

    // Use native browser confirm on web, Alert.alert on mobile
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        await performDelete();
      }
    } else {
      Alert.alert(
        'Delete Entry',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: performDelete
          }
        ]
      );
    }
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

          {allowanceUsed >= ISA_ANNUAL_ALLOWANCE && (
            <GlassCard style={styles.card} intensity="dark">
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.warn, { color: allowanceUsed > ISA_ANNUAL_ALLOWANCE ? Colors.error : Colors.gold }]}>
                    {allowanceUsed > ISA_ANNUAL_ALLOWANCE ? 'Allowance Exceeded!' : '🎯 ISA Limit Reached!'}
                  </Text>
                  <Text style={styles.sub}>
                    {allowanceUsed > ISA_ANNUAL_ALLOWANCE
                      ? `You've exceeded the £20,000 annual limit by ${formatCurrency(allowanceUsed - ISA_ANNUAL_ALLOWANCE)}`
                      : 'Congratulations! You\'ve maximized your £20,000 annual ISA allowance.'
                    }
                  </Text>
                </View>
              </View>
            </GlassCard>
          )}

          {allowanceUsed >= ISA_ANNUAL_ALLOWANCE * 0.9 && allowanceUsed < ISA_ANNUAL_ALLOWANCE && (
            <GlassCard style={styles.card} intensity="dark">
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.warn, { color: Colors.gold }]}>🚩 Nearly There!</Text>
                  <Text style={styles.sub}>
                    You're at {Math.round(percent)}% of your ISA limit! Only {formatCurrency(remaining)} remaining.
                  </Text>
                </View>
              </View>
            </GlassCard>
          )}

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

              {expandedISA === 'cash' && filteredContributions.filter(c => c.isaType === 'cash').length > 0 && (
                <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.glassLight }}>
                  <Text style={[styles.sub, { marginBottom: 12, fontWeight: '600' }]}>Contributions:</Text>
                  {filteredContributions.filter(c => c.isaType === 'cash').map((contribution) => (
                    <View key={contribution.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingLeft: 12, paddingVertical: 8, backgroundColor: contribution.withdrawn ? 'rgba(255, 165, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)', borderRadius: 8, borderWidth: contribution.withdrawn ? 1 : 0, borderColor: contribution.withdrawn ? 'rgba(255, 165, 0, 0.3)' : 'transparent' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.sub}>{contribution.provider}</Text>
                          {contribution.withdrawn && (
                            <Text style={{ fontSize: 10, color: Colors.warning, fontWeight: '600', backgroundColor: 'rgba(255, 165, 0, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>WITHDRAWN</Text>
                          )}
                        </View>
                        <Text style={[styles.sub, { fontSize: 12, opacity: 0.7, marginTop: 2 }]}>
                          {new Date(contribution.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={[styles.val, { marginRight: 8, textDecorationLine: contribution.withdrawn ? 'line-through' : 'none', opacity: contribution.withdrawn ? 0.6 : 1 }]}>{formatCurrency(contribution.amount)}</Text>
                      {!contribution.withdrawn && (
                        <>
                          <TouchableOpacity
                            onPress={() => handleEditContribution(contribution)}
                            style={{ padding: 8 }}
                            activeOpacity={0.6}
                          >
                            <Ionicons name="create-outline" size={20} color={Colors.gold} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleWithdrawContribution(contribution.id)}
                            style={{ padding: 8 }}
                            activeOpacity={0.6}
                          >
                            <Ionicons name="arrow-undo-outline" size={20} color={Colors.warning} />
                          </TouchableOpacity>
                        </>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDeleteContribution(contribution.id)}
                        style={{ padding: 8 }}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                      </TouchableOpacity>
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

              {expandedISA === 'stocks_shares' && filteredContributions.filter(c => c.isaType === 'stocks_shares').length > 0 && (
                <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.glassLight }}>
                  <Text style={[styles.sub, { marginBottom: 12, fontWeight: '600' }]}>Contributions:</Text>
                  {filteredContributions.filter(c => c.isaType === 'stocks_shares').map((contribution) => (
                    <View key={contribution.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingLeft: 12, paddingVertical: 8, backgroundColor: contribution.withdrawn ? 'rgba(255, 165, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)', borderRadius: 8, borderWidth: contribution.withdrawn ? 1 : 0, borderColor: contribution.withdrawn ? 'rgba(255, 165, 0, 0.3)' : 'transparent' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.sub}>{contribution.provider}</Text>
                          {contribution.withdrawn && (
                            <Text style={{ fontSize: 10, color: Colors.warning, fontWeight: '600', backgroundColor: 'rgba(255, 165, 0, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>WITHDRAWN</Text>
                          )}
                        </View>
                        <Text style={[styles.sub, { fontSize: 12, opacity: 0.7, marginTop: 2 }]}>
                          {new Date(contribution.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={[styles.val, { marginRight: 8, textDecorationLine: contribution.withdrawn ? 'line-through' : 'none', opacity: contribution.withdrawn ? 0.6 : 1 }]}>{formatCurrency(contribution.amount)}</Text>
                      {!contribution.withdrawn && (
                        <>
                          <TouchableOpacity
                            onPress={() => handleEditContribution(contribution)}
                            style={{ padding: 8 }}
                            activeOpacity={0.6}
                          >
                            <Ionicons name="create-outline" size={20} color={Colors.gold} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleWithdrawContribution(contribution.id)}
                            style={{ padding: 8 }}
                            activeOpacity={0.6}
                          >
                            <Ionicons name="arrow-undo-outline" size={20} color={Colors.warning} />
                          </TouchableOpacity>
                        </>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDeleteContribution(contribution.id)}
                        style={{ padding: 8 }}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                      </TouchableOpacity>
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

              {expandedISA === 'lifetime' && filteredContributions.filter(c => c.isaType === 'lifetime').length > 0 && (
                <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.glassLight }}>
                  <Text style={[styles.sub, { marginBottom: 12, fontWeight: '600' }]}>Contributions:</Text>
                  {filteredContributions.filter(c => c.isaType === 'lifetime').map((contribution) => (
                    <View key={contribution.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingLeft: 12, paddingVertical: 8, backgroundColor: contribution.withdrawn ? 'rgba(255, 165, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)', borderRadius: 8, borderWidth: contribution.withdrawn ? 1 : 0, borderColor: contribution.withdrawn ? 'rgba(255, 165, 0, 0.3)' : 'transparent' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.sub}>{contribution.provider}</Text>
                          {contribution.withdrawn && (
                            <Text style={{ fontSize: 10, color: Colors.warning, fontWeight: '600', backgroundColor: 'rgba(255, 165, 0, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>WITHDRAWN</Text>
                          )}
                        </View>
                        <Text style={[styles.sub, { fontSize: 12, opacity: 0.7, marginTop: 2 }]}>
                          {new Date(contribution.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={[styles.val, { marginRight: 8, textDecorationLine: contribution.withdrawn ? 'line-through' : 'none', opacity: contribution.withdrawn ? 0.6 : 1 }]}>{formatCurrency(contribution.amount)}</Text>
                      {!contribution.withdrawn && (
                        <>
                          <TouchableOpacity
                            onPress={() => handleEditContribution(contribution)}
                            style={{ padding: 8 }}
                            activeOpacity={0.6}
                          >
                            <Ionicons name="create-outline" size={20} color={Colors.gold} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleWithdrawContribution(contribution.id)}
                            style={{ padding: 8 }}
                            activeOpacity={0.6}
                          >
                            <Ionicons name="arrow-undo-outline" size={20} color={Colors.warning} />
                          </TouchableOpacity>
                        </>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDeleteContribution(contribution.id)}
                        style={{ padding: 8 }}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>
          </Pressable>

          {/* Innovative Finance ISA */}
          <Pressable onPress={() => setExpandedISA(expandedISA === 'innovative_finance' ? null : 'innovative_finance')} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
            <GlassCard style={styles.card} intensity="medium">
              <View style={styles.row}>
                <View style={[styles.icon, { backgroundColor: ISA_INFO.innovative_finance.color + '30' }]}>
                  <Ionicons name="flash" size={24} color={ISA_INFO.innovative_finance.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>Innovative Finance ISA</Text>
                  <Text style={styles.sub}>
                    {Object.keys(groupedISAs.innovative_finance.providers).length > 0
                      ? `${Object.keys(groupedISAs.innovative_finance.providers).length} provider${Object.keys(groupedISAs.innovative_finance.providers).length > 1 ? 's' : ''} • High Risk`
                      : 'No contributions yet'}
                  </Text>
                </View>
                <Ionicons name={expandedISA === 'innovative_finance' ? "chevron-up" : "chevron-down"} size={20} color={Colors.lightGray} />
              </View>
              <View style={[styles.row, { marginTop: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sub}>Total Contributed</Text>
                  <Text style={styles.val}>{formatCurrency(groupedISAs.innovative_finance.total)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sub}>Balance</Text>
                  <Text style={[styles.val, { color: Colors.success }]}>{formatCurrency(groupedISAs.innovative_finance.total)}</Text>
                </View>
              </View>

              {expandedISA === 'innovative_finance' && filteredContributions.filter(c => c.isaType === 'innovative_finance').length > 0 && (
                <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.glassLight }}>
                  <Text style={[styles.sub, { marginBottom: 12, fontWeight: '600' }]}>Contributions:</Text>
                  {filteredContributions.filter(c => c.isaType === 'innovative_finance').map((contribution) => (
                    <View key={contribution.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingLeft: 12, paddingVertical: 8, backgroundColor: contribution.withdrawn ? 'rgba(255, 165, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)', borderRadius: 8, borderWidth: contribution.withdrawn ? 1 : 0, borderColor: contribution.withdrawn ? 'rgba(255, 165, 0, 0.3)' : 'transparent' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.sub}>{contribution.provider}</Text>
                          {contribution.withdrawn && (
                            <Text style={{ fontSize: 10, color: Colors.warning, fontWeight: '600', backgroundColor: 'rgba(255, 165, 0, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>WITHDRAWN</Text>
                          )}
                        </View>
                        <Text style={[styles.sub, { fontSize: 12, opacity: 0.7, marginTop: 2 }]}>
                          {new Date(contribution.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={[styles.val, { marginRight: 8, textDecorationLine: contribution.withdrawn ? 'line-through' : 'none', opacity: contribution.withdrawn ? 0.6 : 1 }]}>{formatCurrency(contribution.amount)}</Text>
                      {!contribution.withdrawn && (
                        <>
                          <TouchableOpacity
                            onPress={() => handleEditContribution(contribution)}
                            style={{ padding: 8 }}
                            activeOpacity={0.6}
                          >
                            <Ionicons name="create-outline" size={20} color={Colors.gold} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleWithdrawContribution(contribution.id)}
                            style={{ padding: 8 }}
                            activeOpacity={0.6}
                          >
                            <Ionicons name="arrow-undo-outline" size={20} color={Colors.warning} />
                          </TouchableOpacity>
                        </>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDeleteContribution(contribution.id)}
                        style={{ padding: 8 }}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                      </TouchableOpacity>
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

      {/* Edit ISA Contribution Modal */}
      <EditISAContributionModal
        visible={editContributionVisible}
        onClose={() => {
          setEditContributionVisible(false);
          setSelectedContribution(null);
        }}
        onUpdate={handleUpdateContribution}
        contribution={selectedContribution}
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
});
