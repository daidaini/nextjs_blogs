import { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import Menu from '../components/Menu';
import './globals.css';
import Footer from '../components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'coding and life',
  description: 'zejun 的个人网站，关于coding，关于life',
  authors: [{ name: 'zejun', url: 'http://www.zejunyu.com' }],
  other: {
    'baidu-site-verification': 'codeva-vCZMO1BPzq',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="max-w-3xl mx-auto px-2">
        <Menu />
        {children}
        <Footer />
      </body>
    </html>
  );
}
