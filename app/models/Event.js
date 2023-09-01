import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Event extends Model { }

Event.init({
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    location: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'category', // Nom de la table (à vérifier)
            key: 'id'
        }
    },
    organizer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user', // Nom de la table
            key: 'id'
        }
    }
},
    {
        sequelize,
        modelName: 'Event',
        tableName: 'event'
    });

export default Event;