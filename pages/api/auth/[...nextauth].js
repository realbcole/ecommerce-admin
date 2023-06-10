import NextAuth, { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import { mongooseConnect } from '@/lib/mongoose';
import { Admin } from '@/models/Admin';

export const authOptions = {
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: async ({ session }) => {
      if (await isAdminEmail(session?.user?.email)) return session;
      else return false;
    },
    signIn: async (profile) => {
      const isAdmin = await isAdminEmail(profile.user.email);
      return isAdmin;
    },
  },
};

// Checks if user is an admin, if not, throws an error
export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!(await isAdminEmail(session?.user?.email))) {
    res.status(401);
    res.end();
    throw 'not an admin';
  }
}

// Checks if an email is an admin email
async function isAdminEmail(email) {
  await mongooseConnect();
  return !!(await Admin.findOne({ email }));
}

export default NextAuth(authOptions);
