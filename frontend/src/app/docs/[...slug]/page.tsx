import { MDXRemote } from 'next-mdx-remote/rsc';
import { useMDXComponents } from '@/mdx-components';
import { useEffect, useState } from 'react';
import axios from 'axios';

const components = useMDXComponents({});

export default function DocPage({ params }) {
  const [content, setContent] = useState('');
  const slug = params.slug.join('/');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/v1/editor/mdx/${slug}`);
        setContent(response.data);
      } catch (error) {
        console.error('Error fetching MDX content:', error);
      }
    };

    fetchData();
  }, [slug]);

  return (
    <div className="prose dark:prose-dark">
      <MDXRemote source={content} components={components} />
    </div>
  );
}

export async function generateStaticParams() {
  const response = await axios.get('/api/v1/editor/structure');
  const structure = response.data.structure;

  return structure.map((path) => ({
    slug: path.replace(/\.mdx$/, '').split('/'),
  }));
}