import { Metadata } from 'next';
import { Lato } from 'next/font/google';
import { compareDesc } from 'date-fns';
import List from '@/components/List';
import { allBlogs } from 'contentlayer/generated';

const font = Lato({
  weight: '700',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: `zejun's blogs`,
};

export default async function Page() {
  const blogList = allBlogs.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  return (
    <>
      <div className="pt-10 pb-6 px-3">
        <h1
          className={`flex flex-col text-3xl text-black leading-normal tracking-wider ${font.className}`}
        >
          博客 / Blog
        </h1>
        <p className="mt-4 text-gray-600 text-sm leading-relaxed">
          我会在这分享自己折腾时的技术心得
        </p>
      </div>

      <List data={blogList} />
    </>
  );
}
