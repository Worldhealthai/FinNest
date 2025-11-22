import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import GlassCard from './GlassCard';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface PersonalInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PersonalInfoModal({ visible, onClose }: PersonalInfoModalProps) {
  const [fullName, setFullName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex.johnson@email.com');
  const [phone, setPhone] = useState('+44 7700 900000');
  const [address, setAddress] = useState('123 Financial Street');
  const [city, setCity] = useState('London');
  const [postcode, setPostcode] = useState('SW1A 1AA');
  const [dateOfBirth, setDateOfBirth] = useState('15/04/1990');
  const [nationalInsurance, setNationalInsurance] = useState('AB123456C');

  const handleSave = () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert('Success', 'Personal information updated successfully!');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Personal Information"
      icon="person-outline"
    >
      <View style={styles.container}>
        {/* Info Notice */}
        <GlassCard style={styles.noticeCard} intensity="medium">
          <View style={styles.noticeHeader}>
            <Ionicons name="information-circle" size={20} color={Colors.info} />
            <Text style={styles.noticeText}>
              Your information is encrypted and secure
            </Text>
          </View>
        </GlassCard>

        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.mediumGray}
              value={fullName}
              onChangeText={setFullName}
            />
          </GlassCard>
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor={Colors.mediumGray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </GlassCard>
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="+44 7700 900000"
              placeholderTextColor={Colors.mediumGray}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </GlassCard>
        </View>

        {/* Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="Street address"
              placeholderTextColor={Colors.mediumGray}
              value={address}
              onChangeText={setAddress}
            />
          </GlassCard>
        </View>

        {/* City and Postcode */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.sm }]}>
            <Text style={styles.label}>City</Text>
            <GlassCard style={styles.inputCard} intensity="medium">
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor={Colors.mediumGray}
                value={city}
                onChangeText={setCity}
              />
            </GlassCard>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.sm }]}>
            <Text style={styles.label}>Postcode</Text>
            <GlassCard style={styles.inputCard} intensity="medium">
              <TextInput
                style={styles.input}
                placeholder="SW1A 1AA"
                placeholderTextColor={Colors.mediumGray}
                value={postcode}
                onChangeText={setPostcode}
                autoCapitalize="characters"
              />
            </GlassCard>
          </View>
        </View>

        {/* Date of Birth */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={Colors.mediumGray}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
          </GlassCard>
        </View>

        {/* National Insurance */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>National Insurance Number</Text>
          <GlassCard style={styles.inputCard} intensity="medium">
            <TextInput
              style={styles.input}
              placeholder="AB123456C"
              placeholderTextColor={Colors.mediumGray}
              value={nationalInsurance}
              onChangeText={setNationalInsurance}
              autoCapitalize="characters"
            />
          </GlassCard>
        </View>

        {/* Save Button */}
        <TouchableOpacity onPress={handleSave}>
          <LinearGradient
            colors={Colors.goldGradient}
            style={styles.saveButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark-circle" size={24} color={Colors.deepNavy} />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  noticeCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  noticeText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  inputCard: {
    padding: Spacing.md,
  },
  input: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  saveButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
});
