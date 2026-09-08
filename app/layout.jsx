import './globals.css';
import localFont from 'next/font/local';
import Header from '../components/Header';
import Footer from '../components/Footer';

// JMH Typewriter Dry — replaces the free Google Font look-alikes for both
// display and body roles.
// NOTE: these files ship with a "Personal Use Only" license — confirm or
// upgrade licensing before this goes live on the public site.
const franklin = localFont({
  src: [
    { path: './fonts/JMH Typewriter dry-Thin.otf', weight: '300', style: 'normal' },
    { path: './fonts/JMH Typewriter dry.otf', weight: '400', style: 'normal' },
    { path: './fonts/JMH Typewriter dry-Bold.otf', weight: '700', style: 'normal' },
    { path: './fonts/JMH Typewriter dry-Black.otf', weight: '900', style: 'normal' },
  ],
  variable: '--font-franklin',
  display: 'swap',
});
const hanken = localFont({
  src: [
    { path: './fonts/JMH Typewriter dry-Thin.otf', weight: '300', style: 'normal' },
    { path: './fonts/JMH Typewriter dry.otf', weight: '400', style: 'normal' },
    { path: './fonts/JMH Typewriter dry-Bold.otf', weight: '700', style: 'normal' },
    { path: './fonts/JMH Typewriter dry-Black.otf', weight: '900', style: 'normal' },
  ],
  variable: '--font-hanken',
  display: 'swap',
});

export const metadata = {
  title: 'Guido Sforni',
  description: 'Work, documentary, photography and writing by Guido Sforni.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${franklin.variable} ${hanken.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
