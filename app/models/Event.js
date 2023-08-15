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
        allowNUll: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    hour: {
        type: DataTypes.DATE,
        allowNull: false
    },
    location: {
        type: DataTypes.TEXT,
        allowNull: false
    },
},
    {
        sequelize,
        modelName: 'Event',
        tableName: 'event'
    });

export default Event;