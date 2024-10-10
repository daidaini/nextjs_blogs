import Link from 'next/link';
import { Anton } from 'next/font/google';
import { AlignJustifyIcon } from 'lucide-react';
import { compareDesc } from 'date-fns';
import Social from '@/components/Social';
import List from '@/components/List';
import { allBlogs, allNotes, allLearnings } from 'contentlayer/generated';

const font = Anton({
  weight: '400',
  subsets: ['vietnamese'],
});

export default async function Page() {
  const lifeList = allNotes
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .slice(0, 3);

  const blogList = allBlogs
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .slice(0, 6);

  const learningList = allLearnings
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .slice(0, 3);

  return (
    <>
      <div className="pt-10 pb-6 px-3">
        <h1
          className={`flex flex-col text-3xl text-black leading-normal tracking-wider ${font.className}`}
        >
          <span>Coding and Life</span>
        </h1>
        <div className="mt-6 text-gray-900 space-y-1.5">
          <p> 😅 多点内容创作，加油！！！😉 </p>
          <p> 🤔 zejun / what is the most wonderful thing in the world? </p>
        </div>
        <Social />
      </div>
      <div className="mt-12">
        <div className="flex items-center justify-between px-3">
          <h2 className="font-bold text-3xl text-center text-gray-900">技术博客</h2>
          <Link
            className="text-blue-600 transition-colors hover:text-blue-800"
            href="/blog"
            title="查看全部"
          >
            <AlignJustifyIcon size={20} />
          </Link>
        </div>
        <List data={blogList} className="mt-3 font-normal text-1xl" />
      </div>
      <div className="mt-12">
        <div className="flex items-center justify-between px-3">
          <h2 className="font-bold text-3xl text-pretty text-black">生活杂记</h2>
          <Link
            className="text-blue-600 transition-colors hover:text-blue-800"
            href="/notes"
            title="查看全部"
          >
            <AlignJustifyIcon size={20} />
          </Link>
        </div>
        <List data={lifeList} className="mt-3" />
      </div>
      <div className="mt-12">
        <div className="flex items-center justify-between px-3">
          <h2 className="font-bold text-3xl text-pretty text-black">学习的事</h2>
          <Link
            className="text-blue-600 transition-colors hover:text-blue-800"
            href="/learning"
            title="查看全部"
          >
            <AlignJustifyIcon size={20} />
          </Link>
        </div>
        <List data={learningList} className="mt-3" />
      </div>
    </>
  );
}
