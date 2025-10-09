// ============================================
// 1. MONGOOSE SCHEMA (models/MenuItem.js)
// ============================================
import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Snack', 'Beverage', 'Main Course', 'Desserts'],
    required: true 
  },
  description: { type: String },
  availability: { 
    type: String, 
    enum: ['In Stock', 'Out of Stock'],
    default: 'In Stock' 
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, default: 'admin' },
  lastModifiedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('MenuItem', menuItemSchema);
