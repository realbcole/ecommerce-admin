import { NextApiHandler } from 'next';
import { mongooseConnect } from '../../lib/mongoose';
import { Category } from '../../models/Category';
import { isAdminRequest } from './auth/[...nextauth]';
import { CategoryType } from '../../types';

const handler: NextApiHandler = async (req, res) => {
  await mongooseConnect();
  await isAdminRequest(req, res);

  // Add category
  if (req.method === 'POST') {
    const { name, parentCategory, properties } = req.body;

    const categoryDoc: CategoryType = await Category.create({
      name,
      parent: parentCategory || undefined,
      properties,
    });

    res.json(categoryDoc);
  }

  // Update category
  if (req.method === 'PUT') {
    const { name, parentCategory, _id, properties } = req.body;

    const categoryDoc: CategoryType = await Category.updateOne(
      { _id },
      { name, parent: parentCategory || undefined, properties }
    );

    res.json(categoryDoc);
  }

  // Get all categories
  if (req.method === 'GET') {
    const categories: CategoryType[] = await Category.find().populate('parent');
    res.json(categories);
  }

  // Delete category
  if (req.method === 'DELETE') {
    const id: string | string[] = req.query._id;
    await Category.deleteOne({ id });
    res.json(true);
  }
};

export default handler;
