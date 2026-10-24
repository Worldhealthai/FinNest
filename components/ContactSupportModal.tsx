import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import { Input, Button } from '@/components/ui';
import { Colors, Spacing, Type, BorderRadius } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

interface ContactSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>;

export default function ContactSupportModal({ visible, onClose }: ContactSupportModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sendError, setSendError] = useState<string | null>(null);
  const [messageFocused, setMessageFocused] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // Each visit starts on the form; a pending auto-close never outlives the sheet
  useEffect(() => {
    if (!visible) {
      clearCloseTimer();
      setShowConfirmation(false);
      setErrors({});
      setSendError(null);
    }
  }, [visible]);
  useEffect(() => clearCloseTimer, []);

  const handleSubmit = async () => {
    setSendError(null);

    // Validation
    const newErrors: FieldErrors = {};
    if (!name.trim()) newErrors.name = 'Please enter your name';
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address';
    }
    if (!message.trim()) newErrors.message = 'Please enter a message';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      haptics.warning();
      return;
    }

    setIsSubmitting(true);

    try {
      // Send email using EmailJS
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'service_r611b4a',
          template_id: 'template_nbp84em',
          user_id: '9HKfvJSzUreMPTYZf',
          template_params: {
            to_email: 'kndevapp@gmail.com',
            from_name: name,
            from_email: email,
            message: message,
          },
        }),
      });

      if (response.ok) {
        // Show confirmation message
        setShowConfirmation(true);
        haptics.success();

        // Reset form
        setName('');
        setEmail('');
        setMessage('');

        // Hide confirmation and close modal after 3 seconds
        clearCloseTimer();
        closeTimer.current = setTimeout(() => {
          closeTimer.current = null;
          setShowConfirmation(false);
          onClose();
        }, 3000);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email error:', error);
      setSendError("We couldn't send your message. Please email us directly at kndevapp@gmail.com");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = (key: keyof FieldErrors) => {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    if (sendError) setSendError(null);
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Contact support"
      subtitle={showConfirmation ? undefined : "Have a question or need help? We'll get back to you within 24 hours."}
      size="auto"
      footer={
        showConfirmation ? (
          <Button title="Done" variant="secondary" onPress={onClose} />
        ) : (
          <Button title="Send message" icon="send-outline" onPress={handleSubmit} loading={isSubmitting} />
        )
      }
    >
      {showConfirmation ? (
        /* Confirmation Message */
        <View style={styles.confirmation} accessibilityLiveRegion="polite">
          <View style={styles.confirmationIcon}>
            <Ionicons name="checkmark" size={28} color={Colors.positive} />
          </View>
          <Text style={styles.confirmationTitle}>Message sent</Text>
          <Text style={styles.confirmationText}>
            Thank you for contacting us. Our support team will get back to you within 24 hours.
          </Text>
        </View>
      ) : (
        <View style={styles.fields}>
          <Input
            label="Your name"
            icon="person-outline"
            placeholder="Enter your name"
            value={name}
            onChangeText={(t) => {
              setName(t);
              clearError('name');
            }}
            autoComplete="name"
            editable={!isSubmitting}
            error={errors.name}
          />

          <Input
            label="Email address"
            icon="mail-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              clearError('email');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            editable={!isSubmitting}
            error={errors.email}
          />

          {/* Multi-line field: Input is single-line (fixed 52px), so this
              mirrors its label/field/error styling */}
          <View>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[
                styles.messageInput,
                messageFocused && styles.messageFocused,
                !!errors.message && styles.messageErrored,
                isSubmitting && styles.messageDisabled,
              ]}
              placeholder="Describe your issue or question…"
              placeholderTextColor={Colors.textTertiary}
              selectionColor={Colors.accent}
              value={message}
              onChangeText={(t) => {
                setMessage(t);
                clearError('message');
              }}
              onFocus={() => setMessageFocused(true)}
              onBlur={() => setMessageFocused(false)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!isSubmitting}
              accessibilityLabel="Message"
            />
            {errors.message ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color={Colors.negative} />
                <Text style={styles.errorText}>{errors.message}</Text>
              </View>
            ) : null}
          </View>

          {sendError ? (
            <View style={styles.banner} accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle" size={18} color={Colors.negative} />
              <Text style={styles.bannerText}>{sendError}</Text>
            </View>
          ) : null}

          <Text style={styles.altContact}>
            You can also email us at <Text style={styles.altContactStrong}>kndevapp@gmail.com</Text>. Response time:
            within 24 hours.
          </Text>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  label: {
    ...Type.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  messageInput: {
    minHeight: 132,
    maxHeight: 200,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.text,
    // Remove the browser focus ring on web; the border shows focus instead
    outlineStyle: 'none',
  } as any,
  messageFocused: {
    borderColor: Colors.accentBorder,
  },
  messageErrored: {
    borderColor: Colors.negative,
  },
  messageDisabled: {
    opacity: 0.6,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  errorText: {
    ...Type.caption,
    color: Colors.negative,
    flex: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.negativeMuted,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  bannerText: {
    ...Type.callout,
    color: Colors.text,
    flex: 1,
  },
  altContact: {
    ...Type.caption,
    marginTop: Spacing.xs,
  },
  altContactStrong: {
    color: Colors.text,
    fontWeight: '600',
  },
  confirmation: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  confirmationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.positiveMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  confirmationTitle: {
    ...Type.title2,
    textAlign: 'center',
  },
  confirmationText: {
    ...Type.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
