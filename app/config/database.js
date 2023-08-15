import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

// On charge les variables d'environnement depuis le fichier .env
dotenv.config();

const defineAttributes = {
    define: {
        underscored: true, // Utilisation des noms de colonnes en snake_case
        createdAt: "created_at", // Utilisation de "created_at" au lieu de "createdAt"
        updatedAt: "updated_at", // Utilisation de "updated_at" au lieu de "updatedAt"
    }
};

const sequelize = new Sequelize({
    // On récupère les infos de la bdd
    dialect: 'postgres',
    username: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    ...defineAttributes, // Inclut la configuration commune des attributs
});

export default sequelize;