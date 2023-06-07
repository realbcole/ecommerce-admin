import { mongooseConnect } from '@/lib/mongoose';
import { isAdminRequest } from './auth/[...nextauth]';
import { Admin } from '@/models/Admin';

export default async function handler(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (req.method === 'POST') {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (await Admin.findOne({ email })) {
      res.status(400).json({ message: 'Admin already exists' });
    } else {
      const admin = await Admin.create({ email });
      return res.json(admin);
    }
  }

  if (req.method === 'GET') {
    res.json(await Admin.find());
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    await Admin.findByIdAndDelete(id);
    res.json(true);
  }
}
