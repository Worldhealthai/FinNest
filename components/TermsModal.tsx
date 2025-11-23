import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Modal from './Modal';
import GlassCard from './GlassCard';
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
      icon="document-text-outline"
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
      >
        <GlassCard style={styles.contentCard} intensity="medium">
          <Text style={styles.lastUpdated}>Last Updated: November 2024</Text>

          <Text style={styles.intro}>
            Welcome to FinNest. By using our services, you agree to these Terms & Conditions. Please read them carefully.
          </Text>

          {/* Section 1 */}
          <Text style={styles.sectionNumber}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using FinNest, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Text>

          {/* Section 2 */}
          <Text style={styles.sectionNumber}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            FinNest provides a wealth management platform for tracking ISAs, investments, and financial goals. The service is provided "as is" and FinNest reserves the right to modify, suspend, or discontinue the service at any time.
          </Text>

          {/* Section 3 */}
          <Text style={styles.sectionNumber}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify FinNest immediately of any unauthorized use of your account.
          </Text>

          {/* Section 4 */}
          <Text style={styles.sectionNumber}>4. Financial Information</Text>
          <Text style={styles.paragraph}>
            The information provided through FinNest is for informational purposes only and should not be considered as financial advice. You should consult with qualified financial advisors before making investment decisions.
          </Text>

          {/* Section 5 */}
          <Text style={styles.sectionNumber}>5. Privacy and Data Protection</Text>
          <Text style={styles.paragraph}>
            Your privacy is important to us. We collect, use, and protect your personal information in accordance with our Privacy Policy and applicable data protection laws including GDPR and UK Data Protection Act 2018.
          </Text>

          {/* Section 6 */}
          <Text style={styles.sectionNumber}>6. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content, features, and functionality of FinNest are owned by FinNest and are protected by international copyright, trademark, and other intellectual property laws.
          </Text>

          {/* Section 7 */}
          <Text style={styles.sectionNumber}>7. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            FinNest shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service. Our total liability shall not exceed the amount paid by you, if any, for accessing the service.
          </Text>

          {/* Section 8 - Updated Governing Law */}
          <Text style={styles.sectionNumber}>8. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of the United Kingdom.
          </Text>

          {/* Section 9 */}
          <Text style={styles.sectionNumber}>9. ISA Regulations</Text>
          <Text style={styles.paragraph}>
            ISA contributions are subject to HMRC regulations and annual allowance limits. You are responsible for ensuring your contributions comply with current ISA rules. FinNest provides tracking tools but does not guarantee compliance.
          </Text>

          {/* Section 10 */}
          <Text style={styles.sectionNumber}>10. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            FinNest may integrate with third-party financial institutions and services. We are not responsible for the availability, accuracy, or content of these third-party services.
          </Text>

          {/* Section 11 */}
          <Text style={styles.sectionNumber}>11. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to terminate or suspend your account at any time without notice for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
          </Text>

          {/* Section 12 */}
          <Text style={styles.sectionNumber}>12. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. We will notify users of any material changes. Your continued use of FinNest after such modifications constitutes acceptance of the updated Terms.
          </Text>

          {/* Section 13 */}
          <Text style={styles.sectionNumber}>13. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms & Conditions, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>
            Email: support@finnest.app{'\n'}
            Address: FinNest Ltd, London, United Kingdom
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By using FinNest, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
            </Text>
          </View>
        </GlassCard>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 500,
  },
  contentCard: {
    padding: Spacing.lg,
  },
  lastUpdated: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    fontStyle: 'italic',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  intro: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  sectionNumber: {
    fontSize: Typography.sizes.md,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  contactInfo: {
    fontSize: Typography.sizes.sm,
    color: Colors.info,
    lineHeight: 20,
    marginBottom: Spacing.md,
    marginLeft: Spacing.md,
  },
  footer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.glassLight,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
