-- Migration: convert contributions.date from text to date
--
-- Existing rows contain full ISO-8601 strings (e.g. '2024-01-15T00:00:00.000Z')
-- produced by JavaScript's Date.toISOString(). We extract the leading YYYY-MM-DD
-- portion; any row whose value does not start with a valid YYYY-MM-DD pattern
-- falls back to 2000-01-01 rather than failing the migration.

-- 1. Add a staging column so we can populate before swapping.
ALTER TABLE contributions ADD COLUMN date_new date;

-- 2. Convert existing values.
UPDATE contributions
SET date_new = CASE
  WHEN "date" ~ '^\d{4}-\d{2}-\d{2}'
    THEN (substring("date" FROM 1 FOR 10))::date
  ELSE '2000-01-01'::date
END;

-- 3. Enforce NOT NULL on the new column before we make it the real one.
ALTER TABLE contributions ALTER COLUMN date_new SET NOT NULL;

-- 4. Drop the old text column and promote the new one.
ALTER TABLE contributions DROP COLUMN "date";
ALTER TABLE contributions RENAME COLUMN date_new TO "date";

-- 5. Restore the ordering index that the app relies on.
CREATE INDEX IF NOT EXISTS contributions_date_idx ON contributions ("date" DESC);
