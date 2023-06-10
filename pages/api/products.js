import { Product } from '@/models/Product';
import { mongooseConnect } from '@/lib/mongoose';
import { isAdminRequest } from './auth/[...nextauth]';

export default async function handler(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  // Add product
  if (req.method === 'POST') {
    const { title, description, price, images, category, properties } =
      req.body;

    const productDoc = await Product.create({
      title,
      description,
      price,
      images,
      category,
      properties,
    });

    res.json(productDoc);
  }

  // Update product
  if (req.method === 'PUT') {
    const { title, description, price, images, category, properties, _id } =
      req.body;

    await Product.updateOne(
      { _id },
      { title, description, price, images, category, properties }
    );

    res.json(true);
  }

  // Get products
  if (req.method === 'GET') {
    // If id is provided, get product by id
    if (req.query?.id) {
      res.json(await Product.findOne({ _id: req.query.id }));
    }
    // Else, get all products
    else {
      res.json(await Product.find());
    }
  }

  // Delete product
  if (req.method === 'DELETE') {
    await Product.deleteOne({ _id: req.query.id });
    res.json(true);
  }
}
