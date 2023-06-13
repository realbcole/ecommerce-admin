import { NextApiHandler } from 'next';
import { mongooseConnect } from '../../lib/mongoose';
import { Order } from '../../models/Order';
import { isAdminRequest } from './auth/[...nextauth]';

const handler: NextApiHandler = async (req, res) => {
  await mongooseConnect();
  await isAdminRequest(req, res);

  // Get all orders
  res.json(await Order.find().sort({ createdAt: -1 }));
};

export default handler;
