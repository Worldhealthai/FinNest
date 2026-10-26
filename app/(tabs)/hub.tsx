import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCelebration from '@/components/ConfettiCelebration';
import { withErrorBoundary } from '@/components/ErrorBoundary';
import Modal from '@/components/Modal';
import { ISAContribution } from '@/components/AddISAContributionModal';
import { Screen, Card, Button, ListItem, ListGroup, ProgressBar, SectionHeader, Badge, IconTile } from '@/components/ui';
import { Colors, Type, Spacing } from '@/constants/theme';
import {
  ISA_INFO,
  ISA_TYPE_ORDER,
  ISA_LABELS,
  ISA_ICONS,
  isaColor,
  EDUCATIONAL_CONTENT,
} from '@/constants/isaData';
import { getCurrentTaxYear, isDateInTaxYear, parseDateKey } from '@/utils/taxYear';
import { calculateConsistency, getLevel, getNextLevel, LEVELS, Level } from '@/utils/consistency';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { loadContributions as loadContributionsDB } from '@/lib/contributions';
import { haptics } from '@/utils/haptics';

const CONTRIBUTIONS_STORAGE_KEY = '@finnest_contributions';
const LEVEL_STORAGE_KEY = '@finnest_user_level';
const READ_ARTICLES_KEY = '@finnest_read_articles';

type Lesson = { title: string; content: string; category: string };

const SECTIONS: { title: string; lessons: Lesson[] }[] = [
  { title: 'Essentials', lessons: [...EDUCATIONAL_CONTENT.BEGINNER, ...EDUCATIONAL_CONTENT.INTERMEDIATE] },
  { title: 'Advanced', lessons: EDUCATIONAL_CONTENT.ADVANCED },
];
const ALL_LESSONS = SECTIONS.flatMap((s) => s.lessons);

const readingTime = (text: string) => `${Math.max(1, Math.round(text.split(/\s+/).length / 200))} min read`;

const KEY_RULES = [
  { figure: '£20,000', caption: 'Total you can pay in each tax year' },
  { figure: '£4,000', caption: 'Lifetime ISA limit, plus a 25% bonus' },
  { figure: '5 April', caption: 'Deadline — unused allowance is lost' },
  { figure: 'Multiple', caption: 'ISAs of one type allowed since 2024' },
];

function LearnScreen() {
  const { isGuest } = useOnboarding();
  const [contributions, setContributions] = useState<ISAContribution[]>([]);
  const [readLessons, setReadLessons] = useState<string[]>([]);
  // undefined = not loaded yet; null = no level stored (first visit)
  const [storedLevel, setStoredLevel] = useState<number | null | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  const [openLesson, setOpenLesson] = useState<Lesson | null>(null);
  const [openType, setOpenType] = useState<string | null>(null);
  const [showLevels, setShowLevels] = useState(false);
  const [celebrate, setCelebrate] = useState<Level | null>(null);

  const loadData = useCallback(async () => {
    try {
      if (isGuest) {
        const saved = await AsyncStorage.getItem(CONTRIBUTIONS_STORAGE_KEY);
        setContributions(saved ? JSON.parse(saved) : []);
      } else {
        setContributions(await loadContributionsDB());
      }
      const savedLevel = await AsyncStorage.getItem(LEVEL_STORAGE_KEY);
      setStoredLevel(savedLevel ? parseInt(savedLevel, 10) : null);
      const savedRead = await AsyncStorage.getItem(READ_ARTICLES_KEY);
      const parsedRead = savedRead ? JSON.parse(savedRead) : [];
      setReadLessons(Array.isArray(parsedRead) ? parsedRead : []);
    } catch (error) {
      console.error('Error loading learning data:', error);
    } finally {
      setLoaded(true);
    }
  }, [isGuest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const currentTaxYear = getCurrentTaxYear();
  const yearContributions = useMemo(
    () => contributions.filter((c) => isDateInTaxYear(parseDateKey(c.date), currentTaxYear)),
    [contributions, currentTaxYear.startYear]
  );
  const { score } = calculateConsistency(yearContributions, currentTaxYear.startDate);
  const level = getLevel(score);
  const nextLevel = getNextLevel(level);
  const levelProgress = nextLevel ? (score - level.minScore) / (nextLevel.minScore - level.minScore) : 1;

  // Celebrate only a genuine level-up: the stored level must already exist (so a
  // first visit never fires) and data must be loaded (so the level isn't
  // compared before contributions arrive — which used to show "LEVEL UP!" on
  // every visit).
  useEffect(() => {
    if (!loaded || storedLevel === undefined) return;
    if (storedLevel !== null && level.number > storedLevel) {
      haptics.success();
      setCelebrate(level);
    }
    if (level.number !== storedLevel) {
      setStoredLevel(level.number);
      AsyncStorage.setItem(LEVEL_STORAGE_KEY, String(level.number)).catch(() => {});
    }
  }, [loaded, level.number, storedLevel]);

  const readCount = ALL_LESSONS.filter((l) => readLessons.includes(l.title)).length;
  const nextUnread = ALL_LESSONS.find((l) => !readLessons.includes(l.title)) ?? null;

  const openLessonSheet = (lesson: Lesson) => {
    setOpenLesson(lesson);
    if (!readLessons.includes(lesson.title)) {
      const updated = [...readLessons, lesson.title];
      setReadLessons(updated);
      AsyncStorage.setItem(READ_ARTICLES_KEY, JSON.stringify(updated)).catch(() => {});
    }
  };

  const lessonIndex = openLesson ? ALL_LESSONS.findIndex((l) => l.title === openLesson.title) : -1;
  const followingLesson = lessonIndex >= 0 ? ALL_LESSONS[lessonIndex + 1] ?? null : null;
  const typeInfo = openType ? ISA_INFO[openType] : null;

  return (
    <Screen
      title="Learn"
      subtitle="Short, clear guides to making the most of your ISAs"
      overlay={<ConfettiCelebration show={!!celebrate} />}
    >
      {/* ─── Learning progress ─── */}
      <Card>
        <View style={styles.progressHeader}>
          <View>
            <Text style={Type.overline}>Your progress</Text>
            <Text style={styles.progressTitle}>
              {readCount} of {ALL_LESSONS.length} lessons
            </Text>
          </View>
          {readCount === ALL_LESSONS.length && <Badge label="Complete" tone="positive" />}
        </View>
        <ProgressBar value={readCount / ALL_LESSONS.length} style={styles.progressBar} />
        {nextUnread ? (
          <Button
            title={readCount === 0 ? 'Start first lesson' : 'Continue learning'}
            iconRight="arrow-forward"
            onPress={() => openLessonSheet(nextUnread)}
            style={styles.continueButton}
          />
        ) : (
          <Text style={styles.allDone}>You've read every lesson — nice work.</Text>
        )}
      </Card>

      {/* ─── Lessons ─── */}
      {SECTIONS.map((section) => (
        <View key={section.title}>
          <SectionHeader title={section.title} />
          <ListGroup>
            {section.lessons.map((lesson) => {
              const read = readLessons.includes(lesson.title);
              return (
                <ListItem
                  key={lesson.title}
                  leading={
                    <View style={[styles.lessonMark, read && styles.lessonMarkRead]}>
                      <Ionicons
                        name={read ? 'checkmark' : 'book-outline'}
                        size={16}
                        color={read ? Colors.positive : Colors.textSecondary}
                      />
                    </View>
                  }
                  title={lesson.title}
                  subtitle={`${lesson.category} · ${readingTime(lesson.content)}`}
                  onPress={() => openLessonSheet(lesson)}
                />
              );
            })}
          </ListGroup>
        </View>
      ))}

      {/* ─── ISA types ─── */}
      <SectionHeader title="The four ISA types" />
      <ListGroup>
        {ISA_TYPE_ORDER.map((t) => (
          <ListItem
            key={t}
            icon={ISA_ICONS[t]}
            iconColor={isaColor(t)}
            title={ISA_LABELS[t]}
            subtitle={`${ISA_INFO[t].riskLevel} risk · ${ISA_INFO[t].potentialReturn}`}
            onPress={() => setOpenType(t)}
          />
        ))}
      </ListGroup>

      {/* ─── Key rules ─── */}
      <SectionHeader title="Key rules" />
      <View style={styles.rules}>
        {KEY_RULES.map((rule) => (
          <Card key={rule.figure} style={styles.rule}>
            <Text style={styles.ruleFigure}>{rule.figure}</Text>
            <Text style={styles.ruleCaption}>{rule.caption}</Text>
          </Card>
        ))}
      </View>

      {/* ─── Saver level ─── */}
      <SectionHeader title="Saver level" actionLabel="All levels" onAction={() => setShowLevels(true)} />
      <Card>
        <View style={styles.levelRow}>
          <Text style={styles.levelEmoji}>{level.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.levelName}>
              Level {level.number} · {level.name}
            </Text>
            <Text style={Type.caption}>{level.description}</Text>
          </View>
        </View>
        <ProgressBar value={levelProgress} style={{ marginTop: 16 }} />
        <Text style={styles.levelCaption}>
          {nextLevel
            ? `${score}% consistency · reach ${nextLevel.minScore}% for ${nextLevel.name}`
            : `${score}% consistency · top level reached`}
        </Text>
      </Card>

      {/* ─── Lesson reader ─── */}
      <Modal
        visible={!!openLesson}
        onClose={() => setOpenLesson(null)}
        title={openLesson?.title ?? ''}
        size="auto"
        footer={
          followingLesson ? (
            <Button title="Next lesson" iconRight="arrow-forward" onPress={() => openLessonSheet(followingLesson)} />
          ) : (
            <Button title="Done" onPress={() => setOpenLesson(null)} />
          )
        }
      >
        {openLesson && (
          <>
            <View style={styles.lessonMeta}>
              <Badge label={openLesson.category} tone="accent" />
              <Text style={Type.caption}>{readingTime(openLesson.content)}</Text>
            </View>
            <Text style={styles.lessonBody}>{openLesson.content}</Text>
            <Text style={styles.lessonCounter}>
              Lesson {lessonIndex + 1} of {ALL_LESSONS.length}
            </Text>
          </>
        )}
      </Modal>

      {/* ─── ISA type detail ─── */}
      <Modal
        visible={!!typeInfo}
        onClose={() => setOpenType(null)}
        title={openType ? ISA_LABELS[openType] : ''}
        footer={<Button title="Close" variant="secondary" onPress={() => setOpenType(null)} />}
      >
        {typeInfo && openType && (
          <>
            <View style={styles.typeHeader}>
              <IconTile name={ISA_ICONS[openType]} color={isaColor(openType)} size={48} />
              <View style={styles.typeFacts}>
                <Badge label={`${typeInfo.riskLevel} risk`} tone={typeInfo.riskLevel === 'High' ? 'caution' : 'neutral'} />
                <Text style={styles.typeReturn}>{typeInfo.potentialReturn}</Text>
              </View>
            </View>
            <Text style={styles.typeDescription}>{typeInfo.description}</Text>
            <FactList title="Benefits" items={typeInfo.benefits} icon="checkmark-circle" color={Colors.positive} />
            <FactList title="Things to know" items={typeInfo.risks} icon="alert-circle" color={Colors.caution} />
            <FactList title="Best for" items={typeInfo.bestFor} icon="person-circle" color={Colors.accent} />
          </>
        )}
      </Modal>

      {/* ─── All levels ─── */}
      <Modal visible={showLevels} onClose={() => setShowLevels(false)} title="Saver levels" size="auto">
        <Text style={styles.levelsIntro}>
          Levels follow your consistency score — pay in during more months of the tax year to climb.
        </Text>
        <ListGroup>
          {LEVELS.map((l) => {
            const current = l.number === level.number;
            const unlocked = score >= l.minScore;
            return (
              <ListItem
                key={l.number}
                leading={<Text style={[styles.levelsEmoji, !unlocked && { opacity: 0.35 }]}>{l.emoji}</Text>}
                title={l.name}
                subtitle={`From ${l.minScore}% · ${l.reward}`}
                muted={!unlocked}
                right={current ? <Badge label="You" tone="accent" /> : undefined}
              />
            );
          })}
        </ListGroup>
      </Modal>

      {/* ─── Level up ─── */}
      <Modal
        visible={!!celebrate}
        onClose={() => setCelebrate(null)}
        title="Level up"
        size="auto"
        showCloseButton={false}
        footer={<Button title="Keep going" onPress={() => setCelebrate(null)} />}
      >
        {celebrate && (
          <View style={styles.celebrate}>
            <Text style={styles.celebrateEmoji}>{celebrate.emoji}</Text>
            <Text style={styles.celebrateTitle}>
              Level {celebrate.number} · {celebrate.name}
            </Text>
            <Text style={styles.celebrateText}>{celebrate.description}</Text>
            <Badge label={`Unlocked: ${celebrate.reward}`} tone="positive" style={{ alignSelf: 'center', marginTop: 16 }} />
          </View>
        )}
      </Modal>
    </Screen>
  );
}

function FactList({
  title,
  items,
  icon,
  color,
}: {
  title: string;
  items: string[];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={styles.factList}>
      <Text style={styles.factTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item} style={styles.factRow}>
          <Ionicons name={icon} size={16} color={color} style={{ marginTop: 3 }} />
          <Text style={styles.factText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default withErrorBoundary(LearnScreen);

const styles = StyleSheet.create({
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressTitle: {
    ...Type.title2,
    marginTop: 4,
  },
  progressBar: {
    marginTop: 16,
  },
  continueButton: {
    marginTop: 20,
  },
  allDone: {
    ...Type.callout,
    marginTop: 16,
  },
  lessonMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonMarkRead: {
    borderColor: 'rgba(52, 211, 153, 0.4)',
    backgroundColor: Colors.positiveMuted,
  },
  rules: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rule: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: 16,
  },
  ruleFigure: {
    ...Type.headline,
    color: Colors.accent,
  },
  ruleCaption: {
    ...Type.caption,
    marginTop: 4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  levelEmoji: {
    fontSize: 36,
  },
  levelName: {
    ...Type.headline,
    marginBottom: 2,
  },
  levelCaption: {
    ...Type.caption,
    marginTop: 10,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  lessonBody: {
    ...Type.body,
    fontSize: 17,
    lineHeight: 27,
  },
  lessonCounter: {
    ...Type.caption,
    color: Colors.textTertiary,
    marginTop: 20,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  typeFacts: {
    flex: 1,
    gap: 6,
  },
  typeReturn: {
    ...Type.caption,
  },
  typeDescription: {
    ...Type.body,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  factList: {
    marginTop: Spacing.lg,
  },
  factTitle: {
    ...Type.overline,
    marginBottom: 10,
  },
  factRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  factText: {
    ...Type.body,
    flex: 1,
  },
  levelsIntro: {
    ...Type.callout,
    marginBottom: Spacing.md,
  },
  levelsEmoji: {
    fontSize: 26,
    width: 36,
    textAlign: 'center',
  },
  celebrate: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  celebrateEmoji: {
    fontSize: 64,
  },
  celebrateTitle: {
    ...Type.title2,
    marginTop: 12,
    textAlign: 'center',
  },
  celebrateText: {
    ...Type.callout,
    marginTop: 4,
    textAlign: 'center',
  },
});
