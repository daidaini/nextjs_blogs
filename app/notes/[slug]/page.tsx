import { notFound } from 'next/navigation';
import { allNotes } from 'contentlayer/generated';
import MDX from '@/components/MDX';

export const generateStaticParams = async () => allNotes.map((item) => ({ slug: item.slug }));

export const generateMetadata = async ({ params }) => {
  const lifes = allNotes.find((item) => item.slug === params.slug);
  return {
    title: `${lifes.title} - notes for life`,
    description: lifes.description,
  };
};

export default async function Page({ params }) {
  const lifes = allNotes.find((item) => item.slug === params.slug);

  if (!lifes) {
    return notFound();
  }

  return (
    <>
      <div className="flex flex-col items-center px-2 pt-12 pb-8">
        <h1 className="font-medium text-2xl">{lifes.title}</h1>
        <p className="mt-2 text-gray-500 text-sm font-mono">{lifes.date}</p>
      </div>
      <article className="px-2 prose max-w-none">
        <MDX code={lifes.body.code} />
      </article>
    </>
  );
}
