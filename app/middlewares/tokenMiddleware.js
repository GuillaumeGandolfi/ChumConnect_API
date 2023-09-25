import association from '../models/association.js';
const User = association.User;

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY || 'default-secret-key';

const tokenMiddleware = async (req, res, next) => {
    const token = req.cookies.token; // Récupérer le token du cookie

    if (!token) {
        return res.status(401).json('Token missing or invalid');
    }

    try {
        const decodedToken = jwt.verify(token, secretKey);
        req.userId = decodedToken.userId;

        const user = await User.findByPk(decodedToken.userId);
        if (!user) {
            return res.status(403).json('User associated with token not found');
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(401).json('Unauthorized');
    }
}

export default tokenMiddleware;