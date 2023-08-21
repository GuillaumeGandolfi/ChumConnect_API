import express from 'express';

// Import des controllers
import userController from '../controllers/UserController.js';
import eventController from '../controllers/EventController.js';

// Création du routeur
const router = express.Router();

/** Users */
router.get('/users', userController.getAllUsers);
router.get('/user/:id', userController.getOneUser);
router.post('/user', userController.createUser);
router.put('/user/:id', userController.updateUser);
router.delete('/user/:id', userController.deleteUser);

/** Friends */
router.post('/user/:id/send-friend-request', userController.sendFriendRequest);
router.post('/user/:id/accept-friend-request', userController.acceptFriendRequest);
router.post('/user/:id/refuse-friend-request', userController.refuseFriendRequest);
router.post('/user/:id/delete-friend', userController.deleteFriend);

/** Events */
router.get('/events', eventController.getAllEvents);
router.get('/event/:id', eventController.getOneEvent);
router.post('/event', eventController.createEvent);
router.put('/event/:id', eventController.updateEvent);
router.delete('/event/:id', eventController.deleteEvent);

router.post('/event/:id/add-participant', eventController.addParticipantToEvent);
router.delete('/event/:id/remove-participant', eventController.removeParticipantFromEvent);

router.post('/events/by-date', eventController.getEventsByDate);
router.post('/events/by-category/:id', eventController.getEventsByCategory);
router.post('/events/by-location', eventController.getEventsByLocation);

router.post('/event/:id/send-event-invitation', eventController.sendEventInvitation);
router.post('/event/:id/accept-event-invitation', eventController.acceptEventInvitation);
router.post('/event/:id/reject-event-invitation', eventController.rejectEventInvitation);
router.post('/event/:id/cancel-event-invitation', eventController.cancelEventInvitation);

export default router;