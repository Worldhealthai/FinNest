import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Modal from './Modal';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TermsModal({ visible, onClose }: TermsModalProps) {
  const renderDivider = () => <View style={styles.divider} />;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Terms & Conditions"
      icon="document-text"
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.paragraph}>
              Welcome to FinNest. These Terms and Conditions govern your use of the FinNest mobile application and related services.
            </Text>
            <Text style={styles.paragraph}>
              By accessing or using FinNest, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Service.
            </Text>
          </View>
          {renderDivider()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Service Description</Text>
            <Text style={styles.paragraph}>
              FinNest is an educational tracking tool designed to help UK users monitor their Individual Savings Account (ISA) contributions and allowances.
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.subsectionTitle}>What FinNest Does</Text>
              <Text style={styles.bulletPoint}>• Track ISA contributions across multiple providers</Text>
              <Text style={styles.bulletPoint}>• Calculate remaining annual allowance</Text>
              <Text style={styles.bulletPoint}>• Display historical contribution data</Text>
              <Text style={styles.bulletPoint}>• Provide educational information about ISA types</Text>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.subsectionTitle}>What FinNest Does NOT Do</Text>
              <Text style={styles.bulletPoint}>• FinNest does NOT provide financial advice</Text>
              <Text style={styles.bulletPoint}>• FinNest does NOT manage or hold your ISA accounts</Text>
              <Text style={styles.bulletPoint}>• FinNest does NOT execute financial transactions</Text>
              <Text style={styles.bulletPoint}>• FinNest is NOT regulated by the Financial Conduct Authority (FCA)</Text>
            </View>
          </View>
          {renderDivider()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Important Disclaimers</Text>
            <View style={styles.disclaimerBox}>
              <Text style={styles.highlight}>
                THE SERVICE IS FOR INFORMATIONAL AND TRACKING PURPOSES ONLY.
              </Text>
              <Text style={styles.disclaimerText}>
                All information provided through FinNest is for general educational purposes. We do not provide investment advice, tax advice, or financial planning services.
              </Text>
              <Text style={styles.disclaimerText}>
                You should consult with a qualified financial advisor before making any financial decisions.
              </Text>
            </View>
          </View>
          {renderDivider()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
            <Text style={styles.paragraph}>
              You are solely responsible for entering accurate contribution amounts, selecting correct ISA types and providers, and verifying all calculations independently.
            </Text>
            <Text style={styles.paragraph}>
              You must be at least 18 years old to use FinNest.
            </Text>

            <Text style={styles.subsectionTitle}>Prohibited Use</Text>
            <Text style={styles.bulletPoint}>• Use the Service for illegal purposes</Text>
            <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to our systems</Text>
            <Text style={styles.bulletPoint}>• Reverse engineer or disassemble the Service</Text>
            <Text style={styles.bulletPoint}>• Violate any applicable laws or regulations</Text>
          </View>
          {renderDivider()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Data Storage</Text>
            <Text style={styles.paragraph}>
              All ISA contribution data you enter is stored locally on your device using AsyncStorage. We do not store your financial data on our servers or share your contribution data with third parties.
            </Text>
          </View>
          {renderDivider()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              To the fullest extent permitted by law, we shall not be liable for any financial losses resulting from your use of the Service, decisions made based on information in FinNest, or errors in calculations or data entry.
            </Text>
            <Text style={styles.paragraph}>
              We do not exclude or limit liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded under UK law.
            </Text>
          </View>
          {renderDivider()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Changes to the Service</Text>
            <Text style={styles.paragraph}>
              We reserve the right to modify or discontinue the Service at any time, change features or functionality, and update ISA allowance amounts and tax year information.
            </Text>
          </View>
          {renderDivider()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Governing Law</Text>
            <Text style={styles.paragraph}>
              These Terms shall be governed by and construed in accordance with the laws of the United Kingdom.
            </Text>
          </View>
          {renderDivider()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Contact Information</Text>
            <Text style={styles.paragraph}>
              If you have questions about these Terms, please contact us at support@finnest.app
            </Text>
          </View>
          {renderDivider()}

          <View style={styles.acknowledgment}>
            <Text style={styles.acknowledgmentTitle}>BY USING FINNEST, YOU ACKNOWLEDGE THAT:</Text>
            <View style={styles.acknowledgmentContent}>
              <Text style={styles.acknowledgmentBullet}>• You have read and understood these Terms</Text>
              <Text style={styles.acknowledgmentBullet}>• You agree to be bound by these Terms</Text>
              <Text style={styles.acknowledgmentBullet}>• FinNest is not a regulated financial service</Text>
              <Text style={styles.acknowledgmentBullet}>• You will seek professional advice for financial decisions</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 500,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gold + '20',
    marginBottom: Spacing.md,
  },
  lastUpdated: {
    fontSize: Typography.sizes.sm,
    color: Colors.mediumGray,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray + '20',
    marginVertical: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  subsectionTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  paragraph: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 24,
    marginBottom: Spacing.md,
    textAlign: 'justify',
  },
  bulletPoint: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 24,
    marginBottom: Spacing.xs,
    paddingLeft: Spacing.sm,
  },
  infoBox: {
    backgroundColor: Colors.gold + '10',
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
  },
  warningBox: {
    backgroundColor: '#FF6B6B' + '10',
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  disclaimerBox: {
    backgroundColor: Colors.gold + '15',
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
    marginTop: Spacing.sm,
  },
  disclaimerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  highlight: {
    fontSize: Typography.sizes.md,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    lineHeight: 24,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  acknowledgment: {
    backgroundColor: Colors.glassDark,
    padding: Spacing.lg,
    borderRadius: 12,
    marginTop: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.gold + '60',
    shadowColor: Colors.gold,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  acknowledgmentTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  acknowledgmentContent: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gold + '30',
  },
  acknowledgmentBullet: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    lineHeight: 24,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
});
