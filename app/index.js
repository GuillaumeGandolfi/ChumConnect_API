// Config application
import express from "express";

// Import des routes
import router from "./routes/router.js";

import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
const bodyParser = multer();

// Import de la documentation swagger
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./documentation/swagger.json" assert { type: "json" };

// import session from "express-session";
// TODO : Faire un middleware de session

const app = express();

// On autorise tout les domaines à faire du Cross Origin Resource Sharing.
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true, // Autorise l'envoi de cookies lors de requêtes cross-origin
}));

app.use(cookieParser()); // Pour les cookies
app.use(bodyParser.none()); // Pour les requêtes multipart/form-data
app.use(express.json()); // Pour les requêtes application/json

/** Pour plus tard, si jamais je fais un back office en ejs :
app.set('view engine', 'ejs');
app.set('views', './app/view'); */

// On utilise les routes
app.use(router);

// On utilise la documentation swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;