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

    verifyAndRefreshToken: async (req, res) => {
        try {
            // on récupère les tokens dans les cookies
            const token = req.cookies.token;
            const refreshToken = req.cookies.refreshToken;
            // On récupère les clés
            const secretKey = process.env.JWT_SECRET_KEY;
            const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY;

            // On vérifie si le token est toujours actif
            if (token) {
                try {
                    jwt.verify(token, secretKey);
                    // Si le token est valide, on renvoie une réponse positive
                    return { isAuthenticated: true };
                } catch (error) {
                    // Si l'erreur est due à une autre raison que l'expiration du token, 
                    // on renvoie isAuthenticated: false
                    if (error.name !== 'TokenExpiredError') {
                        console.error(error);
                        return { isAuthenticated: false, message: 'Invalid token' };
                    }
                }
            }

            // Si refreshToken n'est pas présent, on renvoie isAuthenticated: false
            if (!refreshToken) {
                return { isAuthenticated: false };
            }

            // Si le token n'est pas valide, on vérifie si le refreshToken est valide
            const decodedRefreshToken = jwt.verify(refreshToken, refreshSecretKey);
            // On récupère l'user
            const user = await User.findByPk(decodedRefreshToken.userId);
            if (!user) {
                return { isAuthenticated: false, message: 'Invalid refresh token' };
            }

            const newAccessToken = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '30m' });
            req.newAccessToken = newAccessToken;
            return { isAuthenticated: true, success: 'New access token generated' };
        } catch (error) {
            console.error(error);
            return { isAuthenticated: false, message: 'Internal Server Error' };
        }
    },

    checkAuthStatusAndRefreshToken: async (req, res) => {
        const result = await AuthController.verifyAndRefreshToken(req);

        // Si un nouveau token a été généré, on le défini comme cookie
        if (req.newAccessToken) {
            res.cookie('token', req.newAccessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'Strict',
            });
        }
        res.status(result.isAuthenticated ? 200 : 500).json(result);
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
            const user = await User.findByPk(payload.userId, {
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
                firstname: user.firstname,
                lastname: user.lastname,
                age: user.age,
                city: user.city,
                level: user.level,
                experience: user.experience,
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
};

export default AuthController;