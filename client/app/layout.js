import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Providers from '../redux/StoreProvider';
import './globals.css';
import MetadataUpdater from './components/MetaDataUpdater';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <MetadataUpdater />
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
