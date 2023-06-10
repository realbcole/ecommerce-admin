import { mongooseConnect } from '@/lib/mongoose';
import { isAdminRequest } from './auth/[...nextauth]';
import { Settings } from '@/models/Settings';

export default async function handler(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  // Update settings
  if (req.method === 'PUT') {
    const { name, value } = req.body;

    // Check if settings already exists
    let settingsDoc = await Settings.findOne({ name });

    // If exists, update
    if (settingsDoc) {
      settingsDoc.value = value;
      await settingsDoc.save();
    }
    // If not, create
    else {
      settingsDoc = await Settings.create({ name, value });
    }

    res.json(settingsDoc);
  }

  // Get settings
  if (req.method === 'GET') {
    res.json(await Settings.findOne({ name: req.query.name }));
  }
}
