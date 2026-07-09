import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import AnimatedBackground from '@/components/AnimatedBackground';
import ConfettiCelebration from '@/components/ConfettiCelebration';
import GlassCard from '@/components/GlassCard';
import { withErrorBoundary } from '@/components/ErrorBoundary';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { ISA_INFO, ISA_ANNUAL_ALLOWANCE, LIFETIME_ISA_MAX, EDUCATIONAL_CONTENT, formatCurrency } from '@/constants/isaData';
import { getCurrentTaxYear, isDateInTaxYear, parseDateKey } from '@/utils/taxYear';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { loadContributions as loadContributionsDB } from '@/lib/contributions';

const CONTRIBUTIONS_STORAGE_KEY = '@finnest_contributions';
const LEVEL_STORAGE_KEY = '@finnest_user_level';
const READ_ARTICLES_KEY = '@finnest_read_articles';

// All learning content, grouped for display
const LEARNING_SECTIONS = [
  { key: 'essentials', title: 'ISA Essentials', items: [...EDUCATIONAL_CONTENT.BEGINNER, ...EDUCATIONAL_CONTENT.INTERMEDIATE] },
  { key: 'advanced', title: 'Advanced Strategies', items: EDUCATIONAL_CONTENT.ADVANCED },
];

const TOTAL_ARTICLES = LEARNING_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

interface ISAContribution {
  id: string;
  isaType: string;
  provider: string;
  amount: number;
  date: string;
  deleted?: boolean;
  deletedDate?: string;
}

// Level configuration with unlockable rewards
const LEVELS = [
  { number: 1, name: 'Seedling', emoji: '🌱', color: '#90EE90', minScore: 0, maxScore: 15, description: 'Your ISA journey begins', reward: 'Welcome Badge', rewardIcon: 'ribbon' },
  { number: 2, name: 'Sprout', emoji: '🌿', color: '#7FD87F', minScore: 15, maxScore: 30, description: 'Growing your savings habit', reward: 'Consistent Saver Badge', rewardIcon: 'leaf' },
  { number: 3, name: 'Sapling', emoji: '🌳', color: '#6BC76B', minScore: 30, maxScore: 50, description: 'Building consistent momentum', reward: 'Momentum Builder Badge', rewardIcon: 'trending-up' },
  { number: 4, name: 'Bronze Investor', emoji: '🥉', color: '#CD7F32', minScore: 50, maxScore: 65, description: 'Halfway to ISA mastery', reward: 'Bronze Achievement', rewardIcon: 'medal' },
  { number: 5, name: 'Silver Champion', emoji: '🥈', color: '#C0C0C0', minScore: 65, maxScore: 80, description: 'Excellence in saving', reward: 'Silver Achievement', rewardIcon: 'trophy' },
  { number: 6, name: 'Gold Pro', emoji: '🥇', color: Colors.gold, minScore: 80, maxScore: 90, description: 'Elite investor status', reward: 'Gold Achievement', rewardIcon: 'star' },
  { number: 7, name: 'ISA Master', emoji: '👑', color: '#FFD700', minScore: 90, maxScore: 100, description: 'Legendary dedication', reward: 'Master Crown', rewardIcon: 'diamond' },
];

// Helper function to get monthly heatmap
const getMonthlyHeatmap = (contributions: ISAContribution[]) => {
  const currentTaxYear = getCurrentTaxYear();
  const yearContributions = contributions.filter(c =>
    !c.withdrawn && isDateInTaxYear(parseDateKey(c.date), currentTaxYear)
  );

  if (yearContributions.length === 0) {
    return Array(12).fill(false);
  }

  const monthsWithContributions = new Set(
    yearContributions.map(c => parseDateKey(c.date).getMonth())
  );

  const taxYearStart = currentTaxYear.startDate.getMonth();
  const monthlyHeatmap = Array(12).fill(false);
  monthsWithContributions.forEach(month => {
    const taxYearMonth = (month - taxYearStart + 12) % 12;
    monthlyHeatmap[taxYearMonth] = true;
  });

  return monthlyHeatmap;
};

// Calculate Consistency Score - Simple & Transparent
const calculateConsistencyScore = (contributions: ISAContribution[]) => {
  if (contributions.length === 0) {
    return { score: 0 };
  }

  const currentTaxYear = getCurrentTaxYear();

  // Get contributions for current tax year only (exclude withdrawn)
  const yearContributions = contributions.filter(c =>
    !c.withdrawn && isDateInTaxYear(parseDateKey(c.date), currentTaxYear)
  );

  if (yearContributions.length === 0) {
    return { score: 0 };
  }

  // BASE SCORE: Simple monthly coverage (0-100%)
  const monthsWithContributions = new Set(
    yearContributions.map(c => {
      const date = parseDateKey(c.date);
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
  const firstContribution = new Date(Math.min(...yearContributions.map(c => parseDateKey(c.date).getTime())));
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

  return { score: totalScore };
};

// Get current level based on score
const getCurrentLevel = (score: number) => {
  return LEVELS.find(level => score >= level.minScore && score < level.maxScore) || LEVELS[0];
};

// Get next level
const getNextLevel = (currentLevelNumber: number) => {
  return LEVELS.find(level => level.number === currentLevelNumber + 1) || null;
};

function HubScreen() {
  const { isGuest } = useOnboarding();
  const [expandedISA, setExpandedISA] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [contributions, setContributions] = useState<ISAContribution[]>([]);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newlyUnlockedLevel, setNewlyUnlockedLevel] = useState<typeof LEVELS[0] | null>(null);

  // Load saved ISA data and previous level
  const loadISAData = async () => {
    try {
      // Authenticated users store contributions in Supabase; only guests use
      // AsyncStorage. Loading only from AsyncStorage left signed-in users with
      // an empty Hub (level stuck at Seedling, no streaks).
      if (isGuest) {
        const savedData = await AsyncStorage.getItem(CONTRIBUTIONS_STORAGE_KEY);
        setContributions(savedData ? JSON.parse(savedData) : []);
      } else {
        const data = await loadContributionsDB();
        setContributions(data);
      }

      const savedLevel = await AsyncStorage.getItem(LEVEL_STORAGE_KEY);
      if (savedLevel) {
        setPreviousLevel(parseInt(savedLevel, 10));
      }

      const savedRead = await AsyncStorage.getItem(READ_ARTICLES_KEY);
      if (savedRead) {
        const parsed = JSON.parse(savedRead);
        if (Array.isArray(parsed)) {
          setReadArticles(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
    }
  };

  // Toggle a learning card open/closed; first open marks it as read
  const toggleArticle = (title: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    const opening = expandedArticle !== title;
    setExpandedArticle(opening ? title : null);

    if (opening && !readArticles.includes(title)) {
      const updated = [...readArticles, title];
      setReadArticles(updated);
      AsyncStorage.setItem(READ_ARTICLES_KEY, JSON.stringify(updated)).catch((error) =>
        console.error('Error saving read articles:', error)
      );
    }
  };

  // Save current level
  const saveCurrentLevel = async (level: number) => {
    try {
      await AsyncStorage.setItem(LEVEL_STORAGE_KEY, level.toString());
    } catch (error) {
      console.error('Error saving level:', error);
    }
  };

  // Load on mount
  useEffect(() => {
    loadISAData();
  }, []);

  // Reload whenever the hub tab is focused
  useFocusEffect(
    React.useCallback(() => {
      loadISAData();
    }, [])
  );

  // Filter contributions by current tax year
  const currentTaxYear = getCurrentTaxYear();
  const currentYearContributions = contributions.filter(contribution =>
    isDateInTaxYear(parseDateKey(contribution.date), currentTaxYear)
  );

  // Calculate consistency score and level
  const { score } = calculateConsistencyScore(currentYearContributions);
  const currentLevel = getCurrentLevel(score);
  const nextLevel = getNextLevel(currentLevel.number);

  // Calculate progress to next level
  const progressToNext = nextLevel
    ? ((score - currentLevel.minScore) / (nextLevel.minScore - currentLevel.minScore)) * 100
    : 100;

  // Calculate months needed for next level
  const monthsNeeded = nextLevel
    ? Math.ceil((nextLevel.minScore - score) / (100 / 12))
    : 0;

  // Check for level up
  useEffect(() => {
    if (previousLevel !== null && currentLevel.number > previousLevel) {
      // Level up detected!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewlyUnlockedLevel(currentLevel);
      setShowConfetti(true);
      setShowLevelUpModal(true);

      // Hide confetti after 3.5 seconds
      setTimeout(() => setShowConfetti(false), 3500);
    }

    if (currentLevel.number !== previousLevel) {
      saveCurrentLevel(currentLevel.number);
      setPreviousLevel(currentLevel.number);
    }
  }, [currentLevel.number]);

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <ConfettiCelebration show={showConfetti} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>ISA Hub</Text>
              <Text style={styles.subtitle}>Essential ISA knowledge and resources</Text>
            </View>
            <Image source={require('@/assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Learning progress */}
          <View style={styles.learnProgressCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.learnProgressTitle}>Your Learning Journey</Text>
              <Text style={styles.sub}>
                {readArticles.length === TOTAL_ARTICLES
                  ? '🎓 All lessons complete — ISA expert!'
                  : `${readArticles.length} of ${TOTAL_ARTICLES} lessons read — tap a card to learn`}
              </Text>
            </View>
            <View style={styles.learnProgressRing}>
              <Text style={styles.learnProgressCount}>
                {readArticles.length}/{TOTAL_ARTICLES}
              </Text>
            </View>
          </View>

          {/* Learning content — tappable, expandable cards */}
          {LEARNING_SECTIONS.map((section) => (
            <View key={section.key}>
              <Text style={styles.section}>{section.title}</Text>
              {section.items.map((item) => {
                const isOpen = expandedArticle === item.title;
                const isRead = readArticles.includes(item.title);
                return (
                  <Pressable
                    key={item.title}
                    onPress={() => toggleArticle(item.title)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  >
                    <View style={[styles.card, isOpen && styles.cardActive]}>
                      <View style={styles.row}>
                        <View style={[styles.readDot, isRead && styles.readDotDone]}>
                          <Ionicons
                            name={isRead ? 'checkmark' : 'book-outline'}
                            size={14}
                            color={isRead ? Colors.deepNavy : Colors.gold}
                          />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.eduTitle}>{item.title}</Text>
                          {!isOpen && (
                            <Text style={[styles.sub, { marginTop: 4 }]} numberOfLines={2}>
                              {item.content}
                            </Text>
                          )}
                        </View>
                        <Ionicons
                          name={isOpen ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color={Colors.lightGray}
                        />
                      </View>
                      {isOpen && (
                        <View style={{ marginTop: 12 }}>
                          <Text style={[styles.sub, { lineHeight: 22 }]}>{item.content}</Text>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.category}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}

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

          {/* ISA Master Level Section */}
          <Text style={styles.section}>ISA Master Level</Text>

          <View style={styles.card}>
            {/* Current Level Display */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 64, marginBottom: 8 }}>{currentLevel.emoji}</Text>
              <Text style={{ fontSize: Typography.sizes.xxl, color: currentLevel.color, fontWeight: Typography.weights.extrabold }}>
                Level {currentLevel.number}: {currentLevel.name}
              </Text>
              <Text style={{ fontSize: Typography.sizes.sm, color: Colors.lightGray, marginTop: 4 }}>
                {currentLevel.description}
              </Text>

              {/* Unlocked Reward */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: currentLevel.color + '20', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                <Ionicons name={currentLevel.rewardIcon as any} size={16} color={currentLevel.color} />
                <Text style={{ fontSize: Typography.sizes.xs, color: currentLevel.color, marginLeft: 6, fontWeight: Typography.weights.bold }}>
                  {currentLevel.reward} Unlocked
                </Text>
              </View>
            </View>

            {/* Motivational Progress Nudge */}
            {nextLevel && monthsNeeded > 0 && (
              <View style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="sparkles" size={20} color={Colors.gold} />
                  <Text style={{ fontSize: Typography.sizes.sm, color: Colors.gold, marginLeft: 8, fontWeight: Typography.weights.bold, flex: 1 }}>
                    {monthsNeeded === 1
                      ? "🎯 Just 1 more month to level up!"
                      : `🚀 Contribute in ${monthsNeeded} more months to reach ${nextLevel.name}!`}
                  </Text>
                </View>
              </View>
            )}

            {/* Progress to Next Level */}
            {nextLevel ? (
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: Typography.sizes.sm, color: Colors.lightGray }}>
                    Progress to {nextLevel.name} {nextLevel.emoji}
                  </Text>
                  <Text style={{ fontSize: Typography.sizes.sm, color: Colors.gold, fontWeight: Typography.weights.bold }}>
                    {Math.round(progressToNext)}%
                  </Text>
                </View>
                <View style={{ height: 12, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 6, overflow: 'hidden' }}>
                  <LinearGradient
                    colors={[currentLevel.color, nextLevel.color]}
                    style={{ width: `${Math.min(100, progressToNext)}%`, height: '100%' }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                  <Text style={{ fontSize: Typography.sizes.xs, color: Colors.lightGray }}>
                    {score}% Consistency Score
                  </Text>
                  <Text style={{ fontSize: Typography.sizes.xs, color: Colors.lightGray }}>
                    {nextLevel.minScore}% needed
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ marginBottom: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: Typography.sizes.md, color: Colors.gold, fontWeight: Typography.weights.bold }}>
                  🎉 Maximum Level Achieved! 🎉
                </Text>
                <Text style={{ fontSize: Typography.sizes.sm, color: Colors.lightGray, marginTop: 4 }}>
                  You've reached ISA Master status!
                </Text>
              </View>
            )}

            {/* All Levels Display */}
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: Typography.sizes.sm, color: Colors.lightGray, marginBottom: 12, fontWeight: Typography.weights.semibold }}>
                All Levels
              </Text>

              {LEVELS.map((level) => {
                const isCurrent = level.number === currentLevel.number;
                const isUnlocked = score >= level.minScore;

                return (
                  <View
                    key={level.number}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      marginBottom: 8,
                      backgroundColor: isCurrent ? level.color + '20' : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 12,
                      borderWidth: isCurrent ? 2 : 1,
                      borderColor: isCurrent ? level.color : 'rgba(255, 255, 255, 0.1)',
                      opacity: isUnlocked ? 1 : 0.5,
                    }}
                  >
                    <Text style={{ fontSize: 32, marginRight: 12 }}>{level.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: Typography.sizes.md, color: Colors.white, fontWeight: Typography.weights.semibold }}>
                          {level.name}
                        </Text>
                        {isCurrent && (
                          <View style={{ marginLeft: 8, backgroundColor: level.color, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                            <Text style={{ fontSize: Typography.sizes.xs, color: Colors.deepNavy, fontWeight: Typography.weights.bold }}>
                              CURRENT
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: Typography.sizes.xs, color: Colors.lightGray, marginTop: 2 }}>
                        {level.description} • {level.minScore}-{level.maxScore}% score
                      </Text>
                    </View>
                    <Text style={{ fontSize: Typography.sizes.lg, color: Colors.lightGray, fontWeight: Typography.weights.bold }}>
                      {level.number}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Level Up Celebration Modal */}
      <Modal
        visible={showLevelUpModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLevelUpModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLevelUpModal(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <GlassCard style={styles.levelUpModal} intensity="dark">
              {newlyUnlockedLevel && (
                <>
                  <Text style={{ fontSize: 72, textAlign: 'center', marginBottom: 16 }}>
                    {newlyUnlockedLevel.emoji}
                  </Text>
                  <Text style={{ fontSize: Typography.sizes.xxxl, color: newlyUnlockedLevel.color, fontWeight: Typography.weights.extrabold, textAlign: 'center' }}>
                    LEVEL UP!
                  </Text>
                  <Text style={{ fontSize: Typography.sizes.xl, color: Colors.white, fontWeight: Typography.weights.bold, textAlign: 'center', marginTop: 12 }}>
                    Level {newlyUnlockedLevel.number}: {newlyUnlockedLevel.name}
                  </Text>
                  <Text style={{ fontSize: Typography.sizes.md, color: Colors.lightGray, textAlign: 'center', marginTop: 8 }}>
                    {newlyUnlockedLevel.description}
                  </Text>

                  {/* Reward Unlocked */}
                  <View style={{ marginTop: 24, backgroundColor: newlyUnlockedLevel.color + '20', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: newlyUnlockedLevel.color }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                      <Ionicons name="gift" size={24} color={newlyUnlockedLevel.color} />
                      <Text style={{ fontSize: Typography.sizes.lg, color: newlyUnlockedLevel.color, fontWeight: Typography.weights.bold, marginLeft: 8 }}>
                        Reward Unlocked!
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={newlyUnlockedLevel.rewardIcon as any} size={20} color={newlyUnlockedLevel.color} />
                      <Text style={{ fontSize: Typography.sizes.md, color: Colors.white, marginLeft: 8, fontWeight: Typography.weights.semibold }}>
                        {newlyUnlockedLevel.reward}
                      </Text>
                    </View>
                  </View>

                  {/* Next Goal */}
                  {getNextLevel(newlyUnlockedLevel.number) && (
                    <View style={{ marginTop: 20, padding: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12 }}>
                      <Text style={{ fontSize: Typography.sizes.sm, color: Colors.lightGray, textAlign: 'center' }}>
                        Next: {getNextLevel(newlyUnlockedLevel.number)?.name} {getNextLevel(newlyUnlockedLevel.number)?.emoji}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowLevelUpModal(false);
                    }}
                    style={({ pressed }) => [
                      {
                        marginTop: 24,
                        backgroundColor: newlyUnlockedLevel.color,
                        paddingVertical: 14,
                        borderRadius: 12,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: Typography.sizes.md, color: Colors.deepNavy, fontWeight: Typography.weights.bold, textAlign: 'center' }}>
                      Awesome!
                    </Text>
                  </Pressable>
                </>
              )}
            </GlassCard>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default withErrorBoundary(HubScreen);

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
  cardActive: {
    borderColor: 'rgba(255, 215, 0, 0.4)',
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
  },
  readDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.gold + '60',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readDotDone: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  learnProgressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    marginBottom: Spacing.sm,
  },
  learnProgressTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
  },
  learnProgressRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  learnProgressCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.gold,
    fontWeight: Typography.weights.extrabold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  levelUpModal: {
    width: '100%',
    maxWidth: 400,
    padding: Spacing.xl,
  },
});
