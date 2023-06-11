import React from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Logo from './Logo';
import HomeIcon from './icons/HomeIcon';
import ProductIcon from './icons/ProductIcon';
import CategoryIcon from './icons/CategoryIcon';
import OrdersIcon from './icons/OrdersIcon';
import AdminsIcon from './icons/AdminsIcon';
import SettingsIcon from './icons/SettingsIcon';
import LogOutIcon from './icons/LogOutIcon';

// Navbar component
const NavBar = ({ show }) => {
  const router = useRouter();
  const { pathname } = router;
  const inactiveLink = 'flex items-center gap-1 p-1 pr-4 text-xl';
  const activeLink =
    inactiveLink + ' bg-primaryBg text-primaryDark rounded-l-lg';

  async function logOut() {
    await router.push('/');
    await signOut();
  }

  return (
    <aside
      className={`${
        show ? 'left-0' : '-left-full'
      } text-secondaryBg py-4 pl-4 fixed w-full bg-primaryDark min-h-screen md:static md:w-auto transition-all`}
    >
      <div className="mb-4 hidden md:block px-1">
        <Logo />
      </div>

      <nav className="flex flex-col gap-2">
        <Link
          href={'/'}
          className={pathname === '/' ? activeLink : inactiveLink}
        >
          <HomeIcon />
          Dashboard
        </Link>
        <Link
          href={'/products'}
          className={pathname.includes('/products') ? activeLink : inactiveLink}
        >
          <ProductIcon />
          Products
        </Link>
        <Link
          href={'/categories'}
          className={
            pathname.includes('/categories') ? activeLink : inactiveLink
          }
        >
          <CategoryIcon />
          Categories
        </Link>
        <Link
          href={'/orders'}
          className={pathname.includes('/orders') ? activeLink : inactiveLink}
        >
          <OrdersIcon />
          Orders
        </Link>
        <Link
          href={'/admins'}
          className={pathname.includes('/admins') ? activeLink : inactiveLink}
        >
          <AdminsIcon />
          Admins
        </Link>
        <Link
          href={'/settings'}
          className={pathname.includes('/settings') ? activeLink : inactiveLink}
        >
          <SettingsIcon />
          Settings
        </Link>
        <button onClick={logOut} className={inactiveLink}>
          <LogOutIcon />
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default NavBar;
