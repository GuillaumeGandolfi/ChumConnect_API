import association from '../models/association.js';
const User = association.User;

import bcrypt from 'bcrypt';
import Joi from 'joi';

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

            // On supprime le mot de passe de l'objet utilisateur avant de l'envoyer
            delete user.password;

            // Signature du token
            const secretKey = process.env.JWT_SECRET_KEY;
            const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

            // On renvoie les infos de l'utilisateur
            res.status(200).json({ user: user, token: token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur est survenue' });
        }
    }
}

export default AuthController;