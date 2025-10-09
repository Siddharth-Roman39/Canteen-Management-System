import MenuItem from '../models/menuitem.js';

// ADMIN - Add new menu item
export const addMenuItem = async (req, res) => {
    try {
        const { itemName, price, category, description } = req.body;
        
        if (!itemName || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please fill out all required fields'
            });
        }

        const newItem = new MenuItem({
            itemName,
            price,
            category,
            description,
            availability: 'In Stock',
            isActive: true,
            createdBy: req.user.email
        });

        await newItem.save();
        
        console.log('✅ Menu item saved to MongoDB:', newItem);
        
        res.status(201).json({
            success: true,
            message: 'Menu item added successfully',
            data: newItem
        });
    } catch (error) {
        console.error('❌ Error adding menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding item'
        });
    }
};

// ADMIN - Get all menu items
export const getAllMenuItems = async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching items'
        });
    }
};

// ADMIN - Update menu item
export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const updatedItem = await MenuItem.findByIdAndUpdate(
            id,
            {
                ...updates,
                lastModifiedBy: req.user.email,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );
        
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Menu item updated successfully',
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating item'
        });
    }
};

// ADMIN - Delete menu item
export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await MenuItem.findByIdAndDelete(id);
        
        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting item'
        });
    }
};

// STAFF - Manage stock availability
export const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { availability } = req.body;
        
        const item = await MenuItem.findByIdAndUpdate(
            id,
            {
                availability,
                lastModifiedBy: req.user.email,
                updatedAt: Date.now()
            },
            { new: true }
        );
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }
        
        console.log(`✅ Availability toggled: ${item.itemName} → ${availability}`);
        
        res.status(200).json({
            success: true,
            message: `Item marked as ${availability}`,
            data: item
        });
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating availability'
        });
    }
};

// STAFF - View all menu items
export const getStaffMenuItems = async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ category: 1, itemName: 1 });
        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching items'
        });
    }
};

// STUDENT - View available menu items only
export const getStudentMenu = async (req, res) => {
    try {
        const { category, search } = req.query;
        
        let query = {
            availability: 'In Stock',
            isActive: true
        };
        
        if (category && category !== 'All') {
            query.category = category;
        }
        
        if (search) {
            query.itemName = { $regex: search, $options: 'i' };
        }
        
        const items = await MenuItem.find(query).sort({ category: 1, itemName: 1 });
        
        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching student menu:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching menu'
        });
    }
};
