import { mongooseConnect } from '../../lib/mongoose';
import { isAdminRequest } from './auth/[...nextauth]';
import { Admin } from '../../models/Admin';
import { NextApiHandler } from 'next';
import { AdminType } from '../../types';

const handler: NextApiHandler = async (req, res) => {
  await mongooseConnect();
  await isAdminRequest(req, res);

  // Add admin
  if (req.method === 'POST') {
    // Check if email is provided
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if admin already exists
    if (await Admin.findOne({ email })) {
      res.status(400).json({ message: 'Admin already exists' });
    }
    // If not, create admin
    else {
      const admin: AdminType = await Admin.create({ email });
      return res.json(admin);
    }
  }

  // Get all admins
  if (req.method === 'GET') {
    res.json(await Admin.find());
  }

  // Delete admin
  if (req.method === 'DELETE') {
    const { id } = req.query;
    await Admin.findByIdAndDelete(id);
    res.json(true);
  }
};

export default handler;
