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
};

export default userController;