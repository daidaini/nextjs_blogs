import { MetadataRoute } from 'next';
import { compareDesc } from 'date-fns';
import { allBlogs, allNotes } from 'contentlayer/generated';

export default function sitemap(): MetadataRoute.Sitemap {
  const allPost = [...allBlogs, ...allNotes]
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .map((item) => ({
      url: `https://pengtikui.cn${item.url}`,
      lastModified: new Date(),
    }));

  return [
    {
      url: 'https://pengtikui.cn',
      lastModified: new Date(),
    },
    ...allPost,
  ];
}
