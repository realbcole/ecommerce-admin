import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import NavBar from './NavBar';
import Logo from './Logo';
import MenuIcon from './icons/MenuIcon';

// Layout component
// Seperates the navbar from the rest of the page
export default function Layout({ children }) {
  // State for showing the navbar on mobile
  const [showNavBar, setShowNavBar] = useState(false);

  // Get the session
  const { data: session } = useSession();

  // If there is no session, show a login button
  if (!session) {
    return (
      <div className="bg-primaryDark w-screen h-screen flex items-center">
        <div className="text-center w-full">
          <button
            onClick={() => signIn('google')}
            className="bg-secondaryBg p-2 text-primaryDark rounded-lg px-4"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primaryDark min-h-screen">
      {/* Navbar for mobile screens */}
      <div className="md:hidden flex items-center p-4 text-secondaryBg fixed bg-primaryDark w-full">
        <button onClick={() => setShowNavBar(!showNavBar)}>
          <MenuIcon />
        </button>
        <div className="flex grow justify-center mr-6">
          <Logo />
        </div>
      </div>

      {/* Navbar for desktop screens */}
      <div className="flex">
        <NavBar show={showNavBar} />
        <div className="bg-primaryBg flex-grow rounded-md p-4 min-h-screen mt-[60px] md:mt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
