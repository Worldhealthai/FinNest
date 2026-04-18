-- Migration: remove national_insurance_number from profiles
--
-- NI numbers are sensitive government identifiers that this app does not
-- need to store. Removing the column eliminates unnecessary PII retention.

ALTER TABLE profiles DROP COLUMN IF EXISTS national_insurance_number;
