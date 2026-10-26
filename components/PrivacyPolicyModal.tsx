import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from './Modal';
import { Colors, Spacing, Type } from '@/constants/theme';

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
    >
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>
          <Text style={styles.introText}>
            This Privacy Policy explains how FinNest collects, uses, stores, and protects your personal information. We are committed to protecting your privacy and complying with UK GDPR.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
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

          <Text style={styles.subsectionTitle}>Registered User Accounts</Text>
          <Text style={styles.paragraph}>
            If you create a FinNest account, we may collect:
          </Text>
          <Text style={styles.bulletPoint}>• Email address and login credentials</Text>
          <Text style={styles.bulletPoint}>• Financial tracking data associated with your account</Text>
          <Text style={styles.paragraph}>
            This data is stored securely on our servers and used only to provide features such as saving and syncing data across devices.
          </Text>

          <Text style={styles.subsectionTitle}>Future Optional Integrations</Text>
          <Text style={styles.paragraph}>
            If you choose to connect external services (such as ISA providers), we will only access and use that information with your explicit consent and solely to provide features you request.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
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
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>

          <Text style={styles.subsectionTitle}>Local Storage</Text>
          <Text style={styles.paragraph}>
            Financial tracking data (ISA contributions, amounts, dates) for guest users is stored locally on your device. It will be lost if you delete the app or reset your device.
          </Text>

          <Text style={styles.subsectionTitle}>Server Storage</Text>
          <Text style={styles.paragraph}>
            For registered users, account and financial tracking data is stored securely on our servers with encryption and access controls.
          </Text>

          <Text style={styles.subsectionTitle}>Security Measures</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your data. Where data is transmitted (such as analytics or optional integrations), it is encrypted in transit.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
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
            Note: For data stored only on your device, you may need to manage or delete it directly in the app. Registered users may request deletion of account data through the app or by contacting us.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Sharing</Text>
          <Text style={styles.paragraph}>
            We may share limited data with trusted third-party service providers who assist us with analytics, hosting, authentication, or app performance monitoring.
          </Text>
          <Text style={styles.paragraph}>
            We will never sell, rent, or trade your personal information for marketing purposes.
          </Text>

          <Text style={styles.subsectionTitle}>Future Optional Integrations</Text>
          <Text style={styles.paragraph}>
            Any connection to external financial services will only occur with your explicit consent, and you may revoke access at any time.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            FinNest is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from children.
          </Text>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. The "Last Updated" date will reflect the most recent version, and for material changes we will post a clear notice in the app. Continued use of FinNest after an update indicates your acceptance of the revised Privacy Policy.
          </Text>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy or your personal information, please contact us at:
          </Text>
          <Text style={styles.contactText}>Email: privacy@finnest.app</Text>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Information Commissioner's Office</Text>
          <Text style={styles.paragraph}>
            You have the right to lodge a complaint with the UK's data protection authority:
          </Text>
          <Text style={styles.bulletPoint}>Website: https://ico.org.uk</Text>
          <Text style={styles.bulletPoint}>Helpline: 0303 123 1113</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Spacing.lg,
  },
  headerSection: {
    paddingBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderStrong,
  },
  lastUpdated: {
    ...Type.caption,
    color: Colors.textTertiary,
  },
  introText: {
    ...Type.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    ...Type.headline,
  },
  subsectionTitle: {
    ...Type.bodyStrong,
    marginTop: 20,
  },
  paragraph: {
    ...Type.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  bulletPoint: {
    ...Type.body,
    color: Colors.textSecondary,
    marginTop: 6,
    paddingLeft: Spacing.xs,
  },
  contactText: {
    ...Type.body,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});
