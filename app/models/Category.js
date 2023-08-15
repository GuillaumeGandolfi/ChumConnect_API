import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Category extends Model { }

Category.init({
    label: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    }
},
    {
        sequelize,
        modelName: 'Category',
        tableName: 'category',
    });

export default Category;