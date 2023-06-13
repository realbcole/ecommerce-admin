import mongoose, { Schema, model, models } from 'mongoose';
import { CategorySchema } from './Category';

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    images: [{ type: String }],
    category: { type: CategorySchema, ref: 'Category' },
    properties: { type: Object },
    stripePriceId: { type: String },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product = models.Product || model('Product', ProductSchema);
