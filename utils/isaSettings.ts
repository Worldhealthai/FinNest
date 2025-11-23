import AsyncStorage from '@react-native-async-storage/async-storage';

const ISA_SETTINGS_STORAGE_KEY = '@finnest_isa_account_settings';

export interface ISAAccountSetting {
  isFlexible: boolean;
  provider: string;
  isaType: string;
  createdDate: string;
}

export interface ISAAccountSettings {
  [key: string]: ISAAccountSetting; // key format: "provider_isaType" (lowercase)
}

/**
 * Generate a settings key from provider and ISA type
 * Format: "provider_isaType" (lowercase)
 * Example: "monzo_cash", "vanguard_stocks_shares"
 */
export function getSettingsKey(provider: string, isaType: string): string {
  return `${provider}_${isaType}`.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Load all ISA account settings from AsyncStorage
 */
export async function loadISASettings(): Promise<ISAAccountSettings> {
  try {
    const savedData = await AsyncStorage.getItem(ISA_SETTINGS_STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return {};
  } catch (error) {
    console.error('Error loading ISA settings:', error);
    return {};
  }
}

/**
 * Save ISA account settings to AsyncStorage
 */
export async function saveISASettings(settings: ISAAccountSettings): Promise<void> {
  try {
    const jsonData = JSON.stringify(settings);
    await AsyncStorage.setItem(ISA_SETTINGS_STORAGE_KEY, jsonData);
    console.log('✅ ISA settings saved successfully');
  } catch (error) {
    console.error('❌ Error saving ISA settings:', error);
    throw error;
  }
}

/**
 * Get settings for a specific provider + ISA type combination
 * Returns undefined if not found (first time adding to this combo)
 */
export async function getISASetting(
  provider: string,
  isaType: string
): Promise<ISAAccountSetting | undefined> {
  const settings = await loadISASettings();
  const key = getSettingsKey(provider, isaType);
  return settings[key];
}

/**
 * Set or update settings for a specific provider + ISA type combination
 */
export async function setISASetting(
  provider: string,
  isaType: string,
  isFlexible: boolean
): Promise<void> {
  const settings = await loadISASettings();
  const key = getSettingsKey(provider, isaType);

  settings[key] = {
    isFlexible,
    provider,
    isaType,
    createdDate: new Date().toISOString(),
  };

  await saveISASettings(settings);
  console.log(`✅ ISA setting saved: ${key} -> flexible: ${isFlexible}`);
}

/**
 * Check if an ISA account is flexible
 * Returns false if settings don't exist (defaults to non-flexible)
 */
export async function isISAFlexible(
  provider: string,
  isaType: string
): Promise<boolean> {
  const setting = await getISASetting(provider, isaType);
  return setting?.isFlexible || false;
}

/**
 * Delete settings for a specific provider + ISA type combination
 * Useful when user deletes all contributions from a provider+type
 */
export async function deleteISASetting(
  provider: string,
  isaType: string
): Promise<void> {
  const settings = await loadISASettings();
  const key = getSettingsKey(provider, isaType);

  if (settings[key]) {
    delete settings[key];
    await saveISASettings(settings);
    console.log(`✅ ISA setting deleted: ${key}`);
  }
}
