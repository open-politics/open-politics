import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const postsDirectory = join(process.cwd(), 'src', 'content', 'posts');

export function getPosts() {
  const postFilenames = readdirSync(postsDirectory);

  return postFilenames.map((filename) => {
    const filePath = join(postsDirectory, filename);
    const fileContents = readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);

    return {
      slug: filename.replace('.mdx', ''),
      title: data.title || 'Untitled Post',
    };
  });
}