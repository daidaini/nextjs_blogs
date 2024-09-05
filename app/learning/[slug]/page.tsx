import { notFound } from 'next/navigation';
import { allLearnings } from 'contentlayer/generated';
import MDX from '@/components/MDX';

export const generateStaticParams = async () => allLearnings.map((item) => ({ slug: item.slug }));

export const generateMetadata = async ({ params }) => {
  const books = allLearnings.find((item) => item.slug === params.slug);
  return {
    title: `${books.title} - books for learning`,
    description: books.description,
  };
};

export default async function Page({ params }) {
  const books = allLearnings.find((item) => item.slug === params.slug);

  if (!books) {
    return notFound();
  }

  return (
    <>
      <div className="flex flex-col items-center px-2 pt-12 pb-8">
        <h1 className="font-medium text-2xl">{books.title}</h1>
        <p className="mt-2 text-gray-500 text-sm font-mono">{books.date}</p>
      </div>
      <article className="px-2 prose max-w-none">
        <MDX code={books.body.code} />
      </article>
    </>
  );
}
