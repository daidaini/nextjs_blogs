import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const menu_list = [
  {
    title: '首页',
    href: '/',
  },
  {
    title: '技术博客',
    href: '/blog',
  },
  {
    title: '生活杂记',
    href: '/notes',
  },
  {
    title: '阅读学习',
    href: '/learning',
  },
  // {
  //   title: '关于',
  //   href: '/about',
  // },
];

const Menu: FC = () => {
  return (
    <nav className="flex items-center justify-between pt-6 px-2">
      <Link href="/" className="flex shadow-sm rounded-full overflow-hidden border">
        <Image src="/blog_icon.jpeg" alt="zejun's icon" width={34} height={34} />
      </Link>
      <ul className="flex px-3 bg-white rounded-full shadow-lg shadow-gray-100 ring-1 ring-gray-100">
        {menu_list.map((item) => (
          <li
            key={item.title}
            className="px-3 py-2 text-sm text-gray-700 transition-colors hover:text-black"
          >
            <Link href={item.href}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Menu;
