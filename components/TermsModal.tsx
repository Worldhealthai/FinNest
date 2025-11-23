import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Modal from './Modal';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TermsModal({ visible, onClose }: TermsModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Terms & Conditions"
      icon="document-text"
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.lastUpdated}>Last Updated: November 2025</Text>
            <Text style={styles.introText}>
              Welcome to FinNest. By using our services, you agree to these Terms & Conditions. Please read them carefully.
            </Text>
          </View>

          {/* Section 1 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.paragraph}>
                By accessing and using FinNest, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </Text>
            </View>
          </View>

          {/* Section 2 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>2. Description of Service</Text>
              <Text style={styles.paragraph}>
                FinNest provides a wealth management platform for tracking ISAs, investments, and financial goals. The service is provided "as is" and FinNest reserves the right to modify, suspend, or discontinue the service at any time.
              </Text>
            </View>
          </View>

          {/* Section 3 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>3. User Accounts</Text>
              <Text style={styles.paragraph}>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify FinNest immediately of any unauthorized use of your account.
              </Text>
            </View>
          </View>

          {/* Section 4 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>4. Financial Information</Text>
              <Text style={styles.paragraph}>
                The information provided through FinNest is for informational purposes only and should not be considered as financial advice. You should consult with qualified financial advisors before making investment decisions.
              </Text>
            </View>
          </View>

          {/* Section 5 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>5. Privacy and Data Protection</Text>
              <Text style={styles.paragraph}>
                Your privacy is important to us. We collect, use, and protect your personal information in accordance with our Privacy Policy and applicable data protection laws including GDPR and UK Data Protection Act 2018.
              </Text>
            </View>
          </View>

          {/* Section 6 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
              <Text style={styles.paragraph}>
                All content, features, and functionality of FinNest are owned by FinNest and are protected by international copyright, trademark, and other intellectual property laws.
              </Text>
            </View>
          </View>

          {/* Section 7 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
              <Text style={styles.paragraph}>
                FinNest shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service. Our total liability shall not exceed the amount paid by you, if any, for accessing the service.
              </Text>
            </View>
          </View>

          {/* Section 8 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>8. Governing Law</Text>
              <Text style={styles.paragraph}>
                These Terms shall be governed by and construed in accordance with the laws of the United Kingdom.
              </Text>
            </View>
          </View>

          {/* Section 9 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>9. ISA Regulations</Text>
              <Text style={styles.paragraph}>
                ISA contributions are subject to HMRC regulations and annual allowance limits. You are responsible for ensuring your contributions comply with current ISA rules. FinNest provides tracking tools but does not guarantee compliance.
              </Text>
            </View>
          </View>

          {/* Section 10 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>10. Third-Party Services</Text>
              <Text style={styles.paragraph}>
                FinNest may integrate with third-party financial institutions and services. We are not responsible for the availability, accuracy, or content of these third-party services.
              </Text>
            </View>
          </View>

          {/* Section 11 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>11. Termination</Text>
              <Text style={styles.paragraph}>
                We reserve the right to terminate or suspend your account at any time without notice for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </Text>
            </View>
          </View>

          {/* Section 12 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
              <Text style={styles.paragraph}>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes. Your continued use of FinNest after such modifications constitutes acceptance of the updated Terms.
              </Text>
            </View>
          </View>

          {/* Section 13 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>13. Contact Information</Text>
              <Text style={styles.paragraph}>
                If you have any questions about these Terms & Conditions, please contact us at:
              </Text>
              <Text style={styles.contactText}>Email: support@finnest.app</Text>
              <Text style={styles.contactText}>Address: FinNest Ltd, London, United Kingdom</Text>
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
  headerSection: {
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: Colors.gold + '30',
  },
  lastUpdated: {
    fontSize: Typography.sizes.sm,
    color: Colors.mediumGray,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  introText: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.sm,
  },
  sectionContainer: {
    // Outer transparent/glass box
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionBox: {
    // Inner grey box
    backgroundColor: 'rgba(45, 45, 45, 0.8)',
    borderRadius: 12,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 22,
    textAlign: 'left',
  },
  contactText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 22,
    marginTop: Spacing.xs,
    paddingLeft: Spacing.md,
  },
});
