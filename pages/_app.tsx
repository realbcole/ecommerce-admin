import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { AppProps } from '../types';

// App component
const App: React.FC<AppProps> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default App;
