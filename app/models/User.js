import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class User extends Model { }

User.init({
    email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    firstname: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    lastname: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    localization: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    level: {
        type: DataTypes.INTEGER,
    },
    experience: {
        type: DataTypes.INTEGER,
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },

},
    {
        sequelize,
        modelName: 'User',
        tableName: 'user',
    });

export default User;