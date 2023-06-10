import { mongooseConnect } from '@/lib/mongoose';
import { Order } from '@/models/Order';
import { isAdminRequest } from './auth/[...nextauth]';

export default async function handler(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  // Get all orders
  res.json(await Order.find().sort({ createdAt: -1 }));
}
