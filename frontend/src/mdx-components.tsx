import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">{children}</h1>,
    h2: ({ children }) => <h2 className="text-3xl font-semibold mt-12 mb-4 text-gray-800 dark:text-gray-200">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-medium mt-8 mb-3 text-gray-700 dark:text-gray-300">{children}</h3>,
    h4: ({ children }) => <h4 className="text-xl font-medium mt-6 mb-2 text-gray-700 dark:text-gray-300">{children}</h4>,
    p: ({ children }) => <p className="my-4 text-gray-600 dark:text-gray-400">{children}</p>,
    ul: ({ children }) => <ul className="my-4 list-disc pl-6 text-gray-600 dark:text-gray-400">{children}</ul>,
    ol: ({ children }) => <ol className="my-4 list-decimal pl-6 text-gray-600 dark:text-gray-400">{children}</ol>,
    li: ({ children }) => <li className="my-2">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
    em: ({ children }) => <em className="italic text-gray-800 dark:text-gray-200">{children}</em>,
    code: ({ children }) => <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono text-gray-800 dark:text-gray-200">{children}</code>,
    blockquote: ({ children }) => <blockquote className="pl-4 my-6 border-l-4 border-gray-300 dark:border-gray-700 italic text-gray-700 dark:text-gray-300">{children}</blockquote>,
    hr: () => <hr className="my-8 border-t border-gray-300 dark:border-gray-700" />,
    a: ({ href, children }) => (
      <Link href={href || '#'} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline">
        {children}
      </Link>
    ),
    img: (props) => (
      <Image
        className="rounded-lg shadow-md my-8"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{ width: '100%', height: 'auto' }}
        width={800} 
        height={600} 
        {...(props as ImageProps)}
      />
    ),
    table: ({ children }) => <table className="w-full my-8 border-collapse">{children}</table>,
    th: ({ children }) => <th className="p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 font-semibold text-left">{children}</th>,
    td: ({ children }) => <td className="p-2 border border-gray-300 dark:border-gray-700">{children}</td>,
    ...components,
  };
}