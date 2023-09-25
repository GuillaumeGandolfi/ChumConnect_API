import association from '../models/association.js';
const User = association.User;

const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY || 'default-secret-key';

const tokenMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json('Authorization header missing or invalid');
    }

    const token = authHeader.split(' ')[1];

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

module.exports = tokenMiddleware;