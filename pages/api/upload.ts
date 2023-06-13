import multiparty, { Form } from 'multiparty';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import mime from 'mime-types';
import { mongooseConnect } from '../../lib/mongoose';
import { isAdminRequest } from './auth/[...nextauth]';
import { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
  await mongooseConnect();
  await isAdminRequest(req, res);

  const bucketName: string | undefined = process.env.S3_BUCKET_NAME;

  // Get files from request
  const form: Form = new multiparty.Form();
  const { files }: { fields: any; files: any } = await new Promise(
    (resolve, reject) => {
      form.parse(req, (err: Error | null, fields: any, files: any) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    }
  );

  // Create S3 client
  const client: S3Client = new S3Client({
    region: 'us-east-2',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
  });

  // Upload each file
  const links: string[] = [];
  for (const file of files.file) {
    const ext: string = file.originalFilename.split('.').pop();
    const newFilename: string = Date.now() + '.' + ext;
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: newFilename,
        Body: fs.readFileSync(file.path),
        ACL: 'public-read',
        ContentType: mime.lookup(file.path),
      })
    );
    const link: string = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
    links.push(link);
  }

  // Return links
  return res.json({ links });
};

export const config = {
  api: { bodyParser: false },
};

export default handler;
