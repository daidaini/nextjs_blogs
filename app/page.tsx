import Link from 'next/link';
import { Anton } from 'next/font/google';
import { ArrowUpRightIcon } from 'lucide-react';
import { compareDesc } from 'date-fns';
import Social from '@/components/Social';
import List from '@/components/List';
import { allBlogs, allNotes } from 'contentlayer/generated';

const font = Anton({
  weight: '400',
  subsets: ['latin'],
});

export default async function Page() {
  const weeklyList = allNotes
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .slice(0, 5);

  const blogList = allBlogs
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .slice(0, 5);

  return (
    <>
      <div className="pt-10 pb-6 px-3">
        <h1
          className={`flex flex-col text-3xl text-black leading-normal tracking-wider ${font.className}`}
        >
          <span>Here is zejun</span>
        </h1>
        <div className="mt-6 text-gray-900 space-y-1.5">
          <p>🥰 Keep finding something fun to do</p>
          {/*
          <p>🧑‍💻 前端开发者 / Front-end Developer</p>
          <p>
            🤩{' '}
            <a href="https://sotake.com" target="_blank" className="hover:underline">
              sotake.com
            </a>
            <span className="mx-1">·</span>
            <a href="https://kee.so" target="_blank" className="hover:underline">
              kee.so
            </a>
          </p>
          */}
        </div>
        <Social />
      </div>
      <div className="mt-8">
        <div className="flex items-center justify-between px-3">
          <h2 className="font-medium text-xl text-gray-800">博客</h2>
          <Link
            className="text-gray-400 transition-colors hover:text-gray-600"
            href="/blog"
            title="查看全部"
          >
            <ArrowUpRightIcon size={20} />
          </Link>
        </div>
        <List data={blogList} className="mt-4" />
      </div>
      <div className="mt-8">
        <div className="flex items-center justify-between px-3">
          <h2 className="font-medium text-xl text-gray-800">生活杂记</h2>
          <Link
            className="text-gray-400 transition-colors hover:text-gray-600"
            href="/notes"
            title="查看全部"
          >
            <ArrowUpRightIcon size={20} />
          </Link>
        </div>
        <List data={weeklyList} className="mt-4" />
      </div>

    </>
  );
}
