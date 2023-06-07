import { mongooseConnect } from '@/lib/mongoose';
import { isAdminRequest } from './auth/[...nextauth]';
import { Settings } from '@/models/Settings';

export default async function handler(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (req.method === 'PUT') {
    const { name, value } = req.body;
    let settingsDoc = await Settings.findOne({ name });
    if (settingsDoc) {
      settingsDoc.value = value;
      await settingsDoc.save();
    } else {
      settingsDoc = await Settings.create({ name, value });
    }
    res.json(settingsDoc);
  }

  if (req.method === 'GET') {
    const { name } = req.query;
    res.json(await Settings.findOne({ name }));
  }
}
