// Import du ou des models nécessaires
import { User } from "../models/User";

// On créer un objet qui contiendra toutes les méthodes
const userController = {

    // Méthode qui permet de récupérer tous les utilisateurs
    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll();
            res.status(200).json(users);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Méthode qui permet de récupérer un utilisateur en fonction de son id
    getOneUser: async (req, res) => {
        // On récupère l'id de l'utilisateur (en param de la route)
        const userId = req.params.id;
        try {
            // Et grâce à cet id on récupère l'utilisateur dans la database
            const user = await User.findByPk(userId, {
                // On précise les associations que l'on veut inclure dans la réponse
                include: [
                    { association: "friends" },
                    { association: "createdEvents" },
                    { association: "participatedEvents" }
                ]
            });
            // Si l'utilisateur n'existe pas on renvoie une erreur 404
            if (!user) {
                res.status(404).json(`Cet utilisateur n'existe pas`);
            }
            // Sinon on renvoie l'utilisateur
            res.status(200).json(user);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Méthode qui permet de créer un utilisateur
    createUser: async (req, res) => {
        try {
            // On récupère les données envoyées dans le corps de la requête
            const { email, firstname, lastname, age, localization, password } = req.body;
            const bodyErrors = [];

            // On vérifie que toutes les données nécessaires sont bien présentes
            if (!email || !firstname || !lastname || !age || !localization || !password) {
                bodyErrors.push(`Certains champs ne sont pas renseignés`);
            }

            // On vérifie aussi si le mail n'est pas déjà utilisé
            const user = await User.findOne({ where: { email: email } });
            if (user) {
                bodyErrors.push(`Un utilisateur avec cet email existe déjà`);
            }

            // TODO : Imposer une schéma sur le mot de passe

            // On vérifie si on a des erreurs, si oui on les affiche
            if (bodyErrors.length) {
                res.status(400).json(bodyErrors);
            } else {
                // Création de l'utilisateur
                const newUser = await User.build({
                    email,
                    firstname,
                    lastname,
                    age,
                    localization,
                    // TODO : Encodé le mot de passe (bcrypt?)
                    password
                });
                // Sauvegarde de l'utilisateur dans la database
                await newUser.save();
                // On renvoie l'utilisateur créé
                res.status(201).json({ newUser });
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Méthode qui permet de modifier un utilisateur
    updateUser: async (req, res) => {
        const userId = req.params.id;

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                res.status(404).json(`Cet utilisateur n'existe pas`);
            } else {
                // On récupère les nouvelles données dans le body 
                const { email, firstname, lastname, age, localization, password } = req.body;

                // On ne change que les données renseignées
                if (email) {
                    user.email = email;
                }
                if (firstname) {
                    user.firstname = firstname;
                }
                if (lastname) {
                    user.lastname = lastname;
                }
                if (age) {
                    user.age = age;
                }
                if (localization) {
                    user.localization = localization;
                }
                if (password) {
                    // TODO : Ne pas oublier le schéma du mot de passe
                    // TODO : Chiffrer le mot de passe avant de l'insérer en database
                    user.password = password;
                }

                // On enregistre les modifications
                await user.save();
                res.status(200).json(user);
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Méthode qui permet de supprimer un utilisateur
    deleteUser: async (req, res) => {
        const userId = req.params.id;

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                res.status(404).json(`Cet utilisateur n'existe pas`);
            } else {
                // On utilise destroy() pour supprimer l'enregistrement dans la database
                await user.destroy();
                res.status(200).json(`L'utilisateur a bien été supprimé`);
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Méthode permettant d'envoyer une demande d'ami
    sendFriendRequest: async (req, res) => {
        const userId = req.params.id;
        const friendId = req.body.friendId;

        try {
            const user = await User.findByPk(userId);
            const friend = await User.findByPk(friendId);

            if (!user || !friend) {
                res.status(404).json(`Utilisateur ou ami introuvable`);
            }

            // On vérifie que l'utilisateur n'est pas déjà ami avec la personne
            const isFriend = await user.hasFriend(friend);
            if (isFriend) {
                res.status(400).json(`Vous êtes déjà ami avec cette personne`);
            }

            // On vérifie que l'utilisateur n'a pas déjà envoyé une demande d'ami à cette personne
            const isFriendRequestSent = await user.hasFriendRequestSent(friend);
            if (isFriendRequestSent) {
                res.status(400).json(`Vous avez déjà envoyé une demande d'ami à cette personne`);
            }

            // On vérifie que l'utilisateur n'a pas déjà reçu une demande d'ami de cette personne
            const isFriendRequestReceived = await user.hasFriendRequestReceived(friend);
            if (isFriendRequestReceived) {
                res.status(400).json(`Vous avez déjà reçu une demande d'ami de cette personne`);
            }

            // On envoie la demande d'ami
            await user.addFriendRequestSent(friend);
            await friend.addFriendRequestReceived(user);

            res.status(200).json(`La demande d'ami a bien été envoyée`);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

};

export default userController;