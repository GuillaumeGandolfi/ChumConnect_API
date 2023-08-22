import sequelize from '../config/database.js';
import association from '../models/association.js';
// Destructuring
const { Event, Category, User } = association;

// Import de l'objet 'op' de Sequelize qui sert à créer des opérateurs de comparaison
import { Op } from 'sequelize';

const eventController = {
    // Récupération de tous les événements
    getAllEvents: async (req, res) => {
        try {
            const events = await Event.findAll();
            res.status(200).json(events);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Récupération d'un événement
    getOneEvent: async (req, res) => {
        const eventId = req.params.id;
        try {
            const event = await Event.findByPk(eventId, {
                include: [
                    { association: "organizer" },
                    { association: "participants" },
                    { association: "category" }
                ]
            });
            if (!event) {
                res.status(404).json(`Cet événement n'existe pas`);
            }
            res.status(200).json(event);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Création d'un événement
    createEvent: async (req, res) => {
        try {
            // On récupère l'id de la personne qui créée l'event (organisateur)
            // TODO : Pour l'instant j'utilise req.body mais plus tard un token sera mis en place
            // TODO : avec ce token de connexion on récupérera l'id de l'user
            const userId = req.body.userId;
            const { title, description, date, hour, location } = req.body;
            const bodyErrors = [];

            if (!title || !description || !date || !hour || !location) {
                bodyErrors.push(`Certains champs ne sont pas renseignés`);
            }

            if (bodyErrors.length) {
                res.status(400).json(bodyErrors);
            } else {
                const newEvent = await Event.build({
                    title,
                    description,
                    date,
                    hour,
                    location,
                    organizer_id: userId // On affecte l'id de l'organisateur à l'event
                });
                await newEvent.save();
                res.status(201).json({ newEvent });
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Modification d'un événement
    updateEvent: async (req, res) => {
        const eventId = req.params.id;

        try {
            const event = await Event.findByPk(eventId);
            if (!event) {
                res.status(404).json(`Cet événement n'existe pas`);
            } else {
                const { title, description, date, hour, location } = req.body;

                if (title) {
                    event.title = title;
                }
                if (description) {
                    event.description = description;
                }
                if (date) {
                    event.date = date;
                }
                if (hour) {
                    event.hour = hour;
                }
                if (location) {
                    event.location = location;
                }

                await event.save();
                res.status(200).json(event);
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Suppression d'un événement
    deleteEvent: async (req, res) => {
        const eventId = req.params.id;

        try {
            const event = await Event.findByPk(eventId);
            if (!event) {
                res.status(404).json(`Cet événement n'existe pas`);
            } else {
                await event.destroy();
                res.status(200).json(`L'événement a bien été supprimé`);
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Ajout d'un participant à un événement
    addParticipantToEvent: async (req, res) => {
        const eventId = req.params.id;
        const participantId = req.body.participantId;

        try {
            const event = await Event.findByPk(eventId);
            const participant = await User.findByPk(participantId);

            if (!event || !participant) {
                res.status(404).json(`Evénement ou Utilisateur introuvable`);
            }

            // Vérification que l'utilisateur n'est pas déjà participant à l'événement
            const isParticipant = await event.hasParticipant(participant);
            if (isParticipant) {
                res.status(400).json(`Cet utilisateur est déjà participant à l'événement`);
            } else {
                await event.addParticipant(participant);
                res.status(200).json(`Participant ajouté à l'événement`);
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Suppression d'un participant à un événement
    removeParticipantFromEvent: async (req, res) => {
        const eventId = req.params.id;
        const participantId = req.body.participantId;

        try {
            const event = await Event.findByPk(eventId);
            const participant = await User.findByPk(participantId);

            if (!event || !participant) {
                res.status(404).json(`Evénement ou Utilisateur introuvable`);
            }

            await event.removeParticipant(participant);
            res.status(200).json(`Participant supprimé de l'événement`);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    getEventsByDate: async (req, res) => {
        // On peut récupérer une date de début et une date de fin
        const dateStart = req.body.dateStart;
        const dateEnd = req.body.dateEnd;

        try {
            const events = await Event.findAll({
                where: {
                    date: {
                        [Op.between]: [dateStart, dateEnd]
                    }
                }
            });

            if (!events) {
                res.status(404).json(`Aucun événement trouvé`);
            }
            res.status(200).json(events);

        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    getEventsByCategory: async (req, res) => {
        const categoryId = req.params.id;

        try {
            const category = await Category.findByPk(categoryId, {
                include: [
                    { association: "events" }
                ]
            });

            if (!category) {
                res.status(404).json(`Catégorie introuvable`);
            } else {
                res.status(200).json(category);
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    getEventsByLocation: async (req, res) => {
        const location = req.body.location;

        try {
            const events = await Event.findAll({
                where: {
                    location: {
                        [Op.like]: `%${location}%`
                    }
                }
            });

            if (!events) {
                res.status(404).json(`Aucun événement trouvé`);
            } else {
                res.status(200).json(events);
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Méthode permettant à un organisateur d'événement d'envoyer une invitation à ses amis
    sendEventInvitation: async (req, res) => {
        const eventId = req.params.id;
        const organizerId = req.body.organizerId;
        const invitedFriendId = req.body.invitedFriendId // Tableau d'id des amis invités

        try {
            // On vérifie que l'user est organisateur de l'event
            const event = await Event.findOne({
                where: {
                    id: eventId,
                    organizer_id: organizerId
                }
            });
            if (!event) {
                res.status(404).json(`Cet événement n'existe pas ou vous n'êtes pas l'organisateur`);
            }

            // On vérifie que les utilisateurs invités existent
            const invitedUser = await User.findOne({
                where: {
                    id: invitedFriendId
                }
            });

            if (!invitedUser) {
                res.status(404).json(`L'ami invité n'existe pas`);
            } else {
                // On vérifie que les utilisateurs invités sont bien des amis de l'organisateur
                const areFriends = await User.findOne({
                    where: {
                        id: organizerId
                    },
                    include: [
                        {
                            association: "friends",
                            where: {
                                id: invitedFriendId
                            }
                        }
                    ]
                });

                if (!areFriends) {
                    res.status(400).json(`Vous ne pouvez inviter que vos amis`);
                } else {
                    // On envoie l'invitation aux amis
                    const query = `
                    INSERT INTO event_invitation_sent (event_id, organizer_id, invited_friend_id)
                    VALUES ($1, $2, $3)`;

                    await sequelize.query(query, {
                        bind: [eventId, organizerId, invitedFriendId],
                        type: sequelize.QueryTypes.INSERT
                    });

                    res.status(200).json(`Invitation envoyée`);
                }
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Méthode permettant à un ami invité d'accepter à une invitation
    acceptEventInvitation: async (req, res) => {
        const eventId = req.params.id;
        const invitedFriendId = req.body.invitedFriendId;

        try {
            // On recherche l'événement 
            const event = await Event.findByPk(eventId);
            if (!event) {
                res.status(404).json(`Cet événement n'existe pas`);
            }

            // On recherche l'ami invité
            const invitedFriend = await User.findByPk(invitedFriendId);
            if (!invitedFriend) {
                res.status(404).json(`Cet ami invité n'existe pas`);
            }

            // On vérifie que l'ami invité a bien reçu une invitation pour cet événement
            const isInvited = await invitedFriend.hasInvitationReceived(event);
            if (!isInvited) {
                res.status(404).json(`Vous n'avez pas reçu d'invitation pour cet événement`);
            }

            // On ajoute l'ami invité à la liste des participants
            await event.addParticipant(invitedFriend);

            // On supprime l'invitation reçue
            await invitedFriend.removeInvitationReceived(event);
            res.status(200).json(`Invitation acceptée`);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Méthode permettant à un ami invité de refuser une invitation
    rejectEventInvitation: async (req, res) => {
        const eventId = req.params.id;
        const invitedFriendId = req.body.invitedFriendId;

        try {
            // On recherche l'événement 
            const event = await Event.findByPk(eventId);
            if (!event) {
                res.status(404).json(`Cet événement n'existe pas`);
            }

            // On recherche l'ami invité
            const invitedFriend = await User.findByPk(invitedFriendId);
            if (!invitedFriend) {
                res.status(404).json(`Cet ami invité n'existe pas`);
            }

            // On vérifie que l'ami invité a bien reçu une invitation pour cet événement
            const isInvited = await invitedFriend.hasInvitationReceived(event);
            if (!isInvited) {
                res.status(404).json(`Vous n'avez pas reçu d'invitation pour cet événement`);
            }

            // On supprime l'invitation reçue
            await invitedFriend.removeInvitationReceived(event);
            res.status(200).json(`Invitation refusée`);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Méthode permettant à un organisateur d'annuler une invitation envoyée
    cancelEventInvitation: async (req, res) => {
        const eventId = req.params.id;
        const organizerId = req.body.organizerId;
        const invitedFriendId = req.body.invitedFriendId;

        try {
            // On recherche l'événement
            const event = await Event.findOne({
                where: {
                    id: eventId,
                    organizer_id: organizerId
                }
            });
            if (!event) {
                res.status(404).json(`Cet événement n'existe pas ou vous n'êtes pas l'organisateur`);
            }

            // On recherche l'ami invité
            const invitedFriend = await User.findByPk(invitedFriendId);
            if (!invitedFriend) {
                res.status(404).json(`Cet ami invité n'existe pas`);
            }

            // On vérifie que l'ami invité a bien reçu une invitation pour cet événement
            const isInvited = await invitedFriend.hasInvitationReceived(event);
            if (!isInvited) {
                res.status(404).json(`Cet ami invité n'a pas reçu d'invitation pour cet événement`);
            }

            // On supprime l'invitation reçue
            await invitedFriend.removeInvitationReceived(event);
            res.status(200).json(`Invitation annulée`);

        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // TODO : Statistiques sur les événements ??
}

export default eventController;