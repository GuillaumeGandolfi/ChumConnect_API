import AuthController from '../controllers/AuthController.js';

import jwt from 'jsonwebtoken';

const tokenMiddleware = async (req, res, next) => {
    const result = await AuthController.verifyAndRefreshToken(req);

    if (!result.isAuthenticated) {
        // Si l'utilisateur n'est pas authentifié,on retourne une erreur
        return res.status(401).json({ error: result.message || 'Non autorisé' });
    }

    // Si tout va bien, on stock l'ID de l'utilisateur dans la requête
    const decodedToken = jwt.decode(req.cookies.token);
    req.userId = decodedToken.userId;

    // Si tout va bien, passez au middleware ou routeur suivant.
    next();
}

export default tokenMiddleware;