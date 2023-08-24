import association from '../models/association.js';

const { Category } = association;


const categoryController = {
    // Récupérer toutes les catégories
    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.findAll();
            res.status(200).json(categories);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Récupérer une catégorie
    getOneCategory: async (req, res) => {
        const categoryId = req.params.id;
        try {
            const category = await Category.findByPk(categoryId);

            if (!category) {
                return res.status(404).json(`Catégorie inexistante ou introuvable`);
            }
            res.status(200).json(category);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Créer une catégorie
    createCategory: async (req, res) => {
        try {
            const { label } = req.body;

            if (!label) {
                return res.status(400).json(`Le champ label est obligatoire`);
            }

            const newCategory = await Category.build({
                label
            });
            await newCategory.save();
            res.status(201).json(newCategory);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Modifier une catégorie
    updateCategory: async (req, res) => {
        const categoryId = req.params.id;

        try {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(404).json(`Catégorie inexistante ou introuvable`);
            } else {
                const { label } = req.body;
                if (label) {
                    category.label = label;
                }
                await category.save();
                res.status(200).json(category);
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },

    // Supprimer une catégorie
    deleteCategory: async (req, res) => {
        const categoryId = req.params.id;

        try {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(404).json(`Catégorie inexistante ou introuvable`);
            } else {
                await category.destroy();
                res.status(200).json(`Catégorie supprimée avec succès`);
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    },
}


export default categoryController;