-- Deploy chumconnect:1.create_tables to pg

BEGIN;

-- Création de la table "Utilisateur"
CREATE TABLE IF NOT EXISTS "user" (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email text NOT NULL UNIQUE,
    firstname text NOT NULL,
    lastname text NOT NULL,
    age int NOT NULL,
    password text NOT NULL,
    localization text NOT NULL,
    level int,
    experience int,
    isAdmin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Création de la table "Catégorie"
CREATE TABLE IF NOT EXISTS "category" (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    label TEXT NOT NULL UNIQUE
);

-- Création de la table "Evenement"
CREATE TABLE IF NOT EXISTS "event" (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    hour TIMESTAMPTZ NOT NULL,
    location text NOT NULL,
    category_id int REFERENCES category(id),
    organizer_id int REFERENCES "user"(id)
);

-- Création de la table d'association "Event_has_participants"
CREATE TABLE IF NOT EXISTS "event_has_participants" (
    event_id int REFERENCES event(id),
    participant_id int REFERENCES "user"(id),
    PRIMARY KEY (event_id, participant_id)
);

COMMIT;