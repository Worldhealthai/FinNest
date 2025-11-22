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

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  name: string;
  lastFour: string;
  expiryDate?: string;
  isDefault: boolean;
}

interface PaymentMethodsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PaymentMethodsModal({ visible, onClose }: PaymentMethodsModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa Debit',
      lastFour: '4242',
      expiryDate: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'bank',
      name: 'Barclays Current Account',
      lastFour: '1234',
      isDefault: false,
    },
  ]);

  // Form state
  const [methodType, setMethodType] = useState<'card' | 'bank'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [accountName, setAccountName] = useState('');

  const resetForm = () => {
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardholderName('');
    setAccountNumber('');
    setSortCode('');
    setAccountName('');
  };

  const handleAddMethod = () => {
    if (methodType === 'card') {
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        Alert.alert('Error', 'Please fill in all card details');
        return;
      }

      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: 'card',
        name: 'Card',
        lastFour: cardNumber.slice(-4),
        expiryDate: expiryDate,
        isDefault: methods.length === 0,
      };

      setMethods([...methods, newMethod]);
    } else {
      if (!accountNumber || !sortCode || !accountName) {
        Alert.alert('Error', 'Please fill in all bank account details');
        return;
      }

      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: 'bank',
        name: accountName,
        lastFour: accountNumber.slice(-4),
        isDefault: methods.length === 0,
      };

      setMethods([...methods, newMethod]);
    }

    setShowAddForm(false);
    resetForm();
    Alert.alert('Success', 'Payment method added successfully!');
  };

  const handleSetDefault = (id: string) => {
    setMethods(
      methods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    Alert.alert('Success', 'Default payment method updated!');
  };

  const handleRemove = (id: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMethods(methods.filter((method) => method.id !== id));
          },
        },
      ]
    );
  };

  const getMethodIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    return type === 'card' ? 'card' : 'business';
  };

  if (showAddForm) {
    return (
      <Modal
        visible={visible}
        onClose={() => {
          setShowAddForm(false);
          resetForm();
        }}
        title="Add Payment Method"
        icon="add-circle"
      >
        <View style={styles.formContainer}>
          {/* Method Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Method Type</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                onPress={() => setMethodType('card')}
                style={styles.typeOption}
              >
                <GlassCard
                  style={[
                    styles.typeCard,
                    methodType === 'card' && styles.typeCardSelected,
                  ]}
                  intensity={methodType === 'card' ? 'dark' : 'medium'}
                >
                  <Ionicons name="card" size={32} color={Colors.gold} />
                  <Text style={styles.typeText}>Card</Text>
                </GlassCard>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMethodType('bank')}
                style={styles.typeOption}
              >
                <GlassCard
                  style={[
                    styles.typeCard,
                    methodType === 'bank' && styles.typeCardSelected,
                  ]}
                  intensity={methodType === 'bank' ? 'dark' : 'medium'}
                >
                  <Ionicons name="business" size={32} color={Colors.gold} />
                  <Text style={styles.typeText}>Bank Account</Text>
                </GlassCard>
              </TouchableOpacity>
            </View>
          </View>

          {methodType === 'card' ? (
            <>
              {/* Card Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Number *</Text>
                <GlassCard style={styles.inputCard} intensity="medium">
                  <TextInput
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={Colors.mediumGray}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </GlassCard>
              </View>

              {/* Expiry and CVV */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.sm }]}>
                  <Text style={styles.label}>Expiry Date *</Text>
                  <GlassCard style={styles.inputCard} intensity="medium">
                    <TextInput
                      style={styles.input}
                      placeholder="MM/YY"
                      placeholderTextColor={Colors.mediumGray}
                      value={expiryDate}
                      onChangeText={setExpiryDate}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </GlassCard>
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.sm }]}>
                  <Text style={styles.label}>CVV *</Text>
                  <GlassCard style={styles.inputCard} intensity="medium">
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      placeholderTextColor={Colors.mediumGray}
                      value={cvv}
                      onChangeText={setCvv}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                    />
                  </GlassCard>
                </View>
              </View>

              {/* Cardholder Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cardholder Name *</Text>
                <GlassCard style={styles.inputCard} intensity="medium">
                  <TextInput
                    style={styles.input}
                    placeholder="Name on card"
                    placeholderTextColor={Colors.mediumGray}
                    value={cardholderName}
                    onChangeText={setCardholderName}
                    autoCapitalize="words"
                  />
                </GlassCard>
              </View>
            </>
          ) : (
            <>
              {/* Account Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Name *</Text>
                <GlassCard style={styles.inputCard} intensity="medium">
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Barclays Current Account"
                    placeholderTextColor={Colors.mediumGray}
                    value={accountName}
                    onChangeText={setAccountName}
                  />
                </GlassCard>
              </View>

              {/* Account Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Number *</Text>
                <GlassCard style={styles.inputCard} intensity="medium">
                  <TextInput
                    style={styles.input}
                    placeholder="12345678"
                    placeholderTextColor={Colors.mediumGray}
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="numeric"
                    maxLength={8}
                  />
                </GlassCard>
              </View>

              {/* Sort Code */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sort Code *</Text>
                <GlassCard style={styles.inputCard} intensity="medium">
                  <TextInput
                    style={styles.input}
                    placeholder="12-34-56"
                    placeholderTextColor={Colors.mediumGray}
                    value={sortCode}
                    onChangeText={setSortCode}
                    keyboardType="numeric"
                    maxLength={8}
                  />
                </GlassCard>
              </View>
            </>
          )}

          {/* Security Notice */}
          <GlassCard style={styles.noticeCard} intensity="medium">
            <View style={styles.noticeHeader}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
              <Text style={styles.noticeText}>
                Your payment details are encrypted and securely stored
              </Text>
            </View>
          </GlassCard>

          {/* Add Button */}
          <TouchableOpacity onPress={handleAddMethod}>
            <LinearGradient
              colors={Colors.goldGradient}
              style={styles.addButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add-circle" size={24} color={Colors.deepNavy} />
              <Text style={styles.addButtonText}>Add Payment Method</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowAddForm(false);
              resetForm();
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Payment Methods"
      icon="card-outline"
    >
      <View style={styles.container}>
        {methods.length === 0 ? (
          <GlassCard style={styles.emptyCard} intensity="medium">
            <Ionicons name="card-outline" size={48} color={Colors.mediumGray} />
            <Text style={styles.emptyText}>No payment methods added yet</Text>
            <Text style={styles.emptySubtext}>
              Add a card or bank account to get started
            </Text>
          </GlassCard>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Your Payment Methods</Text>
            {methods.map((method) => (
              <GlassCard key={method.id} style={styles.methodCard} intensity="medium">
                <View style={styles.methodHeader}>
                  <View style={styles.methodLeft}>
                    <View style={styles.methodIcon}>
                      <Ionicons
                        name={getMethodIcon(method.type)}
                        size={24}
                        color={Colors.gold}
                      />
                    </View>
                    <View>
                      <Text style={styles.methodName}>{method.name}</Text>
                      <Text style={styles.methodDetails}>
                        {method.type === 'card' ? '•••• ' : 'Account ••••'}
                        {method.lastFour}
                      </Text>
                      {method.expiryDate && (
                        <Text style={styles.methodExpiry}>
                          Expires {method.expiryDate}
                        </Text>
                      )}
                    </View>
                  </View>

                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>

                <View style={styles.methodActions}>
                  {!method.isDefault && (
                    <TouchableOpacity
                      onPress={() => handleSetDefault(method.id)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemove(method.id)}
                    style={[styles.actionButton, styles.removeButton]}
                  >
                    <Text style={[styles.actionButtonText, styles.removeButtonText]}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </>
        )}

        {/* Add New Button */}
        <TouchableOpacity onPress={() => setShowAddForm(true)}>
          <LinearGradient
            colors={Colors.goldGradient}
            style={styles.addNewButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add-circle" size={24} color={Colors.deepNavy} />
            <Text style={styles.addNewButtonText}>Add Payment Method</Text>
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
  sectionTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  methodCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.gold + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  methodName: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  methodDetails: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
  },
  methodExpiry: {
    fontSize: Typography.sizes.xs,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: Typography.sizes.xs,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
  methodActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassLight,
  },
  actionButton: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gold + '30',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gold,
    fontWeight: Typography.weights.semibold,
  },
  removeButton: {
    backgroundColor: Colors.error + '30',
  },
  removeButtonText: {
    color: Colors.error,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
  },
  emptySubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    textAlign: 'center',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  addNewButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
  formContainer: {
    gap: Spacing.md,
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
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeOption: {
    flex: 1,
  },
  typeCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  typeCardSelected: {
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  typeText: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
  },
  noticeCard: {
    padding: Spacing.md,
    marginTop: Spacing.sm,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  addButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.deepNavy,
    fontWeight: Typography.weights.bold,
  },
  cancelButton: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    fontWeight: Typography.weights.semibold,
  },
});
