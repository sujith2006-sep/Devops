-- Subscription plans (base pack amount per plan).
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    pack_price INTEGER NOT NULL
);

INSERT INTO plans (name, pack_price)
VALUES
('Basic Plan', 299),
('Premium Plan', 549),
('Family Plan', 699)
ON CONFLICT (name) DO NOTHING;

-- Record which plan was chosen for a customization (optional FK).
ALTER TABLE user_customizations
ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES plans(id);
