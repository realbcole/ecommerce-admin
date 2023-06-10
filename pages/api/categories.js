import { mongooseConnect } from '@/lib/mongoose';
import { Category } from '@/models/Category';
import { isAdminRequest } from './auth/[...nextauth]';

export default async function handler(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  // Add category
  if (req.method === 'POST') {
    const { name, parentCategory, properties } = req.body;

    const categoryDoc = await Category.create({
      name,
      parent: parentCategory || undefined,
      properties,
    });

    res.json(categoryDoc);
  }

  // Update category
  if (req.method === 'PUT') {
    const { name, parentCategory, _id, properties } = req.body;

    const categoryDoc = await Category.updateOne(
      { _id },
      { name, parent: parentCategory || undefined, properties }
    );

    res.json(categoryDoc);
  }

  // Get all categories
  if (req.method === 'GET') {
    const categories = await Category.find().populate('parent');
    res.json(categories);
  }

  // Delete category
  if (req.method === 'DELETE') {
    await Category.deleteOne(req.query._id);
    res.json(true);
  }
}
