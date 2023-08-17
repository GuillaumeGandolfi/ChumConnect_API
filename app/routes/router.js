import express from 'express';

// Import des controllers
import userController from '../controllers/UserController.js';

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


export default router;