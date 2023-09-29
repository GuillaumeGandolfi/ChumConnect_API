import association from '../models/association.js';
const User = association.User;

import bcrypt from 'bcrypt';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

const emailSchema = Joi.string().pattern(new RegExp('^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$')).required();
const passwordSchema = Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')).required();

const AuthController = {
    signupUser: async (req, res) => {
        try {
            console.log(">>>>>>>>>>>>>>>", req.body);
            const { email, firstname, lastname, password, confirmation } = req.body;
            const bodyErrors = [];

            // Test des saisies 
            if (!email || !firstname || !lastname || !password || !confirmation) {
                bodyErrors.push('Tous les champs doivent être complétés');
            }

            // On vérifie que le mail est valide (selon le schéma)
            const emailValid = emailSchema.validate(email);
            if (emailValid.error) {
                bodyErrors.push('Le mail n\'est pas valide');
            }

            // On vérifie que le mail n'est pas déjà utilisé
            const user = await User.findOne({ where: { email: email } });
            if (user) {
                bodyErrors.push('Un compte existe déjà avec cette adresse mail');
            }

            // On vérifie le mot de passe (schéma)
            const passwordValid = passwordSchema.validate(password);
            if (passwordValid.error) {
                bodyErrors.push('mot de passe invalide');
            }

            // On vérifie que les deux mots de passe sont identiques
            if (password !== confirmation) {
                bodyErrors.push('Les mots de passe ne sont pas identiques');
            }

            // On vérifie s'il y a eu des erreurs
            if (bodyErrors.length) {
                return res.status(400).json(bodyErrors);
            } else {
                // On crypte le mot de passe
                const encodedPassword = bcrypt.hashSync(password, 10);
                let newUser = User.build({
                    email,
                    firstname,
                    lastname,
                    password: encodedPassword
                });
                await newUser.save();

                // Dans le JSON qu'on envoie, on retire le mdp
                res.status(201).json({ newUser: { email, firstname, lastname } });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur est survenue' });
        }
    },

    loginUser: async (req, res) => {
        const { email, password } = req.body;

        try {
            // Test des saisies
            if (!email || !password) {
                return res.status(400).json({ error: 'Tous les champs doivent être complétés' });
            }

            // On vérifie que l'email est associé à un compte
            const user = await User.findOne({
                where: { email: email },
                include: [
                    { association: 'friends' },
                ]
            });

            // Si l'utilisateur n'existe pas ou que le mot de passe est incorrect,
            // on renvoie un message d'erreur générique
            if (!user || !bcrypt.compareSync(password, user.password)) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
            }

            // Signature du token
            const secretKey = process.env.JWT_SECRET_KEY;
            const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY;

            // Création des tokens
            const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '30m' });
            const refreshToken = jwt.sign({ userId: user.id }, refreshSecretKey, { expiresIn: '30d' });

            // Envoi des tokens dans des cookies HttpOnly
            res.cookie('token', token, {
                httpOnly: true,
                secure: false, // mettre true quand sera en production
                sameSite: 'Strict',
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict'
            });

            // On supprime le mot de passe de l'objet utilisateur avant de l'envoyer
            delete user.password;

            // On renvoie les infos de l'utilisateur
            res.status(200).json({ user: user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur est survenue' });
        }
    },

    currentUser: async (req, res) => {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        try {
            // Vérifiez le token
            const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

            // On récupère les informations de l'utilisateur
            const user = await User.findOne({
                where: { id: payload.userId },
                include: [
                    { association: 'friends' },
                ]
            });

            if (!user) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            // Crée un nouvel objet avec seulement les informations nécessaires
            const userInfo = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastname: user.lastname,
                age: user.age,
                location: user.location,
                friends: user.friends,
            };

            // On renvoie les infos de l'utilisateur
            res.status(200).json({ user: userInfo });

        } catch (error) {
            console.error(error);

            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ error: 'Token expiré' });
            }

            res.status(500).json({ error: 'Une erreur est survenue' });
        }
    },

    logoutUser: async (req, res) => {
        // Suppression des cookies
        res.clearCookie('token');
        res.clearCookie('refreshToken');

        // Envoi d'une réponse indiquant que la déconnexion a été effectuée avec succès
        res.status(200).json({ message: 'Déconnecté avec succès' });
    },


    refreshToken: async (req, res) => {
        // Récupération du refreshToken depuis le corps de la requête
        const refreshToken = req.cookies.refreshToken;
        const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY;

        // Vérification de la présence du refreshToken
        if (!refreshToken) {
            return res.status(400).json('Refresh token is required');
        }

        try {
            // Décodage du refreshToken
            const decodedRefreshToken = jwt.verify(refreshToken, refreshSecretKey);

            // Vérification de la validité du token et de la correspondance avec un utilisateur
            const user = await User.findByPk(decodedRefreshToken.userId);
            if (!user) {
                return res.status(401).json('Invalid refresh token');
            }

            // TODO : Lié refreshtoken et user dans la bdd, pour vérifier qu'il est toujours valide

            // Génération d'un nouveau token d'accès
            const secretKey = process.env.JWT_SECRET_KEY;
            const newAccessToken = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '30m' });

            // Envoi du nouveau token d'accès dans un cookie HttpOnly
            res.cookie('token', newAccessToken, {
                httpOnly: true,
                secure: false, // mettre true quand sera en production
                sameSite: 'Strict',
            });

            // Envoi d'une réponse de succès
            res.status(200).json({ success: 'New access token generated' });
        } catch (error) {
            console.error(error);
            // En cas d'erreur de vérification, il est préférable de renvoyer une réponse générique
            // pour éviter de donner des informations sensibles
            res.status(401).json('Unauthorized');
        }
    },

    deleteToken: async (req, res) => {
        try {
            // TODO : Invalider le token (quand j'aurai mis dans la bdd les refreshtoken)

            // Envoyer une réponse indiquant que la déconnexion a été effectuée avec succès
            res.status(200).json({ message: 'Successfully logged out' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred during logout' });
        }
    },

    checkAuthStatus: async (req, res) => {
        try {
            // On vérifie la présence du refreshToken dans les cookies
            const refreshToken = req.cookies.refreshToken;

            // S'il n'est pas défini, on renvoie un état non authentifié 
            if (!refreshToken) {
                return res.status(200).json({ isAuthenticated: false });
            }

            // Utilisez le secret key pour vérifier la validité du refreshToken
            const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY;
            jwt.verify(refreshToken, refreshSecretKey);

            // Si tout est en ordre, on renvoie un état authentifié
            res.status(200).json({ isAuthenticated: true });
        } catch (error) {
            console.error(error);
            // Si une erreur se produit, état non authentifié
            res.status(200).json({ isAuthenticated: false });
        }
    },

};

export default AuthController;