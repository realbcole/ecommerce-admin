import React from 'react';
import Link from 'next/link';
import StoreIcon from './icons/StoreIcon';

// Logo component
// Shows store icon and admin
const Logo = () => {
  return (
    <Link href={'/'} className="flex gap-1 text-xl items-center">
      <StoreIcon />
      <span className="">Admin</span>
    </Link>
  );
};

export default Logo;
