-- Création des tables

-- 1. Table users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_role CHECK (role IN ('ADMIN', 'STAFF', 'CLIENT', 'GUEST'))
);

-- 2. Table categories
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- 3. Table menu_items
CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(255),
    CONSTRAINT chk_price CHECK (price >= 0)
);

-- 4. Table orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_order_status CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT chk_total CHECK (total >= 0)
);

-- 5. Table order_items
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    CONSTRAINT chk_quantity CHECK (quantity > 0),
    CONSTRAINT chk_unit_price CHECK (unit_price >= 0)
);

-- 6. Table reservations
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    note TEXT,
    CONSTRAINT chk_guests CHECK (guests > 0),
    CONSTRAINT chk_reservation_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED'))
);

-- 7. Table chat_sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table chat_messages
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_msg_role CHECK (role IN ('user', 'assistant'))
);

-- Insertion des données de test
-- Mot de passe haché : "password" ($2a$10$Xptm8m3R.gM9F91eXWzYzehN2JgR96c7x9p.g96s738K5d7u89pOi)

INSERT INTO users (id, name, email, password_hash, role) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Admin Bahlo', 'bahlo.admin@restaurant.com', '$2a$10$Xptm8m3R.gM9F91eXWzYzehN2JgR96c7x9p.g96s738K5d7u89pOi', 'ADMIN'),
('b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e', 'Jean Staff', 'jean.staff@restaurant.com', '$2a$10$Xptm8m3R.gM9F91eXWzYzehN2JgR96c7x9p.g96s738K5d7u89pOi', 'STAFF'),
('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'Sophie Client', 'sophie.client@restaurant.com', '$2a$10$Xptm8m3R.gM9F91eXWzYzehN2JgR96c7x9p.g96s738K5d7u89pOi', 'CLIENT');

INSERT INTO categories (id, name, description) VALUES
(1, 'Entrées', 'Délicieuses entrées pour commencer votre repas'),
(2, 'Plats Principaux', 'Nos plats phares cuisinés avec amour');

-- Ajuster les sequences de categories suite à l'insertion manuelle des ids
SELECT setval('categories_id_seq', 2);

INSERT INTO menu_items (category_id, name, description, price, available, image_url) VALUES
(1, 'Soupe à l''oignon', 'Traditionnelle soupe à l''oignon gratinée au gruyère', 8.50, TRUE, 'http://example.com/soupe.jpg'),
(1, 'Salade César', 'Salade romaine croustillante, poulet grillé, sauce César maison', 10.00, TRUE, 'http://example.com/cesar.jpg'),
(2, 'Filet Mignon de Boeuf', 'Filet mignon de boeuf d''exception accompagné de son écrasé de pommes de terre', 28.00, TRUE, 'http://example.com/filet.jpg'),
(2, 'Saumon Gratiné au Four', 'Pavé de saumon frais gratiné accompagné de légumes de saison glacés', 24.50, TRUE, 'http://example.com/saumon.jpg'),
(2, 'Risotto aux Truffes', 'Risotto crémeux parfumé à la truffe noire et parmesan affiné', 22.00, TRUE, 'http://example.com/risotto.jpg');
