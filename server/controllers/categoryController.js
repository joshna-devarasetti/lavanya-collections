const Category = require('../models/Category');

// Get all active categories (Public)
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all categories (including inactive)
const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Create category
const createCategory = async (req, res, next) => {
  try {
    const { name, description, imageUrl, displayOrder } = req.body;

    const category = await Category.create({
      name,
      description,
      imageUrl,
      displayOrder: displayOrder || 0
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Update category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, displayOrder, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (imageUrl !== undefined) category.imageUrl = imageUrl;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully.',
      category
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Delete or deactivate category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Soft delete / toggle isActive
    category.isActive = false;
    await category.save();

    res.json({
      success: true,
      message: 'Category deactivated successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
