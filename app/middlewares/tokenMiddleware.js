import association from '../models/association.js';
const User = association.User;

import AuthController from '../controllers/AuthController.js';

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY || 'default-secret-key';
const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY || 'default-refresh-secret-key';

const tokenMiddleware = async (req, res, next) => {
    const token = req.cookies.token; // Récupérer le token du cookie

    if (!token) {
        return res.status(401).json('Token introuvable');
    }

    try {
        const decodedToken = jwt.verify(token, secretKey);
        req.userId = decodedToken.userId;

        const user = await User.findByPk(decodedToken.userId);
        if (!user) {
            return res.status(403).json('Association utilisateur / token introuvable');
        }

        next();
    } catch (error) {
        console.error(error);
        if (error instanceof jwt.TokenExpiredError) {
            try {
                // Si le token est expiré, on essaye de le rafraîchir
                await AuthController.refreshToken(req, res);
                // Si tout va bien, on déchiffre le nouveau token pour obtenir l'ID utilisateur
                const decodedNewToken = jwt.verify(newToken, secretKey);
                req.userId = decodedNewToken.userId;

                next();
            } catch (refreshError) {
                console.error(refreshError);
                return res.status(500).json({ error: 'Une erreur est survenue lors du rafraîchissement du token' });
            }
        } else {
            return res.status(401).json({ error: 'Non autorisé' });
        }
    }
}

export default tokenMiddleware;