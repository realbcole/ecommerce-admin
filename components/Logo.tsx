import React from 'react';
import Link from 'next/link';
import StoreIcon from './icons/StoreIcon';
import { IconProps } from '../types';

// Logo component
// Shows store icon and admin
const Logo: React.FC<IconProps> = () => {
  return (
    <Link href={'/'} className="flex gap-1 text-xl items-center">
      <StoreIcon />
      <span className="">Admin</span>
    </Link>
  );
};

export default Logo;
