ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash CHAR(64);

UPDATE users
SET password_hash = CASE customer_id
  WHEN '101' THEN '94e0f9bc7f5a5225e19074c1c4de29bf0bf3bcdbeb5a3096146d4f991569334e'
  WHEN '202' THEN '7e32a729b1226ed1270f282a8c63054d09b26bc9ec53ea69771ce38158dfade8'
  ELSE password_hash
END
WHERE password_hash IS NULL;

ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;
