'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ArticlesView from '@/components/ArticlesView';
import { useDebounce } from 'use-debounce';

interface Article {
  id: string;
  url: string;
  headline: string;
  paragraphs: string;
  source: string;
  insertion_date: string;
  entities: Array<{
    id: string;
    name: string;
    entity_type: string;
    locations: Array<{
      name: string;
      type: string;
      coordinates: number[] | null;
    }>;
  }>;
  tags: Array<{
    id: string;
    name: string;
  }>;
  classification: {
    news_category: string;
    secondary_categories: string[];
    keywords: string[];
    geopolitical_relevance: number;
    legislative_influence_score: number;
    international_relevance_score: number;
    democratic_process_implications_score: number;
    general_interest_score: number;
    spam_score: number;
    clickbait_score: number;
    fake_news_score: number;
    satire_score: number;
  } | null;
}

interface ScoreField {
  name: string;
  min: number;
  max: number;
}

const scoreFields: ScoreField[] = [
  { name: "general_interest_score", min: 0, max: 10 },
  { name: "geopolitical_relevance", min: 0, max: 10 },
  { name: "legislative_influence_score", min: 0, max: 10 },
  { name: "international_relevance_score", min: 0, max: 10 },
  { name: "democratic_process_implications_score", min: 0, max: 10 },
];

const ScoreInput: React.FC<{ value: { min: number; max: number }; onChange: (value: { min: number; max: number }) => void; name: string }> = ({ value, onChange, name }) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, min: Number(e.target.value) });
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, max: Number(e.target.value) });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-2">
        <Input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={value.min}
          onChange={handleMinChange}
          className="w-20 bg-gray-800 text-white border-gray-700"
        />
        <Input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={value.max}
          onChange={handleMaxChange}
          className="w-20 bg-gray-800 text-white border-gray-700"
        />
      </div>
    </div>
  );
};

export default function TestTicker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<Record<string, { min: number; max: number }>>(() =>
    Object.fromEntries(scoreFields.map(field => [field.name, { min: 0, max: 10 }]))
  );
  const [sortBy, setSortBy] = useState<string>("geopolitical_relevance");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 5000);

  const fetchArticles = useCallback(async (query: string, skip: number, appliedFilters: Record<string, { min: number; max: number }>) => {
    setIsLoading(true);
    setError(null);
    try {
      const filtersJson = JSON.stringify(appliedFilters);
      const response = await fetch(`http://localhost:5434/articles?search_query=${encodeURIComponent(query)}&search_type=text&skip=${skip}&limit=20&sort_by=${sortBy}&sort_order=${sortOrder}&filters=${encodeURIComponent(filtersJson)}`, {
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.detail}`);
      }

      const result = await response.json();
      console.log('API Response:', JSON.stringify(result, null, 2)); // Print the JSON response
      setArticles(prevArticles => (skip === 0 ? result : [...prevArticles, ...result]));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    if (debouncedSearchQuery) {
      setArticles([]);
      fetchArticles(debouncedSearchQuery, 0, filters);
    }
  }, [debouncedSearchQuery, filters, fetchArticles]);

  const handleFilterChange = (filterName: string, value: { min: number; max: number }) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  

  const loadMoreArticles = useCallback(() => {
    fetchArticles(searchQuery, articles.length, filters);
  }, [fetchArticles, searchQuery, articles.length, filters]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold">Article Search</h1>
      <Input
        type="text"
        placeholder="Search articles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-gray-800 text-white border-gray-700"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scoreFields.map((field) => (
          <div key={field.name} className="space-y-2 flex flex-col items-center">
            <label className="text-sm">{field.name.replace(/_/g, ' ')}</label>
            <ScoreInput
              value={filters[field.name]}
              onChange={(value) => handleFilterChange(field.name, value)}
              name={field.name}
            />
          </div>
        ))}
      </div>
      <div className="flex space-x-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-800 text-white border-gray-700 rounded"
        >
          {scoreFields.map((field) => (
            <option key={field.name} value={field.name}>
              {field.name.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="bg-gray-800 text-white border-gray-700 rounded"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {articles.length > 0 && (
        <div>
          <h2>API Response:</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(articles, null, 2)}
          </pre>
          <ArticlesView
            locationName=""
            articles={articles}
            isLoading={isLoading}
            error={error}
            fetchArticles={loadMoreArticles}
            resetArticles={() => setArticles([])}
          />
        </div>
      )}
    </div>
  );
}