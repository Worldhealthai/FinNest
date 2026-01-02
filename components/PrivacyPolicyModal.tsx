import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Modal from './Modal';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ visible, onClose }: PrivacyPolicyModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Privacy Policy"
      icon="shield-checkmark"
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>
            <Text style={styles.introText}>
              This Privacy Policy explains how FinNest collects, uses, stores, and protects your personal information. We are committed to protecting your privacy and complying with UK GDPR.
            </Text>
          </View>

          {/* Section 1 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>1. Information We Collect</Text>

              <Text style={styles.subsectionTitle}>Financial Tracking Data (Stored Locally)</Text>
              <Text style={styles.paragraph}>
                When you use FinNest to track your ISA contributions, you may enter:
              </Text>
              <Text style={styles.bulletPoint}>• ISA contribution amounts</Text>
              <Text style={styles.bulletPoint}>• Contribution dates</Text>
              <Text style={styles.bulletPoint}>• ISA provider names</Text>
              <Text style={styles.bulletPoint}>• ISA account types</Text>

              <Text style={styles.paragraph}>
                This data is stored locally on your device. Because it is stored only on your device, FinNest cannot access, retrieve, or delete this information on your behalf. You control this data directly within the app.
              </Text>

              <Text style={styles.subsectionTitle}>Device Information</Text>
              <Text style={styles.paragraph}>
                We may collect device type, operating system version, and app version for analytics purposes only.
              </Text>
            </View>
          </View>

          {/* Section 2 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
              <Text style={styles.paragraph}>
                We use the information we collect to:
              </Text>
              <Text style={styles.bulletPoint}>• Provide and operate the FinNest service</Text>
              <Text style={styles.bulletPoint}>• Calculate ISA allowances and contributions</Text>
              <Text style={styles.bulletPoint}>• Display your contribution history</Text>
              <Text style={styles.bulletPoint}>• Improve our app and fix bugs</Text>
              <Text style={styles.bulletPoint}>• Provide customer support</Text>

              <Text style={styles.paragraph}>
                We process personal data based on your consent, our legitimate interest in operating and improving the app, and to comply with legal obligations where applicable.
              </Text>

              <Text style={styles.subsectionTitle}>Future Optional Integrations</Text>
              <Text style={styles.paragraph}>
                If you choose to connect external services (such as ISA providers) in the future, we will only access and use that information with your explicit consent and solely to provide features you request.
              </Text>
            </View>
          </View>

          {/* Section 3 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>

              <Text style={styles.subsectionTitle}>Local Storage</Text>
              <Text style={styles.paragraph}>
                Financial tracking data (ISA contributions, amounts, dates) is stored locally on your device. This data:
              </Text>
              <Text style={styles.bulletPoint}>• Remains on your device unless you delete the app</Text>
              <Text style={styles.bulletPoint}>• Will be lost if you delete the app or reset your device</Text>
              <Text style={styles.bulletPoint}>• You control this data directly within the app</Text>

              <Text style={styles.subsectionTitle}>Security Measures</Text>
              <Text style={styles.paragraph}>
                We implement appropriate technical and organizational measures to protect your data, including secure coding standards and secure local storage practices. Where data is transmitted (such as analytics or future optional integrations), it is encrypted in transit.
              </Text>
            </View>
          </View>

          {/* Section 4 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>4. Your Rights</Text>
              <Text style={styles.paragraph}>
                You have the following rights regarding your personal information:
              </Text>
              <Text style={styles.bulletPoint}>• Right of Access – Request a copy of your data</Text>
              <Text style={styles.bulletPoint}>• Right to Rectification – Correct inaccurate information</Text>
              <Text style={styles.bulletPoint}>• Right to Erasure – Request deletion of your data</Text>
              <Text style={styles.bulletPoint}>• Right to Data Portability – Receive your data in a portable format</Text>
              <Text style={styles.bulletPoint}>• Right to Object – Object to certain processing activities</Text>
              <Text style={styles.bulletPoint}>• Right to Lodge a Complaint – Contact the ICO</Text>

              <Text style={styles.paragraph}>
                Note: Where personal data is stored only on your device, FinNest may not be able to directly fulfil certain rights (such as access, portability, or erasure). In these cases, you can exercise your rights by managing or deleting the data within the app or by uninstalling the app.
              </Text>
            </View>
          </View>

          {/* Section 5 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>5. Data Sharing</Text>
              <Text style={styles.paragraph}>
                We may share limited data with trusted third-party service providers who assist us with analytics and app performance monitoring.
              </Text>
              <Text style={styles.paragraph}>
                We will NEVER sell, rent, or trade your personal information to third parties for marketing purposes.
              </Text>

              <Text style={styles.subsectionTitle}>Future Optional Integrations</Text>
              <Text style={styles.paragraph}>
                In the future, FinNest may offer optional integrations with regulated financial service providers (such as ISA platforms). Any such connection will only occur with your explicit consent, and we will clearly explain what data is accessed, how it is used, and how you can revoke access at any time.
              </Text>
            </View>
          </View>

          {/* Section 6 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
              <Text style={styles.paragraph}>
                FinNest is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from children.
              </Text>
            </View>
          </View>

          {/* Section 7 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>7. Changes to This Policy</Text>
              <Text style={styles.paragraph}>
                We may update this Privacy Policy from time to time. The "Last Updated" date will reflect the most recent version, and for material changes we will post a clear notice in the app. Continued use of FinNest after an update indicates your acceptance of the revised Privacy Policy.
              </Text>
            </View>
          </View>

          {/* Section 8 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>8. Contact Us</Text>
              <Text style={styles.paragraph}>
                If you have questions about this Privacy Policy or your personal information, please contact us at:
              </Text>
              <Text style={styles.contactText}>Email: privacy@finnest.app</Text>
            </View>
          </View>

          {/* Section 9 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>9. Information Commissioner's Office</Text>
              <Text style={styles.paragraph}>
                You have the right to lodge a complaint with the UK's supervisory authority for data protection:
              </Text>
              <Text style={styles.bulletPoint}>• Website: https://ico.org.uk</Text>
              <Text style={styles.bulletPoint}>• Helpline: 0303 123 1113</Text>
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
    // Inner grey-blue box
    backgroundColor: 'rgba(89, 103, 125, 0.5)',
    borderRadius: 12,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
    textAlign: 'left',
  },
  subsectionTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  bulletPoint: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 22,
    marginBottom: Spacing.xs,
    paddingLeft: Spacing.sm,
  },
  highlight: {
    fontSize: Typography.sizes.sm,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    lineHeight: 22,
    marginBottom: Spacing.md,
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
