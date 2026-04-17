CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    plan VARCHAR(100) NOT NULL,
    pack_price INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL
);

CREATE TABLE addons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL
);

CREATE TABLE user_customizations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_price INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customization_channels (
    id SERIAL PRIMARY KEY,
    customization_id INTEGER REFERENCES user_customizations(id),
    channel_id INTEGER REFERENCES channels(id)
);

CREATE TABLE customization_addons (
    id SERIAL PRIMARY KEY,
    customization_id INTEGER REFERENCES user_customizations(id),
    addon_id INTEGER REFERENCES addons(id)
);

INSERT INTO users (customer_id, name, provider, plan, pack_price)
VALUES
('101', 'Akshith', 'TataSky', 'Basic Plan', 299),
('202', 'Ravi', 'DishTV', 'Premium Plan', 549);

INSERT INTO channels (name, price)
VALUES
('Sports', 50),
('Movies', 40),
('Kids', 30),
('News', 20);

INSERT INTO addons (name, price)
VALUES
('HD Pack', 100),
('Regional Pack', 80),
('OTT Bundle', 150);
