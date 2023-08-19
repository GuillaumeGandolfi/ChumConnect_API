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
                    location
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

            await event.addParticipant(participant);
            res.status(200).json(`Participant ajouté à l'événement`);
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
    sendInvitations: async (req, res) => {
        const eventId = req.params.id;
        const organizerId = req.body.organizerId;
        const invitedFriendId = req.body.invitedFriendId;

        try {
            // On vérifie que l'utilisateur est bien organisateur de l'événement 
            const event = await Event.findOne({
                where: {
                    id: eventId,
                    organizerId: organizerId
                }
            });
            if (!event) {
                res.status(404).json(`Cet événement n'existe pas ou vous n'êtes pas l'organisateur`);
            }

            // On vérifie que l'ami invité existe bien
            const invitedFriend = await User.findByPk(invitedFriendId);
            if (!invitedFriend) {
                res.status(404).json(`Cet ami n'existe pas`);
            }

            // On vérifie que l'ami invité n'est pas déjà participant à l'événement
            const isParticipant = await event.hasParticipant(invitedFriend);
            if (isParticipant) {
                res.status(400).json(`Cet ami est déjà participant à l'événement`);
            }

            // On ajoute l'ami (ou les amis) invité à l'événement
            await event.addParticipant(invitedFriend);
            res.status(200).json(`Invitation envoyée avec succès`);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },


    // TODO : Méthode permettant de répondre à une invitation (par l'ami invité)
    // TODO : Statistiques sur les événements ??

}

export default eventController;