import React from 'react';
import ArticleCard from './ArticleCard';

const articles = [
  {
    title: "Article 1",
    description: "Description for article 1",
    image: "https://source.unsplash.com/random/800x600/?news1",
    url: "https://example.com/article1"
  },
  {
    title: "Article 2",
    description: "Description for article 2",
    image: "https://source.unsplash.com/random/800x600/?news2",
    url: "https://example.com/article2"
  },
  {
    title: "Article 3",
    description: "Description for article 3",
    image: "https://source.unsplash.com/random/800x600/?news3",
    url: "https://example.com/article3"
  }
];

const ArticleList: React.FC = () => {
  return (
    <div>
      {articles.map((article, index) => (
        <ArticleCard
          key={index}
          title={article.title}
          description={article.description}
          image={article.image}
          url={article.url}
        />
      ))}
    </div>
  );
}

export default ArticleList;