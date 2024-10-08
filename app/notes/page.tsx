import { Metadata } from 'next';
import { Lato } from 'next/font/google';
import { compareDesc } from 'date-fns';
import List from '@/components/List';
import { allNotes } from 'contentlayer/generated';

const font = Lato({
  weight: '700',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: `my notes for life `,
};

export default async function Page() {
  const noteList = allNotes.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  return (
    <>
      <div className='content'>
        <div className="pt-10 pb-6 px-3">
          <h1
            className={`flex flex-col text-3xl text-black leading-normal tracking-wider ${font.className}`}
          >
            生活杂记 / Life
          </h1>
          <p className="mt-4 text-gray-600 text-sm leading-relaxed">
            我会在这分享生活记录点滴
          </p>
        </div>
        <List data={noteList} />
      </div >
    </>
  );
}
