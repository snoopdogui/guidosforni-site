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

// Applies the stored theme before first paint, so there's no flash of the
// wrong palette. This has to be a plain inline <script> in <head>, executed
// synchronously — next/script's beforeInteractive still runs after the initial
// paint for this purpose, and a useEffect in a client component runs later
// still. The pages are statically generated, so the server cannot know the
// theme; the attribute is set here and <html> is marked
// suppressHydrationWarning because React would otherwise flag the mismatch.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');
if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}
document.documentElement.setAttribute('data-theme',t);}catch(e){
document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${franklin.variable} ${hanken.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
