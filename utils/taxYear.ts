/**
 * Tax Year Utilities
 * UK tax year runs from April 6th to April 5th of the following year
 */

export interface TaxYear {
  startYear: number; // e.g., 2024
  endYear: number;   // e.g., 2025
  startDate: Date;   // April 6, 2024
  endDate: Date;     // April 5, 2025
  label: string;     // "2024/25"
}

/**
 * Gets the current UK tax year based on today's date
 */
export const getCurrentTaxYear = (): TaxYear => {
  const today = new Date();
  return getTaxYearFromDate(today);
};

/**
 * Determines which tax year a given date falls into
 */
export const getTaxYearFromDate = (date: Date): TaxYear => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed (0 = January)
  const day = date.getDate();

  // Tax year starts April 6th (month 3, day 6)
  // If we're before April 6th, we're in the previous tax year
  const isBeforeApril6 = month < 3 || (month === 3 && day < 6);

  const startYear = isBeforeApril6 ? year - 1 : year;
  const endYear = startYear + 1;

  return getTaxYearBoundaries(startYear);
};

/**
 * Gets the start and end dates for a given tax year
 * @param startYear - The starting year (e.g., 2024 for 2024/25)
 */
export const getTaxYearBoundaries = (startYear: number): TaxYear => {
  const endYear = startYear + 1;

  // April 6th of start year
  const startDate = new Date(startYear, 3, 6, 0, 0, 0, 0); // Month 3 = April

  // April 5th of end year
  const endDate = new Date(endYear, 3, 5, 23, 59, 59, 999);

  return {
    startYear,
    endYear,
    startDate,
    endDate,
    label: formatTaxYear(startYear)
  };
};

/**
 * Formats a tax year as "2024/25"
 */
export const formatTaxYear = (startYear: number): string => {
  const endYear = startYear + 1;
  const endYearShort = endYear.toString().slice(-2);
  return `${startYear}/${endYearShort}`;
};

/**
 * Gets an array of tax years for selection (future + current + previous years)
 * @param yearsBack - Number of previous years to include (default 5)
 * @param yearsForward - Number of future years to include (default 1)
 */
export const getAvailableTaxYears = (yearsBack: number = 5, yearsForward: number = 1): TaxYear[] => {
  const currentTaxYear = getCurrentTaxYear();
  const years: TaxYear[] = [];

  // Add future years (in reverse order so they appear first)
  for (let i = yearsForward; i >= 1; i--) {
    years.push(getTaxYearBoundaries(currentTaxYear.startYear + i));
  }

  // Add current year
  years.push(currentTaxYear);

  // Add previous years
  for (let i = 1; i <= yearsBack; i++) {
    years.push(getTaxYearBoundaries(currentTaxYear.startYear - i));
  }

  return years;
};

/**
 * Formats a Date into a YYYY-MM-DD key using LOCAL calendar components.
 * Use this instead of date.toISOString().split('T')[0], which converts to UTC
 * first and shifts the day for users in non-UTC timezones (e.g. a UK user
 * saving April 6 00:00 BST would otherwise store April 5).
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parses a stored contribution date string into a LOCAL Date.
 * Handles both the current YYYY-MM-DD format and legacy full-ISO strings.
 * new Date('YYYY-MM-DD') parses as UTC midnight, which — when compared against
 * the local-time tax-year boundaries — shifts the day for non-UTC users. This
 * parser stays in local time so membership checks are consistent everywhere.
 */
export const parseDateKey = (value: string): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(value);
};

/**
 * Checks if a date falls within a specific tax year
 */
export const isDateInTaxYear = (date: Date, taxYear: TaxYear): boolean => {
  return date >= taxYear.startDate && date <= taxYear.endDate;
};

/**
 * Gets the label for a tax year relative to current
 * e.g., "2025/26 (Next)", "2024/25 (Current)", "2023/24 (Previous)", "2022/23"
 */
export const getTaxYearLabel = (taxYear: TaxYear): string => {
  const currentTaxYear = getCurrentTaxYear();

  if (taxYear.startYear === currentTaxYear.startYear) {
    return `${taxYear.label} (Current)`;
  } else if (taxYear.startYear === currentTaxYear.startYear + 1) {
    return `${taxYear.label} (Next)`;
  } else if (taxYear.startYear === currentTaxYear.startYear - 1) {
    return `${taxYear.label} (Previous)`;
  }

  return taxYear.label;
};
