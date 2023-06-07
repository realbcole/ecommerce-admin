import Layout from '@/components/Layout';
import Stats from '@/components/Stats';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const HomeHeader = () => {
  const { data: session } = useSession();
  return (
    <div className="text-blue-900 flex justify-between">
      <h2>
        Hello, <b>{session?.user?.name}</b>
      </h2>
      <div className="flex text-black gap-1 rounded-lg items-center">
        <div className="items-center hidden md:flex">
          <Image
            src={session?.user?.image}
            width="40"
            height="40"
            className="rounded-full"
            alt="Profile image"
          />
          <span className="py-1 px-2">{session?.user?.name}</span>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <Layout>
      <HomeHeader />
      <Stats />
    </Layout>
  );
}
