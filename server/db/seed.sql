-- Development seed. The password is a bcrypt hash, never plaintext.
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

INSERT INTO users (name, email, password_hash)
VALUES ('Demo DM', 'demo@example.com', '$2b$12$aUUXhdlXvxV4G9NCxGkNTeKCJqtzoOk8Ef8d3jWWtPyDvocrLu4RC');

INSERT INTO campaigns (user_id, name, description)
VALUES (1, 'The Ashes of Eldoria', 'A remote forest holds the remains of a failed magical experiment.');
