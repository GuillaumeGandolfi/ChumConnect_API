-- Deploy chumconnect:1.create_tables to pg

BEGIN;

----- CREATION DES TABLES -----

-- Table des utilisateurs du système
CREATE TABLE IF NOT EXISTS "user" (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email text NOT NULL UNIQUE,
    firstname text NOT NULL,
    lastname text NOT NULL,
    age int NOT NULL DEFAULT 0,
    password text NOT NULL,
    city text NOT NULL DEFAULT 'Inconnu',
    level int NOT NULL DEFAULT 0,
    experience int NOT NULL DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Table des catégories d'événements
CREATE TABLE IF NOT EXISTS "category" (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Table des événements organisés par les utilisateurs
CREATE TABLE IF NOT EXISTS "event" (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    location text NOT NULL,
    category_id int NOT NULL REFERENCES category(id),
    organizer_id int NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Table d'association pour les amis des utilisateurs
CREATE TABLE IF NOT EXISTS "user_has_friend" (
    user_id int NOT NULL REFERENCES "user"(id),
    friend_id int NOT NULL REFERENCES "user"(id),
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, friend_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Table d'association pour les demandes d'amis entre utilisateurs
CREATE TABLE IF NOT EXISTS "friend_request" (
    sender_id int NOT NULL REFERENCES "user"(id),
    receiver_id int NOT NULL REFERENCES "user"(id),
    PRIMARY KEY (sender_id, receiver_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Table d'association pour les participants d'un événement
CREATE TABLE IF NOT EXISTS "event_has_participant" (
    event_id int NOT NULL REFERENCES event(id),
    participant_id int NOT NULL REFERENCES "user"(id),
    PRIMARY KEY (event_id, participant_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Table d'association pour les invitations à un événement
CREATE TABLE IF NOT EXISTS "event_invitation" (
    event_id int NOT NULL REFERENCES event(id),
    organizer_id int NOT NULL REFERENCES "user"(id),
    invited_friend_id int NOT NULL REFERENCES "user"(id),
    PRIMARY KEY (event_id, organizer_id, invited_friend_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

----- CREATION DES INDEX -----
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_event_organizer ON event(organizer_id);
CREATE INDEX idx_event_participant ON event_has_participant(event_id);
CREATE INDEX idx_event_invitation ON event_invitation(event_id);

COMMIT;