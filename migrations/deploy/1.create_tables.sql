-- Deploy chumconnect:1.create_tables to pg

BEGIN;

-- Table des utilisateurs du système
CREATE TABLE IF NOT EXISTS "user" (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email text NOT NULL UNIQUE COMMENT 'Adresse courriel de l''utilisateur',
    firstname text NOT NULL COMMENT 'Prénom de l''utilisateur',
    lastname text NOT NULL COMMENT 'Nom de famille de l''utilisateur',
    age int NOT NULL COMMENT 'Âge de l''utilisateur',
    password text NOT NULL COMMENT 'Mot de passe hashé de l''utilisateur',
    city text NOT NULL COMMENT 'Ville de résidence de l''utilisateur',
    level int COMMENT 'Niveau de l''utilisateur (pour un jeu ou une compétence)',
    experience int COMMENT 'Expérience de l''utilisateur (pour un jeu ou une compétence)',
    isAdmin BOOLEAN DEFAULT FALSE COMMENT 'Indique si l''utilisateur a un rôle d''administrateur',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT 'Date et heure de création du compte utilisateur',
    updated_at TIMESTAMPTZ COMMENT 'Date et heure de la dernière mise à jour du compte utilisateur'
);

-- Table des catégories d'événements
CREATE TABLE IF NOT EXISTS "category" (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    label TEXT NOT NULL UNIQUE COMMENT 'Libellé de la catégorie',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT 'Date et heure de création de la catégorie',
    updated_at TIMESTAMPTZ COMMENT 'Date et heure de la dernière mise à jour de la catégorie'
);

-- Table des événements organisés par les utilisateurs
CREATE TABLE IF NOT EXISTS "event" (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL COMMENT 'Titre de l''événement',
    description text NOT NULL COMMENT 'Description détaillée de l''événement',
    date DATE NOT NULL COMMENT 'Date de l''événement',
    start_time TIME NOT NULL COMMENT 'Heure de début de l''événement',
    location text NOT NULL COMMENT 'Lieu de l''événement (ex: nom du bar, parc)',
    category_id int REFERENCES category(id) COMMENT 'Référence à la catégorie de l''événement',
    organizer_id int REFERENCES "user"(id) COMMENT 'Identifiant de l''organisateur de l''événement',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT 'Date et heure de création de l''événement',
    updated_at TIMESTAMPTZ COMMENT 'Date et heure de la dernière mise à jour de l''événement'
);

-- Table d'association pour les amis des utilisateurs
CREATE TABLE IF NOT EXISTS "user_has_friend" (
    user_id int REFERENCES "user"(id) COMMENT 'Identifiant de l''utilisateur',
    friend_id int REFERENCES "user"(id) COMMENT 'Identifiant de l''ami de l''utilisateur',
    date TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT 'Date et heure de l''ajout de l''ami',
    PRIMARY KEY (user_id, friend_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT 'Date et heure de création de l''amitié',
    updated_at TIMESTAMPTZ COMMENT 'Date et heure de la dernière mise à jour de l''amitié'
);

-- Table d'association pour les demandes d'amis entre utilisateurs
CREATE TABLE IF NOT EXISTS "friend_requests" (
    sender_id int REFERENCES "user"(id) COMMENT 'Identifiant de l''utilisateur envoyant la demande',
    receiver_id int REFERENCES "user"(id) COMMENT 'Identifiant de l''utilisateur recevant la demande',
    PRIMARY KEY (sender_id, receiver_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT 'Date et heure de l''envoi de la demande',
    updated_at TIMESTAMPTZ COMMENT 'Date et heure de la dernière mise à jour de la demande'
);

-- Table d'association pour les participants d'un événement
CREATE TABLE IF NOT EXISTS "event_has_participant" (
    event_id int REFERENCES event(id) COMMENT 'Identifiant de l''événement',
    participant_id int REFERENCES "user"(id) COMMENT 'Identifiant du participant',
    PRIMARY KEY (event_id, participant_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT 'Date et heure de la participation',
    updated_at TIMESTAMPTZ COMMENT 'Date et heure de la dernière mise à jour de la participation'
);

-- Table d'association pour les invitations à un événement
CREATE TABLE IF NOT EXISTS "event_invitation" (
    event_id int REFERENCES event(id) COMMENT 'Identifiant de l''événement',
    organizer_id int REFERENCES "user"(id) COMMENT 'Identifiant de l''organisateur de l''événement',
    invited_friend_id int REFERENCES "user"(id) COMMENT 'Identifiant de l''ami invité',
    PRIMARY KEY (event_id, organizer_id, invited_friend_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT 'Date et heure de l''envoi de l''invitation',
    updated_at TIMESTAMPTZ COMMENT 'Date et heure de la dernière mise à jour de l''invitation'
);

COMMIT;