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
    label TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Création de la table "Evenement"
CREATE TABLE IF NOT EXISTS "event" (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    date DATE NOT NULL,
    hour TIME NOT NULL,
    location text NOT NULL,
    category_id int REFERENCES category(id),
    organizer_id int REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Création de la table d'association "User_has_friend"
CREATE TABLE IF NOT EXISTS "user_has_friend" (
    user_id int REFERENCES "user"(id),
    friend_id int REFERENCES "user"(id),
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, friend_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Création de la table d'association "User_Friend_Request_Sent"
CREATE TABLE IF NOT EXISTS "user_friend_request_sent" (
    sender_id int REFERENCES "user"(id),
    receiver_id int REFERENCES "user"(id),
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (sender_id, receiver_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Création de la table d'association "User_Friend_Request_Received"
CREATE TABLE IF NOT EXISTS "user_friend_request_received" (
    receiver_id int REFERENCES "user"(id),
    sender_id int REFERENCES "user"(id),
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (receiver_id, sender_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Création de la table d'association "Event_has_participant"
CREATE TABLE IF NOT EXISTS "event_has_participant" (
    event_id int REFERENCES event(id),
    participant_id int REFERENCES "user"(id),
    PRIMARY KEY (event_id, participant_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Création de la table d'association "User_has_event"
CREATE TABLE IF NOT EXISTS "user_has_event" (
    user_id int REFERENCES "user"(id),
    event_id int REFERENCES event(id),
    PRIMARY KEY (user_id, event_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Création de la table d'association "Event_has_category"
CREATE TABLE IF NOT EXISTS "event_has_category" (
    event_id int REFERENCES event(id),
    category_id int REFERENCES category(id),
    PRIMARY KEY (event_id, category_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Création de la table d'association "Event_Invitation"
CREATE TABLE IF NOT EXISTS "event_invitation" (
    event_id int REFERENCES event(id),
    organizer_id int REFERENCES "user"(id),
    invited_friend_id int REFERENCES "user"(id),
    PRIMARY KEY (event_id, organizer_id, invited_friend_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);


COMMIT;