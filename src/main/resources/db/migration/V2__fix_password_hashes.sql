-- Correction des mots de passe hachés pour les comptes pré-générés
-- Le hash correct pour le mot de passe "password" avec BCrypt
UPDATE users SET password_hash = '$2a$10$v5h439ChSZFv6nN1fdxmJuTrP/wOfNRtfv0ndiG03fg5OZLa/0YjO';
