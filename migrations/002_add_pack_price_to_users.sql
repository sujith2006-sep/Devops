-- Add base pack price per subscriber (adds to channel + addon totals).
ALTER TABLE users
ADD COLUMN IF NOT EXISTS pack_price INTEGER NOT NULL DEFAULT 0;

UPDATE users SET pack_price = 299 WHERE customer_id = '101';
UPDATE users SET pack_price = 549 WHERE customer_id = '202';
