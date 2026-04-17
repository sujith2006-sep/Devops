-- Rename plans to *Pack* labels; add channel categories; replace channel catalog.

UPDATE plans SET name = 'Basic Pack' WHERE name = 'Basic Plan';
UPDATE plans SET name = 'Premium Pack' WHERE name = 'Premium Plan';
UPDATE plans SET name = 'Family Pack' WHERE name = 'Family Plan';

UPDATE users SET plan = 'Basic Pack' WHERE plan = 'Basic Plan' OR customer_id = '101';
UPDATE users SET plan = 'Premium Pack' WHERE plan = 'Premium Plan' OR customer_id = '202';

ALTER TABLE channels ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'Sports';

-- Clear customization rows that reference old channel ids (dev-friendly reset)
DELETE FROM customization_addons;
DELETE FROM customization_channels;
DELETE FROM user_customizations;
DELETE FROM channels;

INSERT INTO channels (name, price, category) VALUES
-- Sports
('Star Sports 1 HD', 25, 'Sports'),
('Sony Sports Ten 1', 22, 'Sports'),
('DD Sports', 5, 'Sports'),
('Star Sports Select 1 HD', 28, 'Sports'),
-- Movies
('Star Gold HD', 20, 'Movies'),
('Sony Max HD', 18, 'Movies'),
('&pictures HD', 15, 'Movies'),
('Zee Cinema HD', 18, 'Movies'),
-- News
('Aaj Tak', 8, 'News'),
('NDTV India', 10, 'News'),
('Republic TV', 12, 'News'),
('DD News', 0, 'News'),
-- Kids
('Cartoon Network', 15, 'Kids'),
('Pogo', 12, 'Kids'),
('Nickelodeon Sonic', 14, 'Kids'),
('Discovery Kids', 10, 'Kids');
